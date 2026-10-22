import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Phone,
  ArrowRight,
  CreditCard,
  MapPin,
  Calendar,
  AlertCircle,
  Car,
} from 'lucide-react';
import OrderActionsClient from './OrderActionsClient';

interface Props {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ simulated_payment?: string }>;
}

export const dynamic = 'force-dynamic';


export default async function OrderTrackingPage({ params, searchParams }: Props) {
  const { orderNumber } = await params;
  const { simulated_payment } = await searchParams;

  const booking = await prisma.booking.findUnique({
    where: { orderNumber },
    include: {
      car: true,
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!booking) {
    notFound();
  }

  const isPending = booking.status === 'PENDING_PAYMENT';
  const isDpPaid = booking.status === 'DP_PAID';
  const isPaidInFull = booking.status === 'PAID_IN_FULL';
  const isActive = booking.status === 'ACTIVE';
  const isCompleted = booking.status === 'COMPLETED';

  // Format Dates
  const startDateStr = new Date(booking.startDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const endDateStr = new Date(booking.endDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Action Toolbar */}
          <div className="no-print flex items-center justify-between mb-6">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>

            <OrderActionsClient orderNumber={booking.orderNumber} />
          </div>

          {/* Sandbox Simulation Helper Banner (Only when pending) */}
          {isPending && (
            <div className="no-print mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>
                  <strong>Mode Pengujian (Sandbox):</strong> Anda dapat menyimulasikan konfirmasi pembayaran Mayar secara instan tanpa uang sungguhan.
                </span>
              </div>
            </div>
          )}

          {/* MAIN INVOICE & ORDER CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
            {/* Invoice Header */}
            <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Official Invoice</span>
                  <h1 className="text-2xl font-black tracking-tight text-white">AutoMax Car Rental</h1>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block font-mono">Nomor Invoice</span>
                <span className="text-lg font-black text-white font-mono">{booking.orderNumber}</span>
                <span className="text-[11px] text-slate-400 block">
                  Tanggal: {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>

            {/* Status Banner */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isPending && (
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                )}
                {isDpPaid && (
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                {isPaidInFull && (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Status Pesanan</span>
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="text-base font-extrabold text-amber-700">
                        Menunggu Pembayaran {booking.paymentType === 'DOWN_PAYMENT' ? 'DP (30%)' : 'Lunas'}
                      </span>
                    )}
                    {isDpPaid && (
                      <span className="text-base font-extrabold text-blue-700">
                        DP 30% Terkonfirmasi — Jadwal Mobil Terkunci
                      </span>
                    )}
                    {isPaidInFull && (
                      <span className="text-base font-extrabold text-emerald-700">
                        Lunas Penuh (100%) — Mobil Siap Serah Terima
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Digital Stamp */}
              {(isDpPaid || isPaidInFull) && (
                <div
                  className={`px-4 py-1.5 rounded-xl border-2 font-black text-xs uppercase tracking-widest rotate-[-3deg] shadow-sm ${
                    isPaidInFull
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                      : 'border-blue-600 text-blue-700 bg-blue-50'
                  }`}
                >
                  {isPaidInFull ? '✓ LUNAS TOTAL' : '✓ DP TERKONFIRMASI'}
                </div>
              )}
            </div>

            {/* Customer & Rental Info Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">Data Penyewa</span>
                <p className="text-sm font-bold text-slate-900">{booking.customerName}</p>
                <p className="text-slate-600 font-mono mt-0.5">WhatsApp: {booking.customerPhone}</p>
                {booking.customerEmail && <p className="text-slate-600">{booking.customerEmail}</p>}
                {booking.customerAddress && (
                  <p className="text-slate-600 mt-2 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{booking.customerAddress}</span>
                  </p>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">Detail Armada & Durasi</span>
                <p className="text-sm font-bold text-slate-900">{booking.car.name}</p>
                <p className="text-slate-600 font-mono">Plat No: {booking.car.plateNumber}</p>
                <p className="text-slate-600 mt-1">Layanan: <strong>{booking.isWithDriver ? 'Dengan Supir' : 'Lepas Kunci'}</strong></p>
                <p className="text-slate-600 mt-1">
                  Periode: <strong>{startDateStr}</strong> s/d <strong>{endDateStr}</strong> ({booking.durationDays} Hari)
                </p>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rincian Perhitungan Biaya</h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3.5">Deskripsi Item</th>
                      <th className="p-3.5 text-center">Durasi</th>
                      <th className="p-3.5 text-right">Tarif Harian</th>
                      <th className="p-3.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Sewa Unit {booking.car.name}</td>
                      <td className="p-3.5 text-center">{booking.durationDays} Hari</td>
                      <td className="p-3.5 text-right font-mono">Rp {booking.dailyRateSnap.toLocaleString('id-ID')}</td>
                      <td className="p-3.5 text-right font-mono font-bold">
                        Rp {(booking.dailyRateSnap * booking.durationDays).toLocaleString('id-ID')}
                      </td>
                    </tr>
                    {booking.isWithDriver && (
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-900">Layanan Driver Berpengalaman</td>
                        <td className="p-3.5 text-center">{booking.durationDays} Hari</td>
                        <td className="p-3.5 text-right font-mono">Rp {booking.driverFeePerDay.toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-right font-mono font-bold">
                          Rp {(booking.driverFeePerDay * booking.durationDays).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Summary Rows */}
              <div className="pt-2 max-w-sm ml-auto space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Total Nilai Sewa:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    Rp {booking.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <span>Dana Telah Diterima:</span>
                  <span className="font-mono">Rp {booking.paidAmount.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Sisa Pelunasan di Lokasi:</span>
                  <span className={`font-mono ${booking.remainingAmount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                    {booking.remainingAmount > 0
                      ? `Rp ${booking.remainingAmount.toLocaleString('id-ID')}`
                      : 'Rp 0 (LUNAS)'}
                  </span>
                </div>
              </div>

              {/* Payment Instructions if Remaining > 0 */}
              {booking.remainingAmount > 0 && !isPending && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <span className="font-bold block mb-1">Catatan Pelunasan di Lokasi:</span>
                  <span>
                    Sisa biaya sebesar <strong>Rp {booking.remainingAmount.toLocaleString('id-ID')}</strong> dapat dilunasi saat serah terima kunci mobil (bisa via Tunai / COD atau transfer m-Banking).
                  </span>
                </div>
              )}
            </div>

            {/* Attached Verification Documents */}
            {(booking.idCardPhotoUrl || booking.driverLicPhotoUrl) && (
              <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dokumen Verifikasi Identitas Terlampir</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {booking.idCardPhotoUrl && (
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={booking.idCardPhotoUrl} alt="Foto KTP" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">KTP Terverifikasi</span>
                        <a href={booking.idCardPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-600 hover:underline">
                          Lihat Ukuran Penuh
                        </a>
                      </div>
                    </div>
                  )}
                  {booking.driverLicPhotoUrl && (
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={booking.driverLicPhotoUrl} alt="Foto SIM A" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">SIM A Terverifikasi</span>
                        <a href={booking.driverLicPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-600 hover:underline">
                          Lihat Ukuran Penuh
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Official Footer Note */}
            <div className="bg-slate-50 p-6 border-t border-slate-200 text-[11px] text-slate-500 text-center">
              AutoMax Car Rental • Pool: Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan • CS WhatsApp: +62 812-3456-7890
              <br />
              Dokumen ini merupakan bukti reservasi dan pembayaran yang sah dari sistem AutoMax.
            </div>
          </div>
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
