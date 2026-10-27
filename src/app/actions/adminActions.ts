'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAdminSession, clearAdminSessionCookie } from '@/services/adminAuthService';

/**
 * Defensive Security: Verify that the caller has a valid, cryptographically signed admin session
 */
async function verifyAdminPermission() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Akses ditolak: Anda harus terotentikasi sebagai Admin AutoMax.');
  }
  return session;
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  revalidatePath('/admin');
  return { success: true };
}

export async function updateBookingStatusAction(bookingId: string, newStatus: string) {
  try {
    await verifyAdminPermission();
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCarStatusAction(carId: string, newStatus: string) {
  try {
    await verifyAdminPermission();
    await prisma.car.update({
      where: { id: carId },
      data: { status: newStatus },
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addNewCarAction(formData: FormData) {
  try {
    await verifyAdminPermission();
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;
    const plateNumber = formData.get('plateNumber') as string;
    const transmission = formData.get('transmission') as string;
    const seats = parseInt(formData.get('seats') as string) || 7;
    const luggage = parseInt(formData.get('luggage') as string) || 3;
    const fuelType = formData.get('fuelType') as string;
    const dailyRate = parseInt(formData.get('dailyRate') as string) || 400000;
    const imageUrl =
      (formData.get('imageUrl') as string) ||
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop';

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    await prisma.car.create({
      data: {
        name,
        slug,
        brand,
        category,
        plateNumber,
        transmission,
        seats,
        luggage,
        fuelType,
        dailyRate,
        imageUrl,
        status: 'AVAILABLE',
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateSettingsAction(formData: FormData) {
  try {
    await verifyAdminPermission();
    const defaultDpPercent = parseInt(formData.get('defaultDpPercent') as string) || 30;
    const adminWhatsApp = formData.get('adminWhatsApp') as string;
    const poolAddress = formData.get('poolAddress') as string;

    await prisma.setting.upsert({
      where: { id: 'global' },
      update: { defaultDpPercent, adminWhatsApp, poolAddress },
      create: { id: 'global', defaultDpPercent, adminWhatsApp, poolAddress },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
