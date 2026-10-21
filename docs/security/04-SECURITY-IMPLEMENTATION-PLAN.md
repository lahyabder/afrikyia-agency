# 04-SECURITY-IMPLEMENTATION-PLAN: Hardening Architecture & Phased Execution

- **Target System:** AFRIKYIA Store & Electronic Payment Platform (`afrikyia.com`)
- **Engine:** Next.js App Router, Supabase Vault, NexConnect Gateway
- **Branch:** `claude/security-hardening`
- **Lead Engineers:** Principal AppSec & Full-Stack Security Engineering

---

## 1. Executive Summary & Objective

The objective of this security implementation plan is to transition AFRIKYIA's e-commerce and digital licensing operations into a provably secure, audited, and resilient state. The work is structured into four sequential technical pillars:
1. **Pillar I:** Cryptographic and constant-time webhook defense against forgery, timing side-channels, and replay attacks.
2. **Pillar II:** Strict data-layer guarantees (idempotency, atomic transactions, immutable SHA-256 audit logging).
3. **Pillar III:** Application-layer and perimeter hardening (strict CSP, HSTS preload, least-privilege RLS).
4. **Pillar IV:** Transparent, evidence-based public trust via the bilingual Security & Trust Center (`/security`).

---

## 2. Architecture & Control Matrix

| Component | Identified Risk | Technical Control Implemented | Verification Method |
| :--- | :--- | :--- | :--- |
| **NexConnect Webhook** | Timing side-channel credential recovery | Constant-time comparison with SHA-256 buffer equalization | `src/lib/nexconnect/security.test.ts` |
| **Payment Confirmation** | Replay of previous receipts to obtain free software licenses | Idempotent terminal state short-circuit + unique database constraints | `src/app/api/webhooks/nexconnect/confirmation/security.test.ts` |
| **Checkout Flow** | Client-side price tampering | Server-side price authority (`catalog.ts`) and amount validation | `src/lib/nexconnect/security.test.ts` |
| **Database Transactions** | Concurrent callback duplicate race condition | Unique index on `store_orders(numero_recu)` + status transitions | `scripts/create-tables.sql` |
| **Audit Records** | Ephemeral, untraceable bank callbacks | Immutable `store_payment_audit_logs` with SHA-256 payload digest | Schema validation |
| **HTTP Transport** | Clickjacking, MIME confusion, XSS | Content-Security-Policy, HSTS Preload, X-Frame-Options: DENY | `src/lib/securityHeaders.test.ts` |
| **Reconciliation** | Silent callback drops by cellular carrier | Automated daily reconciliation engine | `src/lib/reconciliation.test.ts` |

---

## 3. State Machine Specification

Orders progress through a strictly defined unidirectional state machine:

```
[ CREATED ] 
     │
     ▼
[ PENDING ] ───────────────┐ (timeout/abandon)
     │                     ▼
     │ (webhook)      [ EXPIRED ]
     ▼
[ VERIFYING ]
     ├──(amount mismatch)────────► [ DISPUTED ] (requires manual investigation)
     ├──(bad signature/key)──────► [ REJECTED / 401 ]
     └──(exact match)────────────► [ PAID ]
                                      │ (terminal)
                                      ├──► Cannot transition to FAILED
                                      └──► Replays return cached receipt
```

### State Invariant Rules:
1. Once an order enters `PAID`, no subsequent webhook (e.g., delayed cancellation or error notification) may downgrade its status.
2. An order cannot reach `PAID` without both an `id_transaction` and a `numero_recu`.
3. Receipt numbers (`numero_recu`) are enforced globally unique across all fulfilled orders.

---

## 4. Implementation Phasing

### Phase 1: Cryptographic Utilities & Core Unit Tests (Completed)
- Implemented `timingSafeSecretMatch`, `calculatePayloadHash`, and `validateAmountMatch` in `src/lib/nexconnect/security.ts`.
- Developed exhaustive unit test suite `src/lib/nexconnect/security.test.ts` (12 tests passing).

### Phase 2: Route Protection & Idempotency Refactor (Completed)
- Hardened `src/app/api/webhooks/nexconnect/confirmation/route.ts`.
- Added automated dispute flagging when `montant` differs from stored order amount.
- Added comprehensive fraud suite `src/app/api/webhooks/nexconnect/confirmation/security.test.ts` (7 scenarios passing).

### Phase 3: Perimeter Defense & Database Schema (Completed)
- Configured production security headers in `src/lib/securityHeaders.ts` and `next.config.ts`.
- Created database migration script for `store_payment_audit_logs` and unique receipt constraint in `scripts/create-tables.sql`.

### Phase 4: Reconciliation & Monitoring Engine (Completed)
- Designed `reconcileTransactions` in `src/lib/reconciliation.ts` to identify ghost orders, amount mismatches, unfulfilled captured payments, and duplicate receipt collisions.
- Validated with unit test `src/lib/reconciliation.test.ts`.

### Phase 5: Bilingual Public Trust Center (Completed)
- Implemented `/security` in Arabic and French in `src/app/[locale]/security/page.tsx` and `layout.tsx`.
- Linked `/security` in global footer, sitemap, and localized dictionaries.
- Validated via `@testing-library/react` in `src/app/[locale]/security/SecurityPage.test.tsx`.

### Phase 6: Continuous Integration & Security Gates (Completed)
- Implemented GitHub Actions security gate workflow in `.github/workflows/security.yml`.
