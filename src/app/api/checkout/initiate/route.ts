import { NextResponse } from 'next/server';
import { getProduct, calculateProductPrice } from '@/data/catalog';
import { NexConnectClient, generateInvoiceId } from '@/lib/nexconnect/client';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);

        if (!body) {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        const {
            productId,
            variantKey,
            customerName,
            customerPhone,
            customerEmail,
            paymentMethod,
            codeAbonnement,
        } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        const product = getProduct(productId);
        if (!product) {
            return NextResponse.json(
                { error: `Product not found: ${productId}` },
                { status: 404 }
            );
        }

        // If product is a free platform, immediately return direct link
        if (product.type === 'free_platform') {
            return NextResponse.json({
                success: true,
                isFree: true,
                productName: product.nameAr,
                redirectUrl: product.url,
            });
        }

        // Validate customer info for paid products
        if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
            return NextResponse.json(
                { error: 'customerName is required' },
                { status: 400 }
            );
        }

        const cleanPhone = (customerPhone || '').toString().replace(/[^0-9]/g, '');
        if (cleanPhone.length < 8) {
            return NextResponse.json(
                { error: 'Valid customerPhone is required (minimum 8 digits)' },
                { status: 400 }
            );
        }

        const pricing = calculateProductPrice(productId, variantKey);
        const invoiceId = generateInvoiceId(productId);

        // Fallback default subscription code if not explicitly passed by UI
        const effectiveAbonnement = codeAbonnement || process.env.NEXCONNECT_DEFAULT_ABONNEMENT || 'ba60ee21-2944-4f22-818e-de75470a7c4e';

        // Call NexConnect payment initiation
        const nexClient = new NexConnectClient();
        const initiationResult = await nexClient.createPaymentRequest({
            invoiceId,
            amount: pricing.amount,
            payerName: customerName.trim(),
            payerPhone: cleanPhone,
            codeAbonnement: effectiveAbonnement,
            note: `${product.nameAr} - ${pricing.labelAr}`,
        });

        if (!initiationResult.success || !initiationResult.paymentCode) {
            return NextResponse.json(
                { 
                    error: initiationResult.error || 'Failed to generate payment code with bank gateway',
                    details: initiationResult 
                },
                { status: 502 }
            );
        }

        // Save order in database
        try {
            await supabaseAdmin.from('store_orders').insert({
                id: invoiceId,
                product_id: productId,
                variant_key: variantKey || null,
                customer_name: customerName.trim(),
                customer_phone: cleanPhone,
                customer_email: customerEmail?.trim() || null,
                amount: pricing.amount,
                currency: pricing.currency,
                payment_method: paymentMethod || 'wallet',
                code_abonnement: effectiveAbonnement,
                payment_code: initiationResult.paymentCode,
                status: 'pending',
                metadata: {
                    pricing_label: pricing.labelAr,
                    product_name: product.nameAr,
                },
            });
        } catch (dbErr) {
            // Defensive logging: don't crash checkout if DB is temporarily unreachable in dev/preview
            console.error('[checkout/initiate] Failed to insert order to DB:', dbErr);
        }

        return NextResponse.json({
            success: true,
            invoiceId,
            paymentCode: initiationResult.paymentCode,
            amount: pricing.amount,
            currency: pricing.currency,
            productName: product.nameAr,
            planLabel: pricing.labelAr,
        });

    } catch (err: unknown) {
        console.error('[checkout/initiate] Unexpected error:', err);
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
