# 08-INDEPENDENT-AUDIT-READINESS: Package & Evidence Dossier for Independent Auditors

- **Organization:** AFRIKYIA SUARL
- **Target Systems:** `afrikyia.com` Store, NexConnect Webhook Ingestion, Supabase Database Vault
- **Prepared For:** Qualified Third-Party Cybersecurity & Financial Audit Firms
- **Classification:** Confidential — Auditor Handover Package
- **Date:** October 2026

---

## 1. Audit Scope & Boundaries

### Included in Scope (White-Box / Grey-Box Audit):
- **Web Application & Storefront:** Next.js 15 App Router (`src/app/[locale]/...`)
- **Payment Ingestion Pipeline:**
  - `POST /api/webhooks/nexconnect/confirmation`
  - `GET /api/webhooks/nexconnect/verification`
  - `POST /api/checkout/initiate`
  - `GET /api/checkout/status`
- **Database Access Control:** Supabase PostgreSQL Row Level Security (RLS) policies and schemas (`scripts/create-tables.sql`)
- **Cryptographic Utilities:** `src/lib/nexconnect/security.ts`
- **Reconciliation Engine:** `src/lib/reconciliation.ts`
- **Edge Perimeter:** Next.js HTTP Security Headers (`src/lib/securityHeaders.ts`)

### Excluded from Scope:
- Core banking mainframe infrastructure of Mauritanian financial institutions (Bankily, Masrvi, Sedad).
- NexConnect upstream internal server architecture.
- Third-party hosting provider physical data centers (Vercel, AWS).

---

## 2. Payment Flow Sequence Diagram

```
Customer              Afrikyia Store           NexConnect Gateway          Bank Core (Bankily/Sedad)
   │                        │                         │                              │
   │── 1. Select Product ──►│                         │                              │
   │   & Phone Number       │                         │                              │
   │                        │── 2. Create Order ─────►│                              │
   │                        │   (pending, amount)     │                              │
   │                        │                         │── 3. Push USSD/OTP ─────────►│
   │                        │                         │   to Customer Phone          │
   │◄── 4. Prompt for OTP ──│                         │                              │
   │    or Payment Approval │                         │                              │
   │                        │                         │                              │
   │── 5. Approve in App ───────────────────────────────────────────────────────────►│
   │                        │                         │                              │
   │                        │                         │◄── 6. Payment Captured ──────│
   │                        │                         │                              │
   │                        │◄── 7. POST Webhook ─────│                              │
   │                        │    - Api-Key Header     │                              │
   │                        │    - numero_recu        │                              │
   │                        │    - montant            │                              │
   │                        │                         │                              │
   │                        │── 8. Constant-Time Auth ────────────────────────────────┐
   │                        │   Amount Validation                                     │
   │                        │   Idempotency Check                                     │
   │                        │   Generate License                                      │
   │                        │   Save SHA-256 Audit Log ◄──────────────────────────────┘
   │                        │                         │
   │                        │── 9. Return HTTP 200 ──►│
   │                        │   {code: 200, OK}       │
   │                        │                         │
   │◄── 10. Display License ─│                         │
   │    & Send Confirmation │                         │
```

---

## 3. Comprehensive API Inventory

| Path | Method | Auth Level | Purpose | Rate Limited |
| :--- | :--- | :--- | :--- | :--- |
| `/api/checkout/initiate` | POST | Public | Initializes order with server-authorized pricing | Yes |
| `/api/checkout/status` | GET | Public | Polls order state by `invoice_id` | Yes |
| `/api/webhooks/nexconnect/verification` | GET | Api-Key | Health & handshake callback for gateway | Yes |
| `/api/webhooks/nexconnect/confirmation` | POST | Api-Key | Financial payment confirmation & license issuance | Yes |
| `/api/admin/store/orders` | GET | Admin Session | Auditing & order monitoring dashboard | Yes |
| `/api/contact` | POST | Public | Contact form with IP hash & rate limiting | Yes |

---

## 4. Risk Register (Residual Post-Hardening State)

| Threat ID | Threat Description | Inherent Risk | Mitigating Control | Residual Risk |
| :--- | :--- | :--- | :--- | :--- |
| **TR-01** | Forged payment confirmation | Critical | Constant-time `Api-Key` verification + TLS 1.3 | **Low** |
| **TR-02** | Replay of previous receipt | Critical | Unique partial index on `numero_recu` + idempotent short-circuit | **Low** |
| **TR-03** | Amount tampering in callback | High | Exact numerical match against order amount; auto-dispute flag | **Low** |
| **TR-04** | Client price modification | High | Server-side price authority in `catalog.ts` | **Low** |
| **TR-05** | Delayed negative callback | Medium | Terminal state lock prevents regression from `paid` to `failed` | **Low** |
| **TR-06** | Dropped bank callback | Medium | Automated daily reconciliation engine (`reconciliation.ts`) | **Low** |
| **TR-07** | Clickjacking / Framing | Medium | `X-Frame-Options: DENY` & `frame-ancestors 'none'` in CSP | **Low** |

---

## 5. Auditor Verification Checklist & Evidence Locker

Auditors can independently verify all claims by executing the following commands in the codebase:

1. **Verify 100% Passing Test Suite:**
   ```bash
   npm test
   ```
   *Expected:* 16 suites pass, 84 tests pass.

2. **Verify Payment Webhook Attack Resistance:**
   ```bash
   npm test -- security.test.ts
   ```
   *Expected:* 19 passing assertions verifying forged secrets, replays, amount tampering, and status rollbacks.

3. **Verify Security Headers Configuration:**
   ```bash
   npm test -- securityHeaders.test.ts
   ```
   *Expected:* 6 passing assertions verifying CSP, HSTS Preload, and iframe restrictions.

4. **Verify Type-Safety & Build Integrity:**
   ```bash
   npx tsc --noEmit
   npm run build
   ```
   *Expected:* Zero compiler errors, successful Next.js production build output.
