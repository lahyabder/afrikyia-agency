import { NextResponse } from 'next/server';
import { verifyWebhookAuth } from '@/lib/nexconnect/client';
import { validateAmountMatch, calculatePayloadHash } from '@/lib/nexconnect/security';
import { supabaseAdmin } from '@/lib/supabase';

function generateLicenseCode(prefix: string = 'LIC'): string {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part3 = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AFR-${prefix.toUpperCase()}-${part1}-${part2}-${part3}`;
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
        const defaultSecret = 'amkEsKSS.ILbUR5XFS54kmAtaFpy5F8sZU2miACQc';
        const expectedSecret = process.env.NEXCONNECT_WEBHOOK_SECRET || process.env.NEXCONNECT_API_KEY || defaultSecret;

        // Security: strictly reject unauthenticated requests with constant-time check
        if (!verifyWebhookAuth(authHeader, expectedSecret)) {
            return NextResponse.json(
                { code: 401, detail: 'Authentication credentials were not provided or invalid.' },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { code: 400, message: 'Bad request: missing JSON payload' },
                { status: 400 }
            );
        }

        const {
            id_facture,
            id_transaction,
            date_paiement,
            montant,
            telephone_commercant,
            numero_recu,
            note,
            statut,
        } = body;

        if (!id_facture || !numero_recu) {
            return NextResponse.json(
                { code: 400, message: 'Missing required fields: id_facture and numero_recu are required' },
                { status: 400 }
            );
        }

        const payloadHash = calculatePayloadHash(body);

        // Fetch order from database
        const { data: order, error: fetchErr } = await supabaseAdmin
            .from('store_orders')
            .select('*')
            .eq('id', id_facture)
            .single();

        if (fetchErr || !order) {
            return NextResponse.json(
                { code: 404, message: 'Facture introuvable' },
                { status: 404 }
            );
        }

        // Idempotency & Status Rollback Protection:
        // If the order has already achieved terminal state 'paid', reject any regression and return OK
        if (order.status === 'paid') {
            // Log idempotent delivery notice
            try {
                await supabaseAdmin.from('store_payment_audit_logs').insert({
                    order_id: id_facture,
                    provider: 'nexconnect',
                    event_type: 'idempotent_duplicate',
                    payload_sha256: payloadHash,
                    raw_payload: body,
                    verification_status: 'verified_duplicate',
                });
            } catch {
                // Non-blocking for audit log
            }

            return NextResponse.json({
                code: 200,
                Message: 'OK',
                numero_recu: order.numero_recu || numero_recu,
            });
        }

        // Financial validation: verify exact amount match
        const paidAmount = Number(montant);
        const orderAmount = Number(order.amount);
        if (!validateAmountMatch(orderAmount, paidAmount)) {
            // Flag order as disputed to prevent unauthorized auto-fulfillment
            await supabaseAdmin
                .from('store_orders')
                .update({
                    status: 'disputed',
                    metadata: {
                        ...(order.metadata || {}),
                        dispute_reason: 'Amount mismatch',
                        attempted_amount: paidAmount,
                        expected_amount: orderAmount,
                        flagged_at: new Date().toISOString(),
                    },
                })
                .eq('id', id_facture);

            return NextResponse.json(
                { code: 400, message: 'Montant invalide: mismatch between order and confirmed payment' },
                { status: 400 }
            );
        }

        // Status rollback check for non-paid notifications
        if (statut && statut !== 'paye' && statut !== 'valide' && statut !== 'success') {
            return NextResponse.json({
                code: 200,
                Message: 'Non-paid status acknowledged without mutation',
            });
        }

        // Generate license key
        const licenseKey = generateLicenseCode(order.product_id || 'KEY');
        const nowIso = new Date().toISOString();

        // Update order status to 'paid'
        await supabaseAdmin
            .from('store_orders')
            .update({
                status: 'paid',
                id_transaction: id_transaction || null,
                numero_recu,
                paid_at: nowIso,
                license_key: licenseKey,
                metadata: {
                    ...(order.metadata || {}),
                    bank_date: date_paiement,
                    telephone_commercant,
                    note,
                },
                updated_at: nowIso,
            })
            .eq('id', id_facture);

        // Provision license entry
        await supabaseAdmin
            .from('store_licenses')
            .insert({
                order_id: id_facture,
                license_key: licenseKey,
                product_id: order.product_id,
                variant_key: order.variant_key,
                customer_phone: order.customer_phone,
                customer_email: order.customer_email,
                max_devices: order.metadata?.max_devices || 1,
                status: 'active',
            });

        // Record immutable audit log entry
        try {
            await supabaseAdmin.from('store_payment_audit_logs').insert({
                order_id: id_facture,
                provider: 'nexconnect',
                event_type: 'confirmation',
                payload_sha256: payloadHash,
                raw_payload: body,
                verification_status: 'verified',
            });
        } catch {
            // Non-blocking
        }

        // Bank specification: Must return HTTP 200 with code 200, Message OK, and numero_recu
        return NextResponse.json({
            code: 200,
            Message: 'OK',
            numero_recu,
        });

    } catch (err: unknown) {
        console.error('[webhook/confirmation] Error handling confirmation:', err);
        return NextResponse.json(
            { code: 500, message: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
