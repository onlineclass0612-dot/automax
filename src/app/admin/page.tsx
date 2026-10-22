import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/services/adminAuthService';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [cars, bookings, setting] = await Promise.all([
    prisma.car.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { car: true },
    }),
    prisma.setting.findUnique({ where: { id: 'global' } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminDashboardClient
            cars={cars}
            bookings={bookings}
            setting={setting}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
