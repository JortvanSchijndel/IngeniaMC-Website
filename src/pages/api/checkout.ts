/**
 * checkout.ts  (/api/checkout)
 *
 * Creates a Stripe Checkout Session from the client's cart payload.
 *
 * Customer resolution (no database required):
 *   1. Check KV for an existing `customer:<username_lower>` entry.
 *   2. If not in KV, search Stripe customers by `minecraft_username` metadata.
 *   3. If still not found, create a new Stripe customer and cache in KV.
 *   The resolved (or newly created) customer ID is attached to the Checkout
 *   Session so all purchases are consolidated under one customer record.
 *
 * Ownership verification:
 *   Check whether the customer already has the requested products by reading
 *   metadata from their Stripe Customer record.
 *
 * Security:
 *   - All price IDs are validated against a server-side allow-list.
 *   - Duplicate items and mismatched productId/priceId pairs are rejected.
 *   - The Minecraft username is embedded in session metadata and displayed
 *     as a read-only field on the Stripe-hosted page.
 */

export const prerender = false;

import Stripe from "stripe";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

/** Maps every valid Stripe Price ID → internal product ID. */
const PRICE_TO_PRODUCT = new Map<string, string>([
    ["price_1QbIMnGWjhmIDSsrrGrFIAGI", "vip"],
]);

const ALLOWED_USERNAME_RE = /^[a-zA-Z0-9_]{1,16}$/;

/** KV key prefix for username → Stripe customer ID mappings. */
const KV_CUSTOMER_PREFIX = "customer:";

interface CartItemPayload {
    stripePriceId: string;
    productId?: string;
    quantity: number;
}

interface RequestBody {
    cart: CartItemPayload[];
    username: string;
}

export const POST: APIRoute = async ({ request }) => {
    // Content-type guard
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return jsonError("INVALID_CONTENT_TYPE", 400);
    }

    // Parse + validate body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return jsonError("INVALID_JSON", 400);
    }

    if (!body || typeof body !== "object") return jsonError("INVALID_BODY", 400);

    const { cart, username } = body as Partial<RequestBody>;

    if (typeof username !== "string" || !ALLOWED_USERNAME_RE.test(username)) {
        return jsonError("INVALID_USERNAME", 400);
    }

    if (!Array.isArray(cart) || cart.length === 0) {
        return jsonError("CART_EMPTY", 400);
    }

    // Cart item validation
    const seenPriceIds = new Set<string>();

    for (const item of cart) {
        if (!item || typeof item !== "object") return jsonError("INVALID_CART_ITEM", 400);

        const { stripePriceId, quantity, productId } = item;

        if (typeof stripePriceId !== "string" || !PRICE_TO_PRODUCT.has(stripePriceId)) {
            return jsonError("UNKNOWN_PRICE_ID", 400);
        }
        if (quantity !== 1) return jsonError("INVALID_QUANTITY", 400);
        if (seenPriceIds.has(stripePriceId)) return jsonError("DUPLICATE_ITEM", 400);

        seenPriceIds.add(stripePriceId);

        // Client-sent productId is optional but must match the allow-list if present
        const expectedProductId = PRICE_TO_PRODUCT.get(stripePriceId)!;
        if (productId !== undefined && productId !== expectedProductId) {
            return jsonError("PRODUCT_MISMATCH", 400);
        }
    }

    // Resolve or create the Stripe customer
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const kvKey = KV_CUSTOMER_PREFIX + username.toLowerCase();
    let customerId: string | null = null;

    // Step 1: KV lookup (cheapest path)
    try {
        customerId = await env.CACHE.get(kvKey);
    } catch (err) {
        console.warn("[checkout] KV read failed, continuing without cache:", err);
    }

    // Step 2: Stripe customer search (only if KV missed)
    if (!customerId) {
        try {
            const existing = await stripe.customers.search({
                query: `metadata["minecraft_username"]:"${username}"`,
                limit: 1,
            });

            if (existing.data.length > 0) {
                customerId = existing.data[0].id;
                // Backfill KV so future requests skip this search
                await env.CACHE.put(kvKey, customerId).catch((err: unknown) =>
                    console.warn("[checkout] KV backfill failed:", err)
                );
            }
        } catch (err) {
            console.error("[checkout] Stripe customer search failed:", err);
            return jsonError("STRIPE_ERROR", 500);
        }
    }

    // Step 3: Create a new customer (first-time buyer)
    if (!customerId) {
        try {
            const customer = await stripe.customers.create({
                name: username,
                metadata: { minecraft_username: username },
            });
            customerId = customer.id;

            await env.CACHE.put(kvKey, customerId).catch((err: unknown) =>
                console.warn("[checkout] KV write failed after customer create:", err)
            );
        } catch (err) {
            console.error("[checkout] Stripe customer creation failed:", err);
            return jsonError("STRIPE_ERROR", 500);
        }
    }

    // Ownership check — read directly from Customer metadata
    try {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const ownedProductIdsString = customer.metadata?.owned_products || "";
        const ownedProductIds = new Set(ownedProductIdsString.split(",").filter(Boolean));

        for (const item of cart) {
            const productId = PRICE_TO_PRODUCT.get(item.stripePriceId)!;
            if (ownedProductIds.has(productId)) {
                return jsonError("ALREADY_OWNED", 400);
            }
        }
    } catch (err) {
        console.error("[checkout] Ownership check failed:", err);
        return jsonError("STRIPE_ERROR", 500);
    }

    // Create Stripe Checkout Session
    try {
        const origin = new URL(request.url).origin;

        // Collect all product IDs in this purchase to stamp on the session
        const purchasedProductIds = cart
            .map((item) => PRICE_TO_PRODUCT.get(item.stripePriceId)!)
            .join(",");

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer: customerId,
            line_items: cart.map((item) => ({
                price: item.stripePriceId,
                quantity: 1,
            })),
            success_url: `${origin}/store/success`,
            cancel_url: `${origin}/store/failed`,
            custom_text: {
                submit: { message: `Purchasing for player: ${username}` },
            },
            // Read-only username shown on the Stripe-hosted page for transparency
            custom_fields: [
                {
                    key: "minecraft_username",
                    label: { type: "custom", custom: "Minecraft Username" },
                    type: "dropdown",
                    dropdown: {
                        options: [{ label: username, value: "username" }],
                        default_value: "username",
                    },
                },
            ],
            metadata: {
                minecraft_username: username,
                product_ids: purchasedProductIds,
            },
            // 30-minute expiry prevents abandoned sessions accumulating
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });

        return json({ url: session.url }, 200);
    } catch (err) {
        console.error("[checkout] Stripe session creation failed:", err);
        return jsonError("STRIPE_ERROR", 500);
    }
};

// Response helpers

function json(data: unknown, status: number): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
        },
    });
}

function jsonError(code: string, status: number): Response {
    return json({ error: code }, status);
}