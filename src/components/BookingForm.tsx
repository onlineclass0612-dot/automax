'use client';

import React, { useState, useTransition } from 'react';
import { CarItemProps } from './CarCard';
import { Calendar, User, Phone, MapPin, ShieldCheck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { submitBookingAction } from '@/app/actions/bookingActions';
import { calculatePricingBreakdown, PRICING_CONSTANTS } from '@/lib/pricing';

export default function BookingForm({ car }: { car: CarItemProps }) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for instant live calculation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 2);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(nextDay.toISOString().slice(0, 10));
  const [isWithDriver, setIsWithDriver] = useState(false);
  const [paymentType, setPaymentType] = useState<'DOWN_PAYMENT' | 'FULL_PAYMENT'>('DOWN_PAYMENT');

  // Live Cost Calculation via Domain Pricing Engine (DRY)
  const pricing = calculatePricingBreakdown({
    dailyRate: car.dailyRate,
    startDate,
    endDate,
    isWithDriver,
    paymentType,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.set('isWithDriver', String(isWithDriver));
    formData.set('paymentType', paymentType);

    startTransition(async () => {
      const res = await submitBookingAction(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Formulir Pemesanan Sewa
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Unit: <strong className="text-slate-800">{car.name}</strong> • Bebas pilih bayar DP 30% atau Lunas
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="carId" value={car.id} />

        {/* 1. Date Range Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Tanggal Mulai Sewa</span>
            </label>
            <input
              type="date"
              name="startDate"
              required
              value={startDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                const newStart = e.target.value;
                setStartDate(newStart);
                if (endDate <= newStart) {
                  const next = new Date(newStart);
                  next.setDate(next.getDate() + 1);
                  setEndDate(next.toISOString().slice(0, 10));
                }
              }}
              className="w-full text-xs sm:text-sm font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Tanggal Selesai Sewa</span>
            </label>
            <input
              type="date"
              name="endDate"
              required
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 2. Driver Option Toggle */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="block text-xs font-bold text-slate-800 mb-2">Pilihan Layanan Supir</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsWithDriver(false)}
              className={`p-3 rounded-xl text-xs font-bold transition-all text-center border ${
                !isWithDriver
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Lepas Kunci (Bawa Sendiri)
            </button>
            <button
              type="button"
              onClick={() => setIsWithDriver(true)}
              className={`p-3 rounded-xl text-xs font-bold transition-all text-center border ${
                isWithDriver
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Dengan Supir (+Rp {(PRICING_CONSTANTS.DAILY_DRIVER_FEE / 1000).toLocaleString('id-ID')}rb/hr)
            </button>
          </div>
        </div>

        {/* 3. Customer Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Diri Penyewa</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Sesuai KTP *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="customerName"
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="customerPhone"
                  required
                  placeholder="081234567890"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email (Opsional untuk Invoice)</label>
              <input
                type="email"
                name="customerEmail"
                placeholder="budi@gmail.com"
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Penjemputan / Catatan</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="customerAddress"
                placeholder="Contoh: Ambil di Pool / Antar ke Bandara Soetta T3"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Flexible Payment Scheme Selection */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Pilih Skema Pembayaran</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">Diproses via Mayar (QRIS / VA)</span>
          </label>

          {/* Option A: DP 30% */}
          <label
            onClick={() => setPaymentType('DOWN_PAYMENT')}
            className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
              paymentType === 'DOWN_PAYMENT'
                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-sm'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentType === 'DOWN_PAYMENT'}
                  onChange={() => setPaymentType('DOWN_PAYMENT')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Bayar Uang Muka (DP 30%)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Paling Populer
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kunci jadwal sewa sekarang. Sisa pelunasan (<strong>Rp {pricing.remainingAmount.toLocaleString('id-ID')}</strong>) dibayar di lokasi saat serah terima unit (COD / Tunai / Transfer).
                  </p>
                </div>
              </div>
              <span className="text-base font-black text-blue-600 shrink-0 ml-3">
                Rp {pricing.depositRequired.toLocaleString('id-ID')}
              </span>
            </div>
          </label>

          {/* Option B: Full Payment 100% */}
          <label
            onClick={() => setPaymentType('FULL_PAYMENT')}
            className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
              paymentType === 'FULL_PAYMENT'
                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-sm'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentType === 'FULL_PAYMENT'}
                  onChange={() => setPaymentType('FULL_PAYMENT')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900">Bayar Lunas Langsung (100%)</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Praktis, saat serah terima mobil tidak perlu transaksi lagi.
                  </p>
                </div>
              </div>
              <span className="text-base font-black text-slate-900 shrink-0 ml-3">
                Rp {pricing.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </label>
        </div>

        {/* 5. Live Summary Box */}
        <div className="bg-slate-950 text-white p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Durasi Sewa:</span>
            <span className="font-bold text-white">{pricing.durationDays} Hari</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Biaya Mobil ({pricing.durationDays} Hari):</span>
            <span className="font-semibold text-white">Rp {pricing.carSubtotal.toLocaleString('id-ID')}</span>
          </div>
          {isWithDriver && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Layanan Supir ({pricing.durationDays} Hari):</span>
              <span className="font-semibold text-white">Rp {pricing.driverSubtotal.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-300">Total Keseluruhan:</span>
            <span className="text-lg font-black text-white">Rp {pricing.totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300">
              {paymentType === 'DOWN_PAYMENT' ? 'Tagihan Pembayaran Sekarang (DP 30%):' : 'Tagihan Sekarang (Lunas):'}
            </span>
            <span className="text-base font-black text-blue-400">
              Rp {pricing.immediateAmountToPay.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          {isPending ? (
            <span>Menghubungkan ke Pembayaran Mayar...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                Lanjutkan Pembayaran Rp{' '}
                {pricing.immediateAmountToPay.toLocaleString('id-ID')}
              </span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400">
          🔒 Pembayaran resmi diamankan dengan sistem enkripsi Mayar.
        </p>
      </form>
    </div>
  );
}
