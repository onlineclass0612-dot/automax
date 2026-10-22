'use client';

import React, { useState } from 'react';
import CarCard, { CarItemProps } from './CarCard';
import { Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FleetCatalog({ cars }: { cars: CarItemProps[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('ALL');

  const categories = ['ALL', 'MPV', 'SUV', 'City Car'];

  const filteredCars = cars.filter((car) => {
    const matchCat = selectedCategory === 'ALL' || car.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchTrans = selectedTransmission === 'ALL' || car.transmission === selectedTransmission;
    return matchCat && matchTrans;
  });

  return (
    <section id="katalog" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Armada Pilihan Terawat & Siap Jalan</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Pilih Mobil Sesuai Kebutuhan Anda
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-3">
          Tersedia pilihan transmisi Matic & Manual. Kunci jadwal langsung dengan <strong>DP 30%</strong> via QRIS atau Virtual Account Mayar.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'Semua Tipe' : cat}
            </button>
          ))}
        </div>

        {/* Transmission Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Transmisi:
          </span>
          <select
            value={selectedTransmission}
            onChange={(e) => setSelectedTransmission(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Transmisi</option>
            <option value="AUTOMATIC">Matic (Otomatis)</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </div>

      {/* Cars Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <p className="text-slate-500 font-medium text-sm">Tidak ada mobil yang cocok dengan filter yang Anda pilih.</p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedTransmission('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Reset Filter
          </button>
        </div>
      )}
    </section>
  );
}
