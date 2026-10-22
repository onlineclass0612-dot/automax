import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Briefcase, Cog, Fuel, Check, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;

  const car = await prisma.car.findUnique({
    where: { slug },
  });

  if (!car) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs / Back button */}
          <div className="mb-6">
            <Link
              href="/#katalog"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog Mobil</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Car Showcase & Specs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Main Image */}
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-200 border border-slate-200 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={car.imageUrl}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white">
                    {car.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 backdrop-blur-md text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Unit Tersedia
                  </span>
                </div>
              </div>

              {/* Title & Price Header */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{car.brand}</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{car.name}</h1>
                  <span className="text-xs text-slate-400 font-mono">Plat No: {car.plateNumber}</span>
                </div>

                <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
                  <span className="text-3xl font-black text-slate-900">
                    Rp {car.dailyRate.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ hari sewa</span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <Cog className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <span className="text-[10px] text-slate-400 block font-medium">Transmisi</span>
                    <span className="text-xs font-bold text-slate-800">
                      {car.transmission === 'AUTOMATIC' ? 'Matic' : 'Manual'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <Users className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <span className="text-[10px] text-slate-400 block font-medium">Kapasitas</span>
                    <span className="text-xs font-bold text-slate-800">{car.seats} Penumpang</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <Briefcase className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <span className="text-[10px] text-slate-400 block font-medium">Bagasi</span>
                    <span className="text-xs font-bold text-slate-800">{car.luggage} Koper</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <Fuel className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <span className="text-[10px] text-slate-400 block font-medium">Bahan Bakar</span>
                    <span className="text-xs font-bold text-slate-800">{car.fuelType}</span>
                  </div>
                </div>

                {/* Inclusions checklist */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Fasilitas & Jaminan AutoMax:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Mobil bersih & disinfeksi kabin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>AC Dingin & Audio Bluetooth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Bantuan darurat 24 jam</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Jaminan jadwal pasti terkunci</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Booking Form */}
            <div className="lg:col-span-6">
              <BookingForm car={car} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
