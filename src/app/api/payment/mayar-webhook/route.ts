import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordBookingPayment } from '@/services/paymentLedgerService';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    let body;

    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Defensive Security: Webhook Authentication & Signature Verification
    const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;
    const incomingSignature = req.headers.get('x-mayar-signature') || req.headers.get('signature');
    const incomingToken =
      req.headers.get('x-mayar-token') ||
      req.headers.get('x-callback-token') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (webhookSecret && process.env.NODE_ENV === 'production') {
      let isVerified = false;

      // 1. Check raw token match
      if (incomingToken && incomingToken === webhookSecret) {
        isVerified = true;
      }

      // 2. Check HMAC-SHA256 signature match
      if (!isVerified && incomingSignature) {
        const computedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(rawText)
          .digest('hex');

        if (
          incomingSignature.length === computedSignature.length &&
          crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(incomingSignature))
        ) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        console.warn(
          '[Mayar Webhook] Unauthorized webhook attempt rejected (missing or invalid signature/token).'
        );
        return NextResponse.json({ error: 'Signature / Token verification failed' }, { status: 401 });
      }
    }

    console.log('[Mayar Webhook Received]', JSON.stringify(body));

    const event = body.event || body.type;
    const paymentData = body.data || body;
    const status = (paymentData.status || '').toUpperCase();

    const isSuccess =
      status === 'SUCCESS' ||
      status === 'PAID' ||
      status === 'SETTLED' ||
      event === 'payment.received' ||
      event === 'invoice.paid';

    if (!isSuccess) {
      console.log(`[Mayar Webhook] Status is not a success event (${status}). Skipping.`);
      return NextResponse.json({ message: 'Ignored non-success event' });
    }

    // Identify orderNumber robustly from rawText or description fields
    const description = paymentData.productDescription || paymentData.description || '';
    const match = rawText.match(/INV-\d{4}-[A-Z0-9]+/i);
    const orderNumber = match ? match[0].toUpperCase() : null;
    const amountPaid = Number(
      paymentData.amount || paymentData.paymentLinkAmount || paymentData.gross_amount || 0
    );

    let booking = null;

    if (orderNumber) {
      booking = await prisma.booking.findUnique({
        where: { orderNumber },
      });
    }

    const transactionId = String(
      paymentData.transactionId || paymentData.id || paymentData.transaction_id || `TXN_${Date.now()}`
    );

    if (!booking && transactionId) {
      const paymentRecord = await prisma.payment.findFirst({
        where: { transactionId },
      });
      if (paymentRecord) {
        booking = await prisma.booking.findUnique({
          where: { id: paymentRecord.bookingId },
        });
      }
    }

    if (!booking) {
      console.warn(`[Mayar Webhook] Booking #${orderNumber || 'UNKNOWN'} not found for incoming webhook.`);
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Use Centralized Idempotent Ledger Service
    const ledgerResult = await recordBookingPayment({
      bookingId: booking.id,
      transactionId,
      amount: amountPaid > 0 ? amountPaid : booking.depositRequired,
      gateway: 'MAYAR',
      method: paymentData.paymentMethod || paymentData.payment_method || 'QRIS',
      rawPayload: rawText,
    });

    if (ledgerResult.duplicate) {
      return NextResponse.json({ message: 'Duplicate webhook event ignored (idempotent ok)' });
    }

    return NextResponse.json({
      success: true,
      orderNumber: ledgerResult.orderNumber,
      newStatus: ledgerResult.newStatus,
    });
  } catch (err: any) {
    console.error('[Mayar Webhook Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
