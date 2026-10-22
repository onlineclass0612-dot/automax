import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordBookingPayment } from '@/services/paymentLedgerService';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, paymentType } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { orderNumber },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    let amountToPay = 0;
    if (paymentType === 'FULL_PAYMENT' || booking.paymentType === 'FULL_PAYMENT') {
      amountToPay = booking.totalAmount - booking.paidAmount;
    } else {
      // DP payment
      amountToPay = booking.depositRequired;
    }

    const result = await recordBookingPayment({
      bookingId: booking.id,
      transactionId: `SIM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: amountToPay,
      gateway: 'MAYAR_SIMULATION',
      method: 'QRIS_SANDBOX',
      rawPayload: JSON.stringify({ mode: 'DEVELOPMENT_SIMULATION', paymentType }),
    });

    return NextResponse.json({ success: true, booking: result.booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
