# 01-SECURITY-BASELINE: AFRIKYIA E-Commerce & Platform Security Baseline

- **Date:** 2026-10-21
- **Platform:** AFRIKYIA SUARL (`afrikyia.com`)
- **Evaluator:** Application Security & DevSecOps Engineering Team
- **Version:** 1.0.0
- **Classification:** Internal / Audit-Ready

---

## 1. Executive Summary
This document establishes the initial technical security baseline of the AFRIKYIA digital commerce platform and corporate portal following an exhaustive security audit. The assessment evaluated application code, dependency trees, authentication mechanisms, database access controls, payment webhook handling, and infrastructure configurations.

While the modern architecture (Next.js 16 App Router on Vercel with Supabase) provides a solid foundation, critical hardening is required across payment webhook validation, timing attack resistance, transaction idempotency, and defense-in-depth HTTP security headers.

---

## 2. Platform Architecture & Attack Surface

### 2.1 Technology Stack
- **Framework:** Next.js 16.1.6 (Turbopack, App Router, React 19.2.3)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Deployment:** Vercel Global Edge Network
- **Payment Gateway:** NexConnect (Mauritanian Wallets: Bankily, Masrvi, Sedad, Click)

### 2.2 Attack Surface Inventory
| Component | Route / Surface | Sensitivity | Access Level | Primary Threat Vectors |
|---|---|---|---|---|
| **Payment Initiation** | `POST /api/checkout/initiate` | High | Public | Price tampering, parameter injection, denial of service |
| **Payment Confirmation** | `POST /api/webhooks/nexconnect/confirmation` | **Critical** | Public / Bank | Forged webhooks, replay attacks, race conditions, timing attacks |
| **Payment Verification** | `GET /api/webhooks/nexconnect/verification` | High | Public / Bank | State enumeration, unauthorized status probing |
| **Order Status Poller** | `GET /api/checkout/status` | Medium | Public | Information disclosure, license enumeration |
| **Contact Form** | `POST /api/messages` | Low-Medium | Public | Spam, request flooding, XSS payload delivery |
| **Admin Authentication** | `POST /api/admin/session` | High | Public | Brute force, credential stuffing |
| **Admin Operations** | `GET,POST /api/admin/*`, `/api/biz/*` | **Critical** | Authenticated Admin | Privilege escalation, CSRF, unauthorized ledger access |
| **Store Frontend** | `/[locale]#products`, `CheckoutModal` | Medium | Public | Client-side state manipulation |

---

## 3. Vulnerability Findings & Risk Classification

### Summary Matrix
| ID | Finding | Severity | CVSS 3.1 | Status |
|---|---|---|---|---|
| **VULN-01** | Non-constant-time secret comparison in Webhook Auth | **High** | 7.5 | Open (Remediation in Phase 2) |
| **VULN-02** | Absence of dedicated Webhook Idempotency & Audit Table | **High** | 7.1 | Open (Remediation in Phase 2) |
| **VULN-03** | Missing Out-of-Band Consultation Verification Before Fulfillment | **High** | 7.4 | Open (Remediation in Phase 2) |
| **VULN-04** | Missing HTTP Security Headers (CSP, HSTS, X-Content-Type) | **Medium** | 6.5 | Open (Remediation in Phase 3) |
| **VULN-05** | Outdated SheetJS (`xlsx`) library vulnerable to Prototype Pollution | **Medium** | 6.0 | Remediated / Sandbox Isolated |
| **VULN-06** | Lack of rate limiting on sensitive checkout initiation | **Medium** | 5.3 | Open (Remediation in Phase 3) |
| **VULN-07** | Client price override exposure risk | **Low** | 3.8 | Remediated (Server calculates catalog pricing) |

---

## 4. Technical Deep-Dive of Identified Risks

### 4.1 VULN-01: Timing Attack on Webhook Authentication
- **Location:** `src/lib/nexconnect/client.ts` (`verifyWebhookAuth`)
- **Analysis:** Authentication currently relies on standard string equality (`providedKey === expectedSecret`). While timing attacks over network latency are challenging, standard cryptographic practices (OWASP ASVS 5.0 §3.2.3) require `crypto.timingSafeEqual` over fixed-length buffer hashes (SHA-256) to eliminate side-channel timing leaks.
- **Remediation:** Implement `crypto.timingSafeEqual` in `src/lib/nexconnect/security.ts`.

### 4.2 VULN-02: Absence of Payment Idempotency & Audit Trail Table
- **Location:** Database schema and webhook route.
- **Analysis:** Currently, webhook deduplication relies only on checking `order.status === 'paid'`. If concurrent webhooks arrive simultaneously before the database transaction completes, a race condition could trigger duplicate license generation. Furthermore, no immutable event audit log (`store_payment_audit_logs`) records the raw webhook payload, source IP, and processing timestamp.
- **Remediation:** Introduce `store_payment_audit_logs` table with unique constraint on `(provider, provider_tx_id)` and atomic status locking.

### 4.3 VULN-03: Secondary Bank Verification (Independent State Query)
- **Location:** `src/app/api/webhooks/nexconnect/confirmation/route.ts`
- **Analysis:** A webhook received by an application server should ideally be cross-verified out-of-band against the bank's consultation API (`/consulte_paiement`) using the receipt number `numero_recu` before irreversible digital goods delivery.
- **Remediation:** Add automated server-to-bank consultation check prior to finalizing high-value subscriptions.

### 4.4 VULN-04: HTTP Security Headers
- **Location:** `next.config.ts`
- **Analysis:** The application currently runs with default headers. Missing headers:
  - `Content-Security-Policy`: Protects against XSS and data injection.
  - `Strict-Transport-Security` (HSTS): Enforces TLS and protects against protocol downgrade.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing.
  - `X-Frame-Options: SAMEORIGIN` / `DENY`: Prevents clickjacking attacks.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes referrer leakage.
  - `Permissions-Policy`: Restricts camera, microphone, and geolocation API usage.
- **Remediation:** Inject strict security headers via `next.config.ts`.

---

## 5. Remediation Roadmap

1. **Immediate (Phase 2):**
   - Timing-safe HMAC / Api-Key comparison.
   - Idempotency guard and atomic state machine (`CREATED` -> `PENDING` -> `PAID` / `FAILED`).
   - Immutable audit logging table `store_payment_audit_logs`.
2. **Intermediate (Phase 3 & 4):**
   - Inject HTTP Security Headers.
   - Comprehensive automated payment test suite (TDD).
   - Reconciliation engine comparing internal ledger to bank statements.
3. **Public Assurance (Phase 6):**
   - Bilingual AFRIKYIA Security & Trust Center (`/security`).
   - Responsible vulnerability disclosure program.
