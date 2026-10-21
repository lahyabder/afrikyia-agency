export interface PaymentRequestParams {
    invoiceId: string;
    amount: number;
    payerName: string;
    payerPhone: string;
    codeAbonnement: string;
    note?: string;
    date?: string;
}

export interface NexConnectDemandePayload {
    id_facture: string;
    montant: number;
    nom_payeur: string;
    telephone_payeur: string;
    code_abonnement: string;
    date: string;
    remarque?: string;
}

export interface PaymentInitiationResult {
    success: boolean;
    paymentCode?: string;
    invoiceId?: string;
    type?: string;
    error?: string;
}

export interface PaymentMethodItem {
    code_abonnement: string;
    moyen_paiement: string;
    phone: string;
    type: 'wallet' | 'card' | string;
}

/**
 * Generates an invoice ID with at least 8 characters (NexConnect requires id_facture >= 8 chars).
 */
export function generateInvoiceId(productPrefix: string = 'GEN'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanPrefix = productPrefix.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
    const invoiceId = `AFR-${cleanPrefix}-${timestamp}${randomHex}`;
    return invoiceId;
}

/**
 * Builds and validates the payload for POST /demande_paiement
 */
export function buildPaymentRequestPayload(params: PaymentRequestParams): NexConnectDemandePayload {
    if (!params.invoiceId || params.invoiceId.length < 8) {
        throw new Error('invoiceId must be at least 8 characters long');
    }

    if (!params.amount || params.amount <= 0) {
        throw new Error('amount must be greater than zero');
    }

    if (!params.payerName || params.payerName.trim().length === 0) {
        throw new Error('payerName is required');
    }

    const cleanPhone = (params.payerPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
        throw new Error('Invalid phone number format (minimum 8 digits required)');
    }

    if (!params.codeAbonnement) {
        throw new Error('codeAbonnement is required');
    }

    // Default to current date YYYY-MM-DD
    const dateStr = params.date || new Date().toISOString().split('T')[0];

    const payload: NexConnectDemandePayload = {
        id_facture: params.invoiceId,
        montant: Number(params.amount),
        nom_payeur: params.payerName.trim(),
        telephone_payeur: cleanPhone,
        code_abonnement: params.codeAbonnement,
        date: dateStr,
    };

    if (params.note) {
        payload.remarque = params.note;
    }

    return payload;
}

/**
 * Generates standard headers required by NexConnect.
 */
export function getNexConnectHeaders(apiKey: string): Record<string, string> {
    return {
        'Authorization': `Api-Key ${apiKey}`,
        'Content-Type': 'application/json',
    };
}

/**
 * Verifies that the Authorization header in incoming webhooks matches the configured API key.
 */
export function verifyWebhookAuth(
    authHeader: string | null | undefined, 
    expectedSecret: string
): boolean {
    if (!authHeader || !expectedSecret) return false;

    const trimmed = authHeader.trim();
    // Allow case-insensitive 'Api-Key ' or 'api-key '
    const match = trimmed.match(/^api-key\s+(.+)$/i);
    if (!match) return false;

    const providedKey = match[1].trim();
    return providedKey === expectedSecret.trim();
}

/**
 * Parses response from NexConnect /demande_paiement
 */
export function parsePaymentResponse(response: Record<string, unknown> | null | undefined): PaymentInitiationResult {
    if (!response) {
        return { success: false, error: 'Empty response from payment gateway' };
    }

    const status = response.status || response.code;

    if (status === 200 && response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>;
        return {
            success: true,
            paymentCode: data.code_paiement as string | undefined,
            invoiceId: data.id_facture as string | undefined,
            type: data.type as string | undefined,
        };
    }

    const rawError = response.Message || response.message || response.detail;
    const errorMessage = typeof rawError === 'string' ? rawError : 'Payment request failed';
    return {
        success: false,
        error: errorMessage,
    };
}

/**
 * Higher-level client to interact with NexConnect API endpoints.
 */
export class NexConnectClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(baseUrl?: string, apiKey?: string) {
        this.baseUrl = (baseUrl || process.env.NEXCONNECT_BASE_URL || 'https://nexpay-653e0b7d7b24.herokuapp.com/api').replace(/\/+$/, '');
        this.apiKey = apiKey || process.env.NEXCONNECT_API_KEY || 'amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc';
    }

    private get headers(): Record<string, string> {
        return getNexConnectHeaders(this.apiKey);
    }

    /**
     * GET /moyens_paiement
     * Retrieves the list of available payment methods / wallets configured for the merchant.
     */
    async getPaymentMethods(): Promise<PaymentMethodItem[]> {
        const url = `${this.baseUrl}/moyens_paiement`;
        const res = await fetch(url, {
            method: 'GET',
            headers: this.headers,
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch payment methods: HTTP ${res.status}`);
        }

        const json = await res.json();
        if (json.status === 200 && Array.isArray(json.data)) {
            return json.data;
        }

        return [];
    }

    /**
     * POST /demande_paiement
     * Submits a payment request to obtain a payment code for the customer wallet.
     */
    async createPaymentRequest(params: PaymentRequestParams): Promise<PaymentInitiationResult> {
        const payload = buildPaymentRequestPayload(params);
        const url = `${this.baseUrl}/demande_paiement`;

        const res = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({ status: res.status, Message: res.statusText }));
        return parsePaymentResponse(json);
    }

    /**
     * POST /consulte_paiement
     * Checks status of a completed payment using its receipt number.
     */
    async consultPayment(receiptNumber: string): Promise<{ status: number; valid: boolean; data?: Record<string, unknown> }> {
        const url = `${this.baseUrl}/consulte_paiement`;
        const res = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ numero_recu: receiptNumber }),
        });

        const json = await res.json();
        const isValid = json?.data?.statut === 'valide';
        return {
            status: json.status || res.status,
            valid: isValid,
            data: json.data,
        };
    }
}
