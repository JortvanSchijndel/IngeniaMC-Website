/**
 * webhook.ts  (/api/webhook)
 *
 * Stripe webhook handler for post-payment fulfilment.
 *
 * Only `checkout.session.completed` events are acted upon. All others are
 * acknowledged with 200 so Stripe stops retrying them.
 *
 * Source of truth:
 *   This webhook no longer writes to a database. Ownership is derived entirely
 *   from Stripe — specifically, from the `product_ids` field stamped in
 *   session metadata by checkout.ts at session creation time. The webhook's
 *   only side-effect is ensuring the KV cache maps the username → customer ID
 *   so that /api/ownership can skip the Stripe search on future page loads.
 *
 * Idempotency:
 *   Stripe may replay webhooks. The KV write uses a simple put (last-write-wins)
 *   which is naturally idempotent — writing the same customer ID twice is safe.
 *   If you later add fulfilment side-effects (e.g. calling a game server API),
 *   reintroduce a processed_webhooks guard at that point.
 *
 * Why no line-item fetching here?
 *   The `product_ids` metadata is stamped at session creation in checkout.ts,
 *   so the webhook never needs to call stripe.checkout.sessions.listLineItems.
 *   This saves one Stripe API call per webhook invocation.
 */

export const prerender = false;

import Stripe from "stripe";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const ALLOWED_USERNAME_RE = /^[a-zA-Z0-9_]{1,16}$/;

/** KV key prefix for username → Stripe customer ID mappings. */
const KV_CUSTOMER_PREFIX = "customer:";

export const POST: APIRoute = async ({ request }) => {
    // Signature verification
    const sig = request.headers.get("stripe-signature");
    if (!sig) return new Response("Missing signature", { status: 400 });

    const rawBody = await request.text();

    let event: Stripe.Event;
    try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        event = await stripe.webhooks.constructEventAsync(
            rawBody,
            sig,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("[webhook] Signature verification failed:", err);
        return new Response("Invalid signature", { status: 400 });
    }

    // Only handle completed checkout sessions
    if (event.type !== "checkout.session.completed") {
        return new Response("Ignored", { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const username = session.metadata?.minecraft_username;
    const productIds = session.metadata?.product_ids; // Stamped by checkout.ts
    const customerId = session.customer as string | null;

    if (!username || !ALLOWED_USERNAME_RE.test(username) || !customerId) {
        return new Response("Invalid session data", { status: 400 });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    try {
        // Save to Customer Metadata

        // 1. Fetch current customer to see what they already own
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

        // 2. Merge existing metadata with the new productIds
        const existingOwned = customer.metadata?.owned_products || "";
        const ownedSet = new Set(existingOwned.split(",").filter(Boolean));

        if (productIds) {
            productIds.split(",").forEach(id => ownedSet.add(id.trim()));
        }

        // 3. Save the combined list back to the Stripe Customer
        await stripe.customers.update(customerId, {
            metadata: {
                owned_products: Array.from(ownedSet).join(",")
            }
        });

        // Update KV as a secondary cache for the Username -> CustomerID mapping
        const kvKey = KV_CUSTOMER_PREFIX + username.toLowerCase();
        await env.CACHE.put(kvKey, customerId);

    } catch (err) {
        console.error("[webhook] Error updating customer metadata:", err);
        return new Response("Fulfilment Error", { status: 500 });
    }

    return new Response("ok", { status: 200 });
};