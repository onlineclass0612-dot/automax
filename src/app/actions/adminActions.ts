'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * Defensive Security: Verify that the caller has admin permissions
 */
async function verifyAdminPermission() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('automax_admin_token')?.value;
  const adminSecret = process.env.ADMIN_SECRET || 'automax_secret_key_2026';

  // In production, enforce valid session token
  if (process.env.NODE_ENV === 'production') {
    if (!sessionToken || sessionToken !== adminSecret) {
      throw new Error('Akses ditolak: Anda harus terotentikasi sebagai Admin AutoMax.');
    }
  }
}

export async function adminLoginAction(password: string) {
  const adminSecret = process.env.ADMIN_SECRET || 'automax_secret_key_2026';
  
  // Verify against database demo admin or ADMIN_SECRET
  const admin = await prisma.adminUser.findFirst({
    where: { email: 'admin@automax.id' },
  });

  const isValid = password === adminSecret || password === (admin?.password || 'password123');

  if (!isValid) {
    return { error: 'Password admin tidak valid.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('automax_admin_token', adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return { success: true };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('automax_admin_token');
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
