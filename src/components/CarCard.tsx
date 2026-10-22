import React from 'react';
import Link from 'next/link';
import { Users, Briefcase, Cog, Fuel, ArrowRight, ShieldCheck } from 'lucide-react';

export interface CarItemProps {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  transmission: string;
  seats: number;
  luggage: number;
  fuelType: string;
  dailyRate: number;
  imageUrl: string;
  status: string;
}

export default function CarCard({ car }: { car: CarItemProps }) {
  const isAvailable = car.status === 'AVAILABLE';
  const dpAmount = Math.round((car.dailyRate * 30) / 100);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={car.imageUrl}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
            {car.category}
          </span>
          {isAvailable ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-emerald-500/90 backdrop-blur-md text-white shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Tersedia
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-amber-500/90 backdrop-blur-md text-white shadow-sm">
              Sedang Disewa
            </span>
          )}
        </div>

        {/* DP Highlight Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/90 backdrop-blur-md text-white shadow-sm">
            DP Mulai Rp {dpAmount.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{car.brand}</span>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {car.name}
          </h3>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 my-4 py-3 border-y border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5">
              <Cog className="w-4 h-4 text-slate-400" />
              <span>{car.transmission === 'AUTOMATIC' ? 'Matic' : 'Manual'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{car.seats} Kursi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-slate-400" />
              <span>{car.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Tarif Sewa Harian</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">
                Rp {car.dailyRate.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-500 font-medium">/hari</span>
            </div>
          </div>

          <Link
            href={`/cars/${car.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm group-hover:shadow-md group-hover:shadow-blue-500/20"
          >
            <span>Pilih Mobil</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
