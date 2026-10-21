# Plan: AFRIKYIA Platform Security Hardening, Payment Webhooks & Trust Center

- **Status:** completed
- **Size:** L   ·   **Branch:** `claude/security-hardening` @ `041df0c`
- **Owner approval:** 2026-10-21   ·   **Codex plan review:** none
- **Created:** 2026-10-21 by Antigravity   ·   **Updated:** 2026-10-21

## Goal and acceptance criteria
Transform `afrikyia.com` into a rigorously secured, audit-ready commercial digital storefront with:
1. **Hardened Payment Pipeline:** Eliminating risks of webhook forgery, timing attacks, replay fraud, double fulfillment, and client-side price tampering.
2. **Audit Trail & Idempotency:** End-to-end event logging (`store_payment_audit_logs`) and atomic state transitions preventing duplicate license delivery.
3. **Application & Infrastructure Hardening:** Strict HTTP Security Headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and input sanitization.
4. **Comprehensive Security Test Suite (TDD):** Automated regression tests proving resistance to forged callbacks, replay attacks, amount tampering, and concurrency.
5. **AFRIKYIA Security & Trust Center:** Bilingual (`/ar/security` & `/fr/security`) public trust center providing verifiable security commitments, payment wallet safeguards, standards alignment (OWASP ASVS), and responsible vulnerability disclosure policy without false claims.
6. **Documentation Package:** 10 mandatory security artifacts in `docs/security/`.

### Observable acceptance criteria:
- All payment webhooks reject non-timing-safe or invalid `Api-Key` headers with HTTP 401.
- Duplicate or replayed webhook events return idempotent responses without re-issuing licenses or mutating revenue.
- Mismatched amounts or currencies between incoming webhook and order database cause immediate rejection and quarantine.
- Complete security headers (HSTS, CSP, etc.) delivered on all responses.
- `npm audit` and static security scans executed with zero high/critical vulnerabilities.
- Dedicated Trust Center live at `/security` with pristine design conforming to AFRIKYIA brand standards.
- 10 comprehensive security reference documents saved in `docs/security/`.

## Context and assumptions
- Platform: Next.js 16.1.6, React 19, TypeScript 5, Supabase, Tailwind CSS 4.
- Gateways: NexConnect (supporting Mauritanian wallets: Bankily, Masrvi, Sedad, Click).
- Constraint: Zero modification to banking contracts, zero disruption to current store operations.
- Constraint: Never output or commit real secrets or credentials.

## Tasks (each one runs a full RED → GREEN → REFACTOR cycle)
| # | Task | Test written first (file › case) | RED | GREEN | Refactor |
|---|------|----------------------------------|:---:|:---:|:---:|
| 1 | Baseline Security & Dependency Audit | `npm audit` & static checks | ☑ | ☑ | ☑ |
| 2 | Timing-Safe Secret Validation & Request Verification | `src/lib/nexconnect/security.test.ts` › timingSafeEqual authentication | ☑ | ☑ | ☑ |
| 3 | Payment State Machine & Tamper Protection | `src/app/api/webhooks/nexconnect/confirmation/security.test.ts` › rejects tampered amount & currency | ☑ | ☑ | ☑ |
| 4 | Idempotency & Replay Attack Defense | `src/app/api/webhooks/nexconnect/confirmation/security.test.ts` › handles replayed webhooks safely | ☑ | ☑ | ☑ |
| 5 | Database Audit Trail & Schema Security | `scripts/create-tables.sql` › `store_payment_audit_logs` & unique constraints | ☑ | ☑ | ☑ |
| 6 | Application Hardening & Security Headers | `src/lib/securityHeaders.test.ts` › verifies CSP, HSTS, X-Content-Type | ☑ | ☑ | ☑ |
| 7 | Payment Reconciliation & Anomaly Engine | `src/lib/reconciliation.test.ts` › detects anomalies and daily discrepancies | ☑ | ☑ | ☑ |
| 8 | AFRIKYIA Security & Trust Center Page (`/security`) | `src/app/[locale]/security/SecurityPage.test.tsx` › renders Trust Center | ☑ | ☑ | ☑ |
| 9 | CI/CD Security Gate Automation | `.github/workflows/security.yml` syntax & execution | ☑ | ☑ | ☑ |
| 10| Full Security Documentation Package (10 files) | `docs/security/*.md` compliance check | ☑ | ☑ | ☑ |

## QA Verification
- [x] Full test suite: `npm test` (17 test files, 82 tests passing, 0 failures)
- [x] TypeScript check: `npx tsc --noEmit` (0 errors)
- [x] Production build: `npm run build` (Successful Next.js 16 Turbopack build, static generation 32/32)

## Execution log
- **2026-10-21 (Antigravity):** Performed initial discovery and baseline assessment. Documented baseline in `docs/security/01-SECURITY-BASELINE.md`, threat model in `docs/security/02-THREAT-MODEL.md`, and webhook audit in `docs/security/03-PAYMENT-WEBHOOK-AUDIT.md`.
- **2026-10-21 (Antigravity):** Implemented constant-time authentication and cryptographic utilities in `src/lib/nexconnect/security.ts` with 12 passing unit tests in `src/lib/nexconnect/security.test.ts`.
- **2026-10-21 (Antigravity):** Hardened confirmation webhook route `src/app/api/webhooks/nexconnect/confirmation/route.ts` against timing attacks, replay attacks, amount mismatches, and status rollback. Built and verified 7 attack scenarios in `src/app/api/webhooks/nexconnect/confirmation/security.test.ts`.
- **2026-10-21 (Antigravity):** Updated database schema in `scripts/create-tables.sql` with `store_payment_audit_logs` table, status state machine constraint, and unique index on `numero_recu`.
- **2026-10-21 (Antigravity):** Implemented enterprise HTTP security headers in `src/lib/securityHeaders.ts` and `next.config.ts`, validated via `src/lib/securityHeaders.test.ts`.
- **2026-10-21 (Antigravity):** Built daily payment reconciliation engine in `src/lib/reconciliation.ts`, verified via `src/lib/reconciliation.test.ts`.
- **2026-10-21 (Antigravity):** Developed bilingual `/security` Trust Center in `src/app/[locale]/security/page.tsx` and `layout.tsx`, added footer & sitemap navigation links, and tested via `src/app/[locale]/security/SecurityPage.test.tsx`.
- **2026-10-21 (Antigravity):** Added GitHub Actions CI security workflow in `.github/workflows/security.yml`.
- **2026-10-21 (Antigravity):** Completed all 10 mandatory markdown documents in `docs/security/`.
- **2026-10-21 (Antigravity):** Ran complete QA protocol: all 17 test suites (82 tests) passed, `tsc --noEmit` exited 0, and `npm run build` compiled all routes successfully.

## Outcome
All acceptance criteria met. Platform is hardened, audited, and ready for external audit and production promotion upon owner approval.

