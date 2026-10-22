import { prisma } from '@/lib/prisma';
import { dispatchNotification } from './notificationService';

export interface ProcessPaymentParams {
  bookingId: string;
  transactionId: string;
  amount: number;
  gateway: string;
  method?: string;
  rawPayload?: string;
}

export interface PaymentProcessResult {
  duplicate: boolean;
  newStatus?: string;
  orderNumber?: string;
  booking?: any;
}

/**
 * Idempotent Payment Ledger Service
 * Handles financial state transitions, balance updates, and payment logs atomically.
 */
export async function recordBookingPayment(params: ProcessPaymentParams): Promise<PaymentProcessResult> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. IDEMPOTENCY GUARD: Prevent duplicate ledger recording on webhook retries
    const existingPayment = await tx.payment.findFirst({
      where: {
        transactionId: params.transactionId,
        status: 'SUCCESS',
      },
    });

    if (existingPayment) {
      console.warn(`[PaymentLedger] Transaction ${params.transactionId} already processed. Skipping duplicate mutation.`);
      return { duplicate: true };
    }

    // 2. Fetch current booking state
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: params.bookingId },
      include: { car: true },
    });

    // 3. Calculate new financial balance
    const effectivePaid = booking.paidAmount + params.amount;
    const remaining = Math.max(0, booking.totalAmount - effectivePaid);
    const newStatus = remaining === 0 ? 'PAID_IN_FULL' : 'DP_PAID';

    // 4. Update Booking and record Payment log atomically
    const [updatedBooking] = await Promise.all([
      tx.booking.update({
        where: { id: booking.id },
        data: {
          paidAmount: effectivePaid,
          remainingAmount: remaining,
          status: newStatus,
        },
        include: { car: true },
      }),
      tx.payment.create({
        data: {
          bookingId: booking.id,
          gateway: params.gateway,
          transactionId: params.transactionId,
          amount: params.amount,
          method: params.method || 'QRIS',
          status: 'SUCCESS',
          paidAt: new Date(),
          rawResponse: params.rawPayload,
        },
      }),
    ]);

    return {
      duplicate: false,
      newStatus,
      booking: updatedBooking,
    };
  });

  // If this was an idempotent replay, return early without re-dispatching duplicate notifications
  if (result.duplicate || !result.booking) {
    return { duplicate: true };
  }

  // 5. Dispatch notification outside transaction
  const b = result.booking;
  await dispatchNotification({
    event: result.newStatus === 'PAID_IN_FULL' ? 'PAYMENT_FULL_RECEIVED' : 'PAYMENT_DP_RECEIVED',
    orderNumber: b.orderNumber,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    carName: b.car.name,
    startDate: b.startDate.toISOString().slice(0, 10),
    endDate: b.endDate.toISOString().slice(0, 10),
    durationDays: b.durationDays,
    totalAmount: b.totalAmount,
    paidAmount: b.paidAmount,
    remainingAmount: b.remainingAmount,
    status: result.newStatus === 'PAID_IN_FULL' ? 'LUNAS TOTAL' : 'DP 30% TERVERIFIKASI',
  });

  return {
    duplicate: false,
    newStatus: result.newStatus,
    orderNumber: b.orderNumber,
    booking: b,
  };
}
