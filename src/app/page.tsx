import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FleetCatalog from '@/components/FleetCatalog';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { Shield, Sparkles, Clock, MapPin, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default async function HomePage() {
  const cars = await prisma.car.findMany({
    orderBy: { dailyRate: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <HeroSection />

        <FleetCatalog cars={cars} />

        {/* Why Choose AutoMax Section */}
        <section id="keunggulan" className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Keunggulan AutoMax</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Kenapa Memilih AutoMax Car Rental?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Jaminan Kunci Jadwal DP 30%</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tidak perlu bayar penuh di awal jika belum yakin. Cukup DP 30%, unit mobil dipastikan aman terkunci untuk Anda.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Kondisi Mobil Prima & Bersih</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Setiap unit melalui proses cuci dan inspeksi mesin menyeluruh sebelum diserahterimakan kepada penyewa.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Layanan CS 24 Jam Siaga</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tim kami siap membantu kebutuhan rental mendadak, antar jemput bandara, atau konsultasi rute perjalanan kapan saja.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Invoice & Kwitansi Resmi</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dapatkan e-Tiket & invoice resmi berstempel digital yang langsung bisa diunduh untuk keperluan klaim kantor atau arsip pribadi.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
