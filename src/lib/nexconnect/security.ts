import crypto from 'node:crypto';

/**
 * Constant-time string equality comparison using SHA-256 digests.
 * Prevents side-channel timing attacks that leak secret tokens byte-by-byte.
 */
export function timingSafeSecretMatch(provided: string, expected: string): boolean {
    if (!provided || !expected) {
        return false;
    }

    const trimmedProvided = provided.trim();
    const trimmedExpected = expected.trim();

    if (trimmedProvided.length === 0 || trimmedExpected.length === 0) {
        return false;
    }

    const hashA = crypto.createHash('sha256').update(trimmedProvided, 'utf8').digest();
    const hashB = crypto.createHash('sha256').update(trimmedExpected, 'utf8').digest();

    return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Verifies that the Authorization header in an incoming webhook matches the expected secret
 * using constant-time comparison and proper token extraction.
 */
export function verifyTimingSafeWebhookAuth(
    authHeader: string | null | undefined,
    expectedSecret: string
): boolean {
    if (!authHeader || !expectedSecret) {
        return false;
    }

    const trimmed = authHeader.trim();
    // Matches 'Api-Key <TOKEN>' case-insensitively
    const match = trimmed.match(/^api-key\s+(.+)$/i);
    if (!match || !match[1]) {
        return false;
    }

    const providedKey = match[1].trim();
    return timingSafeSecretMatch(providedKey, expectedSecret);
}

/**
 * Calculates deterministic SHA-256 hash of a payload for audit trail and idempotency checks.
 */
export function calculatePayloadHash(payload: unknown): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
}

/**
 * Validates that the received amount matches expected order amount within strict epsilon tolerance.
 */
export function validateAmountMatch(expectedAmount: number, receivedAmount: number): boolean {
    if (typeof expectedAmount !== 'number' || typeof receivedAmount !== 'number') {
        return false;
    }

    if (isNaN(expectedAmount) || isNaN(receivedAmount)) {
        return false;
    }

    if (expectedAmount <= 0 || receivedAmount <= 0) {
        return false;
    }

    // Floating-point epsilon check (< 0.01 MRU)
    return Math.abs(expectedAmount - receivedAmount) < 0.01;
}
