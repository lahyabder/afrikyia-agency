# Plan: Afrikyia Digital Store & NexConnect Payment Gateway Integration

- **Status:** completed
- **Size:** L   ·   **Branch:** `main`
- **Owner approval:** 2026-10-20   ·   **Codex plan review:** none
- **Created:** 2026-10-20 by Antigravity   ·   **Updated:** 2026-10-20

## Goal and acceptance criteria
Enable visitors of `afrikyia.com` to purchase digital products directly using local Mauritanian payment wallets (Bankily, Masrvi, Sedad, Click, etc.) via the NexConnect gateway, with an extensible digital commerce architecture that supports:
1. **Afrikyia Software Suite:**
   - **DIFTAR (دفتر):** Monthly or yearly recurring subscriptions for 1, 2, 3, or 4 devices.
   - **SANAD (سند):** One-time lifetime license for 1,000 MRU.
   - **ELBET (البت):** Free platform access with in-app paid services.
   - **BADILA (بديلة):** Free community platform with direct access.
2. **Future Digital Goods:**
   - E-books and publications (PDF/ePub digital delivery).
   - Films, video content, and streaming tickets.
   - Audio tracks and musical albums.
   - Professional digital services and custom solutions.

### Observable acceptance criteria:
- **Product Storefront UI:** Clean, ultra-minimalist UI seamlessly integrated into Afrikyia's design system allowing users to select plans/licenses or access free apps.
- **Checkout Modal:** Responsive checkout drawer allowing customer information entry (name, phone, email) and wallet selection.
- **NexConnect Request Generation:** Backend properly formats requests with `Authorization: Api-Key <KEY>`, generates unique `id_facture` (>= 8 chars), and retrieves `code_paiement`.
- **Payment Code Display Screen:** Interactive modal displaying 6-digit payment code, copy button, step-by-step wallet instructions, and live status poller.
- **Secure Webhook Callback:** `POST /api/webhooks/nexconnect/confirmation` verifies `Authorization: Api-Key`, validates invoice existence and exact amount, updates order status, and responds with HTTP 200 `{ code: 200, Message: "OK", numero_recu: "..." }`.
- **Fallback Verification Endpoint:** `GET /api/webhooks/nexconnect/verification?id_facture=...` returns `{"statut": "paye"}` or `{"statut": "non_paye"}`.
- **Automated Fulfillment:** Generates unique license codes or download tokens upon confirmed payment.
- **Admin Revenue Monitoring:** Dedicated administrative dashboard at `/admin/orders` to monitor real-time sales, payment channels, receipts, and export transaction ledgers to CSV/Excel.

## Context and assumptions
- **NexConnect Documentation:** Reviewed official ReadMe docs at `nex-connect.readme.io/reference/getting-started-with-your-api.md`.
  - Base URL (Sandbox): `https://nexpay-653e0b7d7b24.herokuapp.com/api`
  - Auth header: `Authorization: Api-Key <API_KEY>`
  - Key endpoints: `/moyens_paiement`, `/demande_paiement`, `/consulte_paiement`, plus callbacks provided by Afrikyia.
- **Inspected Products:**
  - `diftar.online/pricing`: 1 dev (1,000 MRU/mo, 11,000 MRU/yr), 2 devs (1,500 MRU/mo, 16,500 MRU/yr), 3 devs (2,000 MRU/mo, 22,000 MRU/yr), 4 devs (2,500 MRU/mo, 27,500 MRU/yr).
  - `sanadrim.com`: Lifetime license at 1,000 MRU once, linked to phone number.
  - `elbet.art`: Free platform access, in-app paid poetic services.
  - `badila.online`: 100% free direct-exchange platform.
- **Technology Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase backend.
- **Security Constraint:** Never commit raw API keys. Load from `.env.local` via server-side environment variables.

## Tasks (all executed via strict TDD RED → GREEN → REFACTOR cycle)
| # | Task | Test written first (file › case) | RED | GREEN | Refactor | Status |
|---|------|----------------------------------|:---:|:---:|:---:|:---:|
| 1 | Digital Catalog Engine & Pricing Calculator | `src/data/catalog.test.ts` | ✓ | ✓ | ✓ | Completed |
| 2 | NexConnect Client & Request Builders | `src/lib/nexconnect/client.test.ts` | ✓ | ✓ | ✓ | Completed |
| 3 | Checkout Initiation API Route | `src/app/api/checkout/initiate/route.test.ts` | ✓ | ✓ | ✓ | Completed |
| 4 | Webhook Confirmation & Verification Endpoints | `src/app/api/webhooks/nexconnect/confirmation/route.test.ts` & `verification/route.test.ts` | ✓ | ✓ | ✓ | Completed |
| 5 | Order Status Polling & License Generator | `src/app/api/checkout/status/route.test.ts` | ✓ | ✓ | ✓ | Completed |
| 6 | Checkout Modal UI & Wallet Code Presentation | `src/components/store/CheckoutModal.test.tsx` | ✓ | ✓ | ✓ | Completed |
| 7 | Integration into Main Products Section | `src/components/sections/ApplicationsStore.test.tsx` | ✓ | ✓ | ✓ | Completed |
| 8 | Admin Orders & Revenue Monitoring Dashboard | `src/app/api/admin/store/orders/route.test.ts` & `OrdersPage.test.tsx` | ✓ | ✓ | ✓ | Completed |

## QA Verification
- [x] Full suite: `npm test` (12 test suites, 50 tests passing)
- [x] Type check: `npx tsc --noEmit` (0 errors)
- [x] Lint: `npx eslint` on all store files (0 errors, 0 warnings)
- [x] Build: `npm run build` (Turbopack production build succeeded; all 32 routes compiled)

## Execution log
- **Catalog Engine:** Created `src/data/catalog.ts` with typed product registry and pricing math. 6 unit tests passing.
- **NexConnect Client:** Built `src/lib/nexconnect/client.ts` implementing `Api-Key` headers, invoice ID generation, error parsing, and payment consultation. 8 unit tests passing.
- **Checkout Initiate API:** Created `src/app/api/checkout/initiate/route.ts` validating inputs, storing order in `store_orders`, calling NexConnect, and returning payment code. 3 unit tests passing.
- **Webhooks:** Created `src/app/api/webhooks/nexconnect/confirmation/route.ts` and `verification/route.ts` with strict API key verification, idempotent updates, and license creation. 7 unit tests passing.
- **Status Route:** Created `src/app/api/checkout/status/route.ts` returning order state and generated license for active frontend polling. 3 unit tests passing.
- **Checkout Modal UI:** Created `src/components/store/CheckoutModal.tsx` with device selector, period toggle, wallet guides (Bankily, Masrvi, Sedad, Click), and live polling. 3 unit tests passing.
- **Applications Integration:** Updated `src/components/sections/Applications.tsx` with direct purchase buttons for DIFTAR and SANAD. 1 unit test passing.
- **Admin Revenue Monitoring:** Created `src/app/api/admin/store/orders/route.ts` and `src/app/[locale]/admin/orders/page.tsx` with revenue metrics, breakdown, search/filters, and CSV export. 3 unit tests passing.
- **Database Schema:** Appended `store_orders` and `store_licenses` tables to `scripts/create-tables.sql` with indexes and RLS policies.

## Outcome
The AFRIKYIA digital store and NexConnect payment gateway integration is fully implemented, verified with 50 passing automated tests, cleanly integrated with the admin finance dashboard, and compiled in production mode.
