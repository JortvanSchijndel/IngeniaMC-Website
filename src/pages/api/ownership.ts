/**
 * ownership.ts  (/api/ownership)
 *
 * Returns the set of product IDs that a given Minecraft username already owns,
 * by looking up their Stripe customer record.
 *
 * Lookup strategy (cheapest → most expensive):
 *   1. KV cache  — maps `customer:<username_lower>` → Stripe customer ID.
 *   2. Stripe search — if no KV entry, search Stripe customers by metadata.
 *   3. No customer found → return an empty owned set.
 *
 * Owned products are derived from `owned_products` metadata on the Customer object,
 * which is updated by the webhook on successful purchase.
 */

export const prerender = false;

import Stripe from "stripe";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const ALLOWED_USERNAME_RE = /^[a-zA-Z0-9_]{1,16}$/;

/** KV key prefix for username → Stripe customer ID mappings. */
const KV_CUSTOMER_PREFIX = "customer:";

export const GET: APIRoute = async ({ url }) => {
    const username = url.searchParams.get("username")?.trim() ?? "";

    if (!username || !ALLOWED_USERNAME_RE.test(username)) {
        return jsonError("INVALID_USERNAME", 400);
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const kvKey = KV_CUSTOMER_PREFIX + username.toLowerCase();

    // 1. Try to resolve the customer ID from KV
    let customerId: string | null = null;

    try {
        customerId = await env.CACHE.get(kvKey);
    } catch (err) {
        console.warn("[ownership] KV read failed, falling back to Stripe search:", err);
    }

    // 2. KV miss — search Stripe for a customer with this username
    if (!customerId) {
        try {
            const customers = await stripe.customers.search({
                query: `metadata["minecraft_username"]:"${username}"`,
                limit: 1,
            });

            if (customers.data.length > 0) {
                customerId = customers.data[0].id;

                await env.CACHE.put(kvKey, customerId).catch((err: unknown) =>
                    console.warn("[ownership] KV write failed:", err)
                );
            }
        } catch (err) {
            console.error("[ownership] Stripe customer search failed:", err);
            return jsonError("STRIPE_ERROR", 500);
        }
    }

    // 3. No customer → no owned products (new user)
    if (!customerId) {
        return json({ ownedProductIds: [] }, 200);
    }

    // 4. Fetch ownership set from Customer metadata
    try {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

        const ownedString = customer.metadata?.owned_products || "";
        const ownedProductIds = ownedString.split(",").filter(Boolean);

        return json({ ownedProductIds }, 200);

    } catch (err) {
        console.error("[ownership] Stripe metadata retrieval failed:", err);
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