import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CalendarCheck, CreditCard, Sparkles, Phone, ArrowDown, KeyRound, Check } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 pt-8 sm:pt-16 pb-16 border-b border-slate-200">
      {/* Decorative blurred glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-400/10 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm text-xs font-bold text-slate-800">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Rental Mobil Terpercaya di Jakarta</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-extrabold">DP 30% Kunci Jadwal</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Sewa Mobil Nyaman, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Jadwal Pasti Tanpa Khawatir
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Pesan langsung secara online dari HP Anda. Pilih opsi <strong>Bayar DP 30%</strong> (sisa bayar di tempat COD/transfer) atau <strong>Bayar Lunas 100%</strong> dengan QRIS instan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="#katalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Pilih Mobil Sekarang</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </Link>

            <a
              href="https://wa.me/6281234567890?text=Halo%20AutoMax,%20saya%20ingin%20konsultasi%20sewa%20mobil"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-sm transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Konsultasi WhatsApp</span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Unit Bersih & Wangi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Lepas Kunci & Supir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>QRIS & Virtual Account</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Invoice Resmi Otomatis</span>
            </div>
          </div>
        </div>

        {/* 3-Step Bento Grid */}
        <div id="cara-sewa" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black mb-4">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Pilih Mobil & Tanggal Sewa</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tentukan unit armada (Avanza, Innova, Brio, Fortuner) dan tanggal pemakaian Anda. Kalender otomatis mencegah jadwal bentrok.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all bg-gradient-to-b from-blue-50/30 to-white">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black mb-4 shadow-sm shadow-blue-500/20">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Bayar DP 30% atau Lunas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cukup scan QRIS atau bayar via Virtual Account Mayar. Jadwal langsung terkunci resmi di sistem kami.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mb-4">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Serah Terima & Pelunasan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unit diantar ke lokasi atau diambil di pool. Sisa pembayaran bagi yang memilih skema DP bisa dilunasi di tempat (COD/Transfer).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
