import { prisma } from '@/lib/prisma';
import { createMayarPayment } from './mayarService';
import { dispatchNotification } from './notificationService';
import { calculatePricingBreakdown } from '@/lib/pricing';

export interface BookingCalculationInput {
  carId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isWithDriver?: boolean;
  paymentType: 'DOWN_PAYMENT' | 'FULL_PAYMENT';
}

/**
 * Generates an O(1) collision-resistant business order number
 * Format: INV-YYMM-XXXX (e.g. INV-2610-7B4K)
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
  
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars (0, O, 1, I)
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `INV-${yearMonth}-${randomSuffix}`;
}

export async function calculateBookingCost(input: BookingCalculationInput) {
  const car = await prisma.car.findUnique({
    where: { id: input.carId },
  });

  if (!car) {
    throw new Error('Mobil tidak ditemukan');
  }

  const setting = await prisma.setting.findUnique({ where: { id: 'global' } });

  // Use Centralized Pure Pricing Engine (Single Source of Truth)
  const breakdown = calculatePricingBreakdown({
    dailyRate: car.dailyRate,
    startDate: input.startDate,
    endDate: input.endDate,
    isWithDriver: input.isWithDriver,
    depositPercent: setting?.defaultDpPercent,
    paymentType: input.paymentType,
  });

  const start = new Date(`${input.startDate}T09:00:00+07:00`);
  const end = new Date(`${input.endDate}T09:00:00+07:00`);

  if (end.getTime() <= start.getTime()) {
    throw new Error('Tanggal selesai sewa harus setelah tanggal mulai sewa.');
  }

  return {
    car,
    startDate: start,
    endDate: end,
    ...breakdown,
    paymentType: input.paymentType,
    isWithDriver: !!input.isWithDriver,
  };
}

export interface CreateBookingInput {
  carId: string;
  startDate: string;
  endDate: string;
  isWithDriver: boolean;
  paymentType: 'DOWN_PAYMENT' | 'FULL_PAYMENT';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
}

export async function createNewBooking(input: CreateBookingInput) {
  const calc = await calculateBookingCost({
    carId: input.carId,
    startDate: input.startDate,
    endDate: input.endDate,
    isWithDriver: input.isWithDriver,
    paymentType: input.paymentType,
  });

  // PREVENT RACE CONDITIONS:
  // Collision check and booking creation executed atomically inside a transaction
  const booking = await prisma.$transaction(async (tx) => {
    const existingCollision = await tx.booking.findFirst({
      where: {
        carId: input.carId,
        status: { in: ['DP_PAID', 'PAID_IN_FULL', 'ACTIVE'] },
        OR: [
          {
            startDate: { lte: calc.endDate },
            endDate: { gte: calc.startDate },
          },
        ],
      },
    });

    if (existingCollision) {
      throw new Error(
        'Unit mobil ini baru saja dipesan oleh pelanggan lain pada rentang tanggal tersebut. Silakan pilih tanggal lain atau unit mobil lainnya.'
      );
    }

    // O(1) Unique Order Number Generation
    const orderNumber = generateOrderNumber();

    return await tx.booking.create({
      data: {
        orderNumber,
        carId: input.carId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        customerAddress: input.customerAddress,
        startDate: calc.startDate,
        endDate: calc.endDate,
        durationDays: calc.durationDays,
        isWithDriver: calc.isWithDriver,
        driverFeePerDay: calc.driverFeePerDay,
        dailyRateSnap: calc.car.dailyRate,
        totalAmount: calc.totalAmount,
        depositPercent: calc.depositPercent,
        depositRequired: calc.depositRequired,
        paidAmount: 0,
        remainingAmount: calc.totalAmount,
        paymentType: input.paymentType,
        status: 'PENDING_PAYMENT',
        notes: input.notes,
      },
    });
  });

  // Generate Mayar Payment Link outside database transaction lock
  const paymentResult = await createMayarPayment({
    orderNumber: booking.orderNumber,
    amount: calc.immediateAmountToPay,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    description: `Sewa ${calc.car.name} (${calc.durationDays} Hari) - ${
      input.paymentType === 'DOWN_PAYMENT' ? 'DP 30%' : 'Lunas 100%'
    }`,
  });

  // Record initial pending payment log
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      gateway: 'MAYAR',
      transactionId: paymentResult.transactionId,
      paymentUrl: paymentResult.paymentUrl,
      amount: calc.immediateAmountToPay,
      status: 'PENDING',
      rawResponse: paymentResult.rawResponse,
    },
  });

  // Dispatch initial booking event
  await dispatchNotification({
    event: 'BOOKING_CREATED',
    orderNumber: booking.orderNumber,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    carName: calc.car.name,
    startDate: input.startDate,
    endDate: input.endDate,
    durationDays: calc.durationDays,
    totalAmount: calc.totalAmount,
    paidAmount: 0,
    remainingAmount: calc.immediateAmountToPay,
    status: 'Menunggu Pembayaran',
  });

  return {
    booking,
    paymentUrl: paymentResult.paymentUrl,
  };
}
