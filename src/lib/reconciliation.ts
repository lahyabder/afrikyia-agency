export interface OrderRecord {
    id: string;
    amount: number;
    status: string;
    numero_recu: string | null;
    paid_at: string | null;
}

export interface ProviderTransactionRecord {
    id_facture: string;
    montant: number | string;
    numero_recu?: string | null;
    id_transaction?: string | null;
    statut?: string | null;
}

export type DiscrepancyType =
    | 'AMOUNT_MISMATCH'
    | 'MISSING_PROVIDER_RECORD'
    | 'UNFULFILLED_CAPTURED_PAYMENT'
    | 'DUPLICATE_RECEIPT_COLLISION'
    | 'UNKNOWN_INVOICE_IN_PROVIDER';

export interface ReconciliationDiscrepancy {
    type: DiscrepancyType;
    orderId?: string;
    expectedAmount?: number;
    actualAmount?: number;
    receiptNumber?: string;
    details: string;
}

export interface MatchedTransaction {
    orderId: string;
    amount: number;
    receiptNumber?: string;
}

export interface ReconciliationReport {
    timestamp: string;
    totalOrdersChecked: number;
    totalProviderTxsChecked: number;
    matchedCount: number;
    matched: MatchedTransaction[];
    discrepancies: ReconciliationDiscrepancy[];
    isBalanced: boolean;
}

/**
 * Reconciles internal store orders against external payment provider records.
 */
export function reconcileTransactions(
    orders: OrderRecord[],
    providerTxs: ProviderTransactionRecord[]
): ReconciliationReport {
    const discrepancies: ReconciliationDiscrepancy[] = [];
    const matched: MatchedTransaction[] = [];

    const orderMap = new Map<string, OrderRecord>();
    for (const order of orders) {
        orderMap.set(order.id, order);
    }

    const providerMap = new Map<string, ProviderTransactionRecord[]>();
    const receiptToTxs = new Map<string, ProviderTransactionRecord[]>();

    for (const tx of providerTxs) {
        const txList = providerMap.get(tx.id_facture) || [];
        txList.push(tx);
        providerMap.set(tx.id_facture, txList);

        if (tx.numero_recu) {
            const rList = receiptToTxs.get(tx.numero_recu) || [];
            rList.push(tx);
            receiptToTxs.set(tx.numero_recu, rList);
        }
    }

    // Check duplicate receipts
    for (const [receipt, txList] of receiptToTxs.entries()) {
        if (txList.length > 1) {
            discrepancies.push({
                type: 'DUPLICATE_RECEIPT_COLLISION',
                receiptNumber: receipt,
                details: `Receipt ${receipt} was claimed by ${txList.length} distinct transactions: ${txList.map((t) => t.id_facture).join(', ')}`,
            });
        }
    }

    // Evaluate each order
    for (const order of orders) {
        const txsForOrder = providerMap.get(order.id);

        if (order.status === 'paid') {
            if (!txsForOrder || txsForOrder.length === 0) {
                discrepancies.push({
                    type: 'MISSING_PROVIDER_RECORD',
                    orderId: order.id,
                    expectedAmount: order.amount,
                    details: `Order ${order.id} is marked 'paid' in internal records, but absent in provider settlement data.`,
                });
                continue;
            }

            const primaryTx = txsForOrder[0];
            const paidAmount = Number(primaryTx.montant);

            if (Math.abs(order.amount - paidAmount) > 0.001) {
                discrepancies.push({
                    type: 'AMOUNT_MISMATCH',
                    orderId: order.id,
                    expectedAmount: order.amount,
                    actualAmount: paidAmount,
                    details: `Order ${order.id} amount mismatch: internal order is ${order.amount} MRU, but provider reported ${paidAmount} MRU.`,
                });
            } else {
                matched.push({
                    orderId: order.id,
                    amount: order.amount,
                    receiptNumber: primaryTx.numero_recu || order.numero_recu || undefined,
                });
            }
        } else if (order.status === 'pending' || order.status === 'failed') {
            if (txsForOrder && txsForOrder.some((t) => !t.statut || t.statut === 'success' || t.statut === 'paye')) {
                const successfulTx = txsForOrder.find((t) => !t.statut || t.statut === 'success' || t.statut === 'paye');
                discrepancies.push({
                    type: 'UNFULFILLED_CAPTURED_PAYMENT',
                    orderId: order.id,
                    actualAmount: Number(successfulTx?.montant),
                    details: `Order ${order.id} is ${order.status} internally, but provider captured successful payment. Immediate fulfillment or manual review required.`,
                });
            }
        }
    }

    // Check if any provider tx was for an unknown invoice
    for (const tx of providerTxs) {
        if (!orderMap.has(tx.id_facture)) {
            discrepancies.push({
                type: 'UNKNOWN_INVOICE_IN_PROVIDER',
                orderId: tx.id_facture,
                actualAmount: Number(tx.montant),
                details: `Provider reported transaction for invoice ${tx.id_facture} not present in internal database.`,
            });
        }
    }

    return {
        timestamp: new Date().toISOString(),
        totalOrdersChecked: orders.length,
        totalProviderTxsChecked: providerTxs.length,
        matchedCount: matched.length,
        matched,
        discrepancies,
        isBalanced: discrepancies.length === 0,
    };
}
