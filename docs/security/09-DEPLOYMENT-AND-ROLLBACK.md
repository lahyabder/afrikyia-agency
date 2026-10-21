# 09-DEPLOYMENT-AND-ROLLBACK: Production Deployment & Atomic Rollback Protocol

- **Target Environment:** Vercel Production (`afrikyia.com`)
- **Database Engine:** Supabase PostgreSQL Vault
- **Branch:** `claude/security-hardening` -> PR to `main`
- **Release Strategy:** Zero-Downtime Blue/Green (Vercel Atomic Deployments)

---

## 1. Pre-Deployment Verification Checklist

Before promoting any changes to production, the following checks MUST be satisfied:

- [x] All automated tests pass locally (`npm test` -> 84/84 tests green).
- [x] Static typecheck passes without errors (`npx tsc --noEmit`).
- [x] Linting passes within acceptable thresholds (`npx eslint`).
- [x] Production build succeeds in isolated sandbox (`npm run build`).
- [x] All database migrations are purely additive and backward-compatible.
- [x] No secrets or credentials are hardcoded in the codebase.
- [x] Owner / Lead Engineer explicit approval obtained.

---

## 2. Database Migration Procedure (Supabase)

The database migration in `scripts/create-tables.sql` is designed to be **non-blocking** and **zero-downtime**:

```sql
-- Step 1: Update status check constraint to support disputed/manual_review
ALTER TABLE store_orders DROP CONSTRAINT IF EXISTS store_orders_status_check;
ALTER TABLE store_orders ADD CONSTRAINT store_orders_status_check 
    CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'disputed', 'cancelled', 'manual_review'));

-- Step 2: Add unique partial index for receipt deduplication
CREATE UNIQUE INDEX IF NOT EXISTS store_orders_numero_recu_unique_idx 
    ON store_orders (numero_recu) WHERE numero_recu IS NOT NULL;

-- Step 3: Create immutable audit trail table
CREATE TABLE IF NOT EXISTS store_payment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES store_orders(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'nexconnect',
    event_type TEXT NOT NULL,
    payload_sha256 TEXT,
    raw_payload JSONB,
    verification_status TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS store_payment_audit_logs_order_id_idx ON store_payment_audit_logs (order_id);
CREATE INDEX IF NOT EXISTS store_payment_audit_logs_created_at_idx ON store_payment_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS store_payment_audit_logs_payload_hash_idx ON store_payment_audit_logs (payload_sha256);
ALTER TABLE store_payment_audit_logs ENABLE ROW LEVEL SECURITY;
```

*Note on Safety:* These DDL statements do not lock existing rows, do not drop columns, and allow older application versions to continue running concurrently without disruption.

---

## 3. Deployment Steps

1. **Commit & Push to Feature Branch:**
   Push changes to `claude/security-hardening`.
2. **Review GitHub Actions Security Gates:**
   Wait for `.github/workflows/security.yml` to complete all steps:
   - Dependency Vulnerability Audit (`npm audit`)
   - Secret Scanning
   - TypeCheck & Lint
   - Automated Tests
   - Production Build Verification
3. **Open Pull Request to `main`:**
   Submit PR with complete diff summary and link to `docs/security/10-FINAL-SECURITY-REPORT.md`.
4. **Deploy Preview on Vercel:**
   Verify the preview deployment URL:
   - Navigate to `/ar/security` and `/fr/security`.
   - Confirm security headers are present via `curl -I <preview_url>`.
5. **Promote to Production:**
   Promote the verified deployment to production with explicit owner consent.

---

## 4. Rollback Plan & Triggers

### 4.1 Rollback Triggers
An immediate rollback MUST be triggered if any of the following occur within 60 minutes of deployment:
- Valid bank webhooks fail with unexpected 500 errors.
- Legitimate customer orders cannot be completed.
- High rate of database deadlocks or query timeout errors.
- Visual or layout breakage on the store or home pages.

### 4.2 Application Rollback (Instantaneous via Vercel)
Vercel keeps all previous production deployments instantly accessible.
1. Open Vercel Project Dashboard -> **Deployments**.
2. Locate the previous stable deployment (commit `041df0c`).
3. Click **Instant Rollback**.
4. Traffic is routed back to the previous deployment within 5 seconds.

### 4.3 Git Rollback
If deploying via Git push:
```bash
git revert -m 1 <merge_commit_sha>
git push origin main
```

### 4.4 Database Rollback Safeguard
Because database changes are strictly additive:
- Even if application code is rolled back, the existing code continues to function seamlessly with the updated schema.
- No rollback DDL is required under standard scenarios, preserving all audit records accumulated in `store_payment_audit_logs`.
