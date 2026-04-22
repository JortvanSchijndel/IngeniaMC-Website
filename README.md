# IngeniaMC Website

The official IngeniaMC Website.

- No backend needed, made for Cloudflare Pages using Cloudflare Page Functions
- Fully custom store using Stripe. No database. No Backend
- Custom link hub with all the IngeniaMC Social URL's

**Stack:** Astro · TypeScript · Tailwind CSS · Cloudflare Pages · Cloudflare KV · Stripe

---

## Local Development

### Prerequisites
- **Node.js** (22 or later recommended)
- **npm**
- **Stripe CLI** ([Install guide](https://stripe.com/docs/stripe-cli))

### 1. Environment Setup
Create a **`.dev.vars`** file in the root directory:

```ini
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ALLOWED_ORIGIN=http://localhost:4321
```

### 2. Stripe Webhooks
To handle payments locally, forward Stripe events to your dev server:
```bash
stripe listen --forward-to http://localhost:4321/api/stripe-webhook
```
*Copy the `whsec_` key printed by the CLI into your `.dev.vars` file.*

### 3. Run Development Server
```bash
npm run dev
```
The server will be available at [http://localhost:4321](http://localhost:4321).

---

This website has been made by: [JortvanSchijndel](https://github.com/JortvanSchijndel) with the help of several AI-tools like: Gemini Code Assist, Claude & ChatGPT
