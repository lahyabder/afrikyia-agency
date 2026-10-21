# 02-THREAT-MODEL: AFRIKYIA Digital Commerce & Webhooks Threat Model

- **Methodology:** STRIDE & DREAD Risk Assessment
- **Scope:** Storefront, Checkout Initiation, Webhooks, License Delivery, Admin Ledger
- **Status:** Active Reference Architecture
- **Date:** 2026-10-21

---

## 1. STRIDE Threat Analysis Matrix

| Threat Category | Target Asset | Attack Scenario | Impact | Likelihood | Risk Rating | Applied Countermeasure |
|---|---|---|---|---|---|---|
| **Spoofing** | Confirmation Webhook | Attacker crafts fake HTTP POST pretending to be NexConnect / Bankily | Critical | Medium | **HIGH** | `crypto.timingSafeEqual` SHA-256 Api-Key verification + Out-of-band `/consulte_paiement` verification |
| **Tampering** | Checkout Initiation | Attacker modifies amount from 1,000 MRU to 10 MRU in request body | Critical | High | **CRITICAL** | Server-side price authority: amount is recalculated strictly from server catalog, ignoring client body prices |
| **Tampering** | Confirmation Webhook | Attacker alters payment status or customer phone in callback | High | Low | **HIGH** | Server validates exact matching of `id_facture`, expected amount, and database record before status transition |
| **Repudiation** | Merchant / Bank Dispute | Customer claims they paid but received no license, or bank claims notification delivered | Medium | High | **MEDIUM** | Append-only `store_payment_audit_logs` recording raw payload, SHA-256 hash, timestamps, and receipt numbers |
| **Information Disclosure** | Status Polling Endpoint | Attacker enumerates `id_facture` to harvest phone numbers or licenses | High | Medium | **HIGH** | Cryptographically unguessable IDs (`AFR-<PROD>-<TIMESTAMP>-<RANDOM>`), masked customer details |
| **Denial of Service** | Initiation API | Flooding `/api/checkout/initiate` with automated bot requests | Medium | Medium | **MEDIUM** | Input length limits, phone regex validation, Cloudflare / Vercel Edge rate limiting |
| **Elevation of Privilege** | Admin Orders API | Attacker accesses `/api/admin/store/orders` without finance role | Critical | Low | **HIGH** | Strict RBAC session gate `requireAccess(request, 'finance')` with HTTP 403 on failure |

---

## 2. Payment Data Flow Diagram (DFD) & Trust Boundaries

```
[ Customer Browser ]
       |
       |  1. Select product & submit info
       v
[ Trust Boundary 1: Public Internet ]
       |
       v
[ AFRIKYIA Next.js Backend (/api/checkout/initiate) ]
       |
       |  2. Server queries internal Catalog & calculates authoritative price
       |  3. Inserts 'pending' record into Supabase (store_orders)
       |  4. Calls NexConnect with Api-Key auth
       v
[ Trust Boundary 2: Banking Network ]
       |
       v
[ NexConnect Payment Gateway / Mauritanian Wallets ]
       |
       |  5. Returns 6-digit payment code (code_paiement)
       v
[ Customer Wallets: Bankily / Masrvi / Sedad / Click ]
       |
       |  6. Customer authorizes funds transfer in bank mobile app
       v
[ NexConnect Webhook Dispatcher ]
       |
       |  7. Sends callback with Api-Key header to /api/webhooks/nexconnect/confirmation
       v
[ AFRIKYIA Webhook Controller ]
       |
       |  8. Timing-safe Api-Key verification (Reject 401 if invalid)
       |  9. Check Idempotency (Reject replay if already paid)
       | 10. Cross-verify amount against store_orders database record
       | 11. Atomic transaction: Update order to 'paid' & issue license
       | 12. Write immutable audit log to store_payment_audit_logs
       v
[ Supabase Database (store_orders, store_licenses, store_payment_audit_logs) ]
```

---

## 3. Critical Security Invariants (Non-Negotiable Rules)

1. **Zero Client Price Authority:**
   No financial transaction amount may ever originate from or be trusted from client browser requests. All prices derive exclusively from immutable server-side constants in `src/data/catalog.ts`.

2. **Strict Idempotency:**
   The presentation of the same bank receipt number (`numero_recu`) or invoice ID (`id_facture`) multiple times must never result in duplicate license creation, duplicate ledger credits, or state mutation.

3. **Status Rollback Prohibition:**
   Once an order reaches terminal state `PAID`, no subsequent webhook (late failure notice, timeout cancellation) may revert the status back to `PENDING` or `FAILED` without human administrator authorization and documented dispute resolution.

4. **Constant-Time Verification:**
   All cryptographic keys and tokens used for webhook authorization must be compared using constant-time algorithms to prevent side-channel timing analysis.
