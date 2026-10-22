'use server';

import { createNewBooking } from '@/services/bookingService';
import { redirect } from 'next/navigation';

export async function submitBookingAction(formData: FormData) {
  const carId = formData.get('carId') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const isWithDriver = formData.get('isWithDriver') === 'true';
  const paymentType = (formData.get('paymentType') as 'DOWN_PAYMENT' | 'FULL_PAYMENT') || 'DOWN_PAYMENT';
  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const customerAddress = formData.get('customerAddress') as string;
  const notes = formData.get('notes') as string;

  if (!carId || !startDate || !endDate || !customerName || !customerPhone) {
    return { error: 'Mohon lengkapi semua data wajib pemesanan.' };
  }

  let result;
  try {
    result = await createNewBooking({
      carId,
      startDate,
      endDate,
      isWithDriver,
      paymentType,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerAddress: customerAddress || undefined,
      notes: notes || undefined,
    });
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan saat memproses pesanan' };
  }

  // Redirect to order tracking or Mayar payment URL
  if (result.paymentUrl && result.paymentUrl.startsWith('http')) {
    redirect(result.paymentUrl);
  } else {
    redirect(`/order/${result.booking.orderNumber}`);
  }
}
