# 06-INCIDENT-RESPONSE-PLAN: Security Incident Response & Payment Forensics Plan

- **Platform:** AFRIKYIA E-Commerce & Electronic Payments (`afrikyia.com`)
- **Authority:** AFRIKYIA SUARL Security & Engineering Team
- **Official Security Mailbox:** `security@afrikyia.com`
- **Emergency Escalation:** Lead Engineer & Company Administrator

---

## 1. Incident Classification & Severity Levels

| Severity | Definition | Examples | SLA to Initial Action |
| :--- | :--- | :--- | :--- |
| **P1 - Critical** | Direct financial impact, credential compromise, active unauthorized balance alterations, or complete payment outage. | Leaked `NEXCONNECT_API_KEY`, active payment fraud, database breach. | **< 15 minutes** |
| **P2 - Major** | Intermittent payment failures, webhook delivery storming, high rate of disputed transactions. | Bank gateway returning 500s, reconciliation imbalance exceeding threshold. | **< 1 hour** |
| **P3 - Moderate** | Non-financial security finding, minor header misconfiguration, isolated user license generation delay. | Responsible disclosure report of informational finding, isolated CSP violation. | **< 24 hours** |

---

## 2. Incident Response Lifecycle

### Phase 1: Detection & Triage
- Automated detection via reconciliation alerts (`discrepancies.length > 0`), Sentry error spikes, or database audit log anomalies.
- Inbound reports received via `security@afrikyia.com`.
- The on-call engineer verifies reproducibility and assigns initial Severity (P1–P3).

### Phase 2: Containment
- **Credential Quarantine:** If any API key is suspected of compromise, immediately rotate the key via provider dashboard and update Vercel environment variables.
- **Circuit Breaker:** If fraudulent webhooks are flooding the system, enable maintenance mode on `/api/webhooks/nexconnect/*` to prevent automated state transitions.
- **Order Freezing:** Set any disputed order to `disputed` status to halt automatic license delivery.

### Phase 3: Eradication & Investigation
- Query `store_payment_audit_logs` using `payload_sha256`, `order_id`, and `created_at` to establish the exact attack timeline and IP origins.
- Audit Supabase access logs to ensure Row-Level Security was not bypassed.
- Patch vulnerable logic following the TDD protocol (failing test -> code fix -> green test).

### Phase 4: Recovery
- Deploy fixes via the verified CI/CD pipeline.
- Re-run daily reconciliation engine to verify complete ledger balance.
- Unfreeze paused order queues.

### Phase 5: Post-Incident Review & Root Cause Analysis (RCA)
- Produce a blameless post-mortem document within 5 business days.
- Update threat models and regression test suites.

---

## 3. Dedicated Payment Runbooks

### Runbook A: Compromised NexConnect API Key / Webhook Secret
1. **Immediate Step:** Contact NexConnect support via priority phone/WhatsApp channel to revoke current key `amkEsKSS...`.
2. **Generate New Key:** Receive updated production API key from bank.
3. **Deploy Secret:** Update `NEXCONNECT_API_KEY` and `NEXCONNECT_WEBHOOK_SECRET` in Vercel project settings.
4. **Trigger Deployment:** Re-deploy production application so serverless instances pull the new secret.
5. **Verify:** Submit a test sandbox request to ensure HTTP 200 is restored with the new key.

### Runbook B: Reconciliation Discrepancy (Amount Mismatch or Ghost Order)
1. **Locate Discrepancy:** Inspect the output of `reconcileTransactions()`.
2. **Review Audit Log:** Check `store_payment_audit_logs` for `order_id`:
   - Inspect `raw_payload` and `verification_status`.
3. **If Ghost Order (Internal Paid, No Bank Tx):**
   - Contact bank reconciliation officer with receipt number `numero_recu`.
   - If payment was not settled, revoke issued license and update status to `cancelled`.
4. **If Unfulfilled Captured Payment (Bank Captured, Internal Pending):**
   - Manually trigger license provisioning for the customer and notify via SMS/WhatsApp.

---

## 4. Emergency Contacts & Communication Protocol

- **Bank Security Contacts:**
  - NexConnect Technical Support: Via designated integration portal.
  - Bankily Merchant Operations: National phone gateway.
  - Masrvi Merchant Desk: Dedicated merchant hotline.
- **Customer Notice Policy:**
  - Any customer impacted by a transaction delay must receive proactive notification within 2 hours.
  - No internal architectural details or vulnerability specifics may be disclosed externally without prior approval.
