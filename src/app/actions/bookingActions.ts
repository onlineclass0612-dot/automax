'use server';

import { createNewBooking } from '@/services/bookingService';
import { redirect } from 'next/navigation';
import path from 'path';
import fs from 'fs/promises';

async function saveUploadedDocument(file: File | null, prefix: string): Promise<string | undefined> {
  if (!file || file.size === 0 || typeof file.arrayBuffer !== 'function') {
    return undefined;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Format foto ${prefix.toUpperCase()} harus JPG, PNG, atau WEBP.`);
  }

  // Max 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`Ukuran foto ${prefix.toUpperCase()} melebihi batas maksimal 5MB.`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const rawExt = file.name.split('.').pop() || 'jpg';
  const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/documents/${fileName}`;
}

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

  const idCardFile = formData.get('idCardPhoto') as File | null;
  const driverLicFile = formData.get('driverLicPhoto') as File | null;

  if (!carId || !startDate || !endDate || !customerName || !customerPhone) {
    return { error: 'Mohon lengkapi semua data wajib pemesanan.' };
  }

  // If lepas kunci (without driver), SIM A is strongly recommended / mandatory
  if (!isWithDriver && (!driverLicFile || driverLicFile.size === 0)) {
    return { error: 'Untuk layanan Lepas Kunci (Bawa Sendiri), Anda wajib melampirkan foto SIM A aktif.' };
  }

  if (!idCardFile || idCardFile.size === 0) {
    return { error: 'Anda wajib melampirkan foto KTP asli untuk verifikasi identitas penyewa.' };
  }

  let result;
  try {
    const idCardPhotoUrl = await saveUploadedDocument(idCardFile, 'ktp');
    const driverLicPhotoUrl = await saveUploadedDocument(driverLicFile, 'sim');

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
      idCardPhotoUrl,
      driverLicPhotoUrl,
      notes: notes || undefined,
    });
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan saat memproses pesanan' };
  }

  // Return redirect destination URL for reliable client-side navigation
  const redirectUrl =
    result.paymentUrl && result.paymentUrl.startsWith('http')
      ? result.paymentUrl
      : `/order/${result.booking.orderNumber}`;

  return {
    success: true,
    redirectUrl,
    orderNumber: result.booking.orderNumber,
  };
}
