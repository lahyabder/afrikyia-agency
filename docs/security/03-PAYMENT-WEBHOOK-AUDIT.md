# 03-PAYMENT-WEBHOOK-AUDIT: Deep Technical Audit of Payment Webhooks

- **Evaluated Endpoints:**
  - `POST /api/webhooks/nexconnect/confirmation`
  - `GET /api/webhooks/nexconnect/verification`
- **Supported Providers:** NexConnect Gateway (Sedad, Bankily, Masrvi, Click)
- **Status:** Verified & Hardened
- **Date:** 2026-10-21

---

## 1. Provider Protocol Analysis

### 1.1 NexConnect Authentication Model
- **Mechanism:** Shared secret key delivered in HTTP header: `Authorization: Api-Key <SECRET_KEY>`.
- **Finding:** Unlike stripe-signature or GitHub webhooks which employ HMAC-SHA256 digests over request bodies, NexConnect's protocol uses a bearer API Key (`Api-Key ...`).
- **Security Requirement:** 
  1. The comparison must be timing-safe (`crypto.timingSafeEqual`) to prevent byte-by-byte timing inference.
  2. TLS 1.3 encryption is mandatory in transit to prevent bearer key interception.
  3. The raw body must be validated for JSON syntax and required schema keys before any business logic executes.

### 1.2 Webhook Callbacks & Field Specifications
```json
{
  "code": 200,
  "statut": "paye",
  "id_facture": "AFR-SANAD-MVHE9BO4DCNZ",
  "numero_recu": "REC-77382910",
  "montant": 1000,
  "moyen_paiement": "Sedad",
  "id_transaction": "TX-99881122"
}
```

- **Bank Response Requirement:**
  The server MUST return HTTP 200 with `{ "code": 200, "Message": "OK", "numero_recu": "<receipt>" }`. Any other response code (4xx, 5xx) signals to the bank's gateway to retry delivery, potentially causing webhook storming.

---

## 2. Vulnerability Analysis & Hardening Design

### 2.1 Timing Attack Mitigation (Constant-Time Equality)
Standard string comparison `a === b` terminates early on the first non-matching byte. Over low-noise environments, an attacker can theoretically infer the secret key by measuring round-trip microsecond variances.

**Remediation:**
We use a constant-time comparison algorithm:
```ts
import crypto from 'node:crypto';

export function timingSafeSecretMatch(provided: string, expected: string): boolean {
    const hashA = crypto.createHash('sha256').update(provided.trim()).digest();
    const hashB = crypto.createHash('sha256').update(expected.trim()).digest();
    return crypto.timingSafeEqual(hashA, hashB);
}
```
Hashing both strings with SHA-256 guarantees equal length buffers (32 bytes), enabling `crypto.timingSafeEqual` to execute in deterministic, constant CPU cycles regardless of input discrepancies.

### 2.2 Replay Attacks & Idempotency Architecture
An attacker or network duplicate sending the exact same confirmed webhook multiple times must never:
1. Re-issue an additional license key.
2. Re-increment revenue counters.
3. Overwrite transaction history.

**Hardened State Transition Rules:**
```
                     +---------------------------+
                     |          CREATED          |
                     +---------------------------+
                                   |
                                   v
                     +---------------------------+
                     |          PENDING          | <-----+
                     +---------------------------+       |
                       /           |           \         | (Safe retry)
                      /            |            \        |
                     v             v             v       |
        +-------------+     +-------------+    +-------------+
        |    PAID     |     |   FAILED    |    |   EXPIRED   |
        +-------------+     +-------------+    +-------------+
         (TERMINAL)           (TERMINAL)         (TERMINAL)
              |
              v (Only manual dispute resolution)
        +-------------+
        |  DISPUTED   |
        +-------------+
```

1. If an order is already marked `PAID` and receives a duplicate webhook with matching `numero_recu`:
   - System logs idempotency hit.
   - Immediately returns HTTP 200 OK with `{ "code": 200, "Message": "OK", "numero_recu": order.numero_recu }`.
   - Aborts license creation and prevents ledger corruption.

2. If a webhook arrives claiming `FAILED` on an order already marked `PAID`:
   - System rejects status rollback.
   - Retains `PAID` state and flags for `MANUAL_REVIEW` / `DISPUTED`.

### 2.3 Strict Amount & Currency Cross-Validation
A malicious actor could send a fake webhook confirming an order of 11,000 MRU for a nominal payment of 1 MRU.
**Defense:**
The server verifies:
`Math.abs(Number(order.amount) - Number(callback.montant)) < 0.01`
AND
`order.currency.toUpperCase() === 'MRU'`

If a mismatch is detected:
- Webhook is rejected.
- Order is transitioned to `DISPUTED`.
- Security incident is logged in `store_payment_audit_logs`.
- Zero license issued.

---

## 3. Database Audit Trail Specification (`store_payment_audit_logs`)
Every incoming webhook generates an immutable append-only record:
- `id`: UUID (Primary Key)
- `order_id`: References `store_orders(id)`
- `provider`: `nexconnect`
- `event_type`: `confirmation` | `verification` | `consultation`
- `payload_sha256`: Cryptographic hash of the raw request body
- `raw_payload`: Sanitized JSON payload (excluding personal credentials)
- `ip_address`: Source IP hash (privacy-preserving)
- `verification_status`: `verified` | `rejected_auth` | `rejected_amount` | `idempotent_duplicate`
- `created_at`: TIMESTAMPTZ (Default NOW)
