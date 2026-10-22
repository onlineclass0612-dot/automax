'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Car,
  Calendar,
  Settings,
  Users,
  Plus,
  CheckCircle,
  Clock,
  Phone,
  Eye,
  RefreshCw,
  AlertTriangle,
  Cog,
  Wrench,
  FileText,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import {
  updateBookingStatusAction,
  updateCarStatusAction,
  addNewCarAction,
  updateSettingsAction,
} from '@/app/actions/adminActions';
import { logoutAdminAction } from '@/app/actions/adminAuthActions';

interface Props {
  cars: any[];
  bookings: any[];
  setting: any;
}

export default function AdminDashboardClient({ cars, bookings, setting }: Props) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'cars' | 'settings'>('bookings');
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [selectedDocModal, setSelectedDocModal] = useState<{
    orderNumber: string;
    customerName: string;
    idCardPhotoUrl?: string | null;
    driverLicPhotoUrl?: string | null;
  } | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const handleUpdateBookingStatus = (id: string, status: string) => {
    startTransition(async () => {
      await updateBookingStatusAction(id, status);
    });
  };

  const handleToggleCarStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    startTransition(async () => {
      await updateCarStatusAction(id, newStatus);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pusat Kendali AutoMax</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola armada, pantau status pembayaran pesanan, dan atur sistem.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Pesanan ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cars')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'cars'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4 text-blue-600" />
            <span>Armada ({cars.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Pengaturan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              startTransition(async () => {
                await logoutAdminAction();
              });
            }}
            disabled={isPending}
            className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer ml-1"
            title="Keluar dari akun admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Daftar Transaksi & Pemesanan</h2>
              <p className="text-xs text-slate-500">Pantau pesanan yang masuk dan perbarui status sewa.</p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
              >
                <option value="ALL">Semua Pesanan</option>
                <option value="PENDING_PAYMENT">Menunggu Pembayaran</option>
                <option value="DP_PAID">DP 30% Terbayar</option>
                <option value="PAID_IN_FULL">Lunas 100%</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Invoice & Penyewa</th>
                    <th className="p-3.5">Mobil & Periode</th>
                    <th className="p-3.5">Total & Terbayar</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <Link
                          href={`/order/${b.orderNumber}`}
                          className="font-mono font-bold text-blue-600 hover:underline block"
                        >
                          {b.orderNumber}
                        </Link>
                        <span className="font-bold text-slate-900 block mt-0.5">{b.customerName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{b.customerPhone}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{b.car?.name}</span>
                        <span className="text-slate-500 text-[11px] block">
                          {new Date(b.startDate).toLocaleDateString('id-ID')} s/d{' '}
                          {new Date(b.endDate).toLocaleDateString('id-ID')} ({b.durationDays} hr)
                        </span>
                        <span className="text-[10px] text-blue-600 font-semibold">
                          {b.isWithDriver ? '• Dengan Supir' : '• Lepas Kunci'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 font-mono block">
                          Rp {b.totalAmount.toLocaleString('id-ID')}
                        </span>
                        <span className="text-emerald-700 font-semibold font-mono text-[11px] block">
                          Terbayar: Rp {b.paidAmount.toLocaleString('id-ID')}
                        </span>
                        {b.remainingAmount > 0 && (
                          <span className="text-slate-400 text-[10px] font-mono block">
                            Sisa: Rp {b.remainingAmount.toLocaleString('id-ID')} (COD)
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {b.status === 'PENDING_PAYMENT' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            Menunggu Bayar
                          </span>
                        )}
                        {b.status === 'DP_PAID' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                            DP 30% Terbayar
                          </span>
                        )}
                        {b.status === 'PAID_IN_FULL' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            Lunas Penuh
                          </span>
                        )}
                        {b.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                            Selesai
                          </span>
                        )}
                        {b.status === 'CANCELLED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                            Batal
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/order/${b.orderNumber}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Buka Invoice & Tracking"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {(b.idCardPhotoUrl || b.driverLicPhotoUrl) && (
                            <button
                              type="button"
                              onClick={() => setSelectedDocModal({
                                orderNumber: b.orderNumber,
                                customerName: b.customerName,
                                idCardPhotoUrl: b.idCardPhotoUrl,
                                driverLicPhotoUrl: b.driverLicPhotoUrl,
                              })}
                              className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
                              title="Lihat Dokumen KTP & SIM A"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <a
                            href={`https://wa.me/${b.customerPhone.replace(/^0/, '62')}?text=Halo%20Kak%20${b.customerName},%20konfirmasi%20dari%20AutoMax%20Rental%20untuk%20pesanan%20${b.orderNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                            title="Chat WhatsApp Penyewa"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <select
                            value={b.status}
                            disabled={isPending}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700"
                          >
                            <option value="PENDING_PAYMENT">Ubah Status</option>
                            <option value="DP_PAID">Set: DP 30% Terbayar</option>
                            <option value="PAID_IN_FULL">Set: Lunas 100%</option>
                            <option value="COMPLETED">Set: Selesai</option>
                            <option value="CANCELLED">Set: Batalkan</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada pesanan yang sesuai dengan filter ini.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLEET MANAGEMENT */}
      {activeTab === 'cars' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Manajemen Armada Mobil AutoMax</h2>
              <p className="text-xs text-slate-500">Kelola tarif sewa dan ketersediaan unit mobil.</p>
            </div>

            <button
              onClick={() => setShowAddCarModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Unit Mobil Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={car.imageUrl}
                    alt={car.name}
                    className="w-16 h-14 object-cover rounded-xl border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">{car.category}</span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{car.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{car.plateNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tarif Harian:</span>
                    <span className="font-bold text-slate-900">
                      Rp {car.dailyRate.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleCarStatus(car.id, car.status)}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      car.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-amber-100 hover:text-amber-800'
                        : 'bg-amber-100 text-amber-800 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                  >
                    {car.status === 'AVAILABLE' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersedia</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>Servis / Ditahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-black text-slate-900">Pengaturan Sistem Rental</h2>
            <p className="text-xs text-slate-500">Sesuaikan persentase DP dan kontak WhatsApp resmi.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                await updateSettingsAction(fd);
                alert('Pengaturan AutoMax berhasil diperbarui!');
              });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Persentase DP Minimal (%)</label>
              <input
                type="number"
                name="defaultDpPercent"
                defaultValue={setting?.defaultDpPercent || 30}
                required
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Contoh: Masukkan 30 untuk memberlakukan DP 30% dari total sewa.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Resmi Admin</label>
              <input
                type="text"
                name="adminWhatsApp"
                defaultValue={setting?.adminWhatsApp || '6281234567890'}
                required
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Pool Penjemputan Mobil</label>
              <input
                type="text"
                name="poolAddress"
                defaultValue={setting?.poolAddress || 'Pool Utama AutoMax, Jakarta Selatan'}
                required
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: TAMBAH MOBIL BARU */}
      {showAddCarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Tambah Unit Mobil Baru</h3>
              <button
                onClick={() => setShowAddCarModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Tutup ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startTransition(async () => {
                  await addNewCarAction(fd);
                  setShowAddCarModal(false);
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mobil *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Honda HR-V 1.5 SE"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    required
                    placeholder="Honda / Toyota"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    name="category"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="MPV">MPV</option>
                    <option value="SUV">SUV</option>
                    <option value="City Car">City Car</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plat Nomor *</label>
                  <input
                    type="text"
                    name="plateNumber"
                    required
                    placeholder="B 1234 XYZ"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transmisi *</label>
                  <select
                    name="transmission"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="AUTOMATIC">Matic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kursi</label>
                  <input
                    type="number"
                    name="seats"
                    defaultValue={7}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Koper</label>
                  <input
                    type="number"
                    name="luggage"
                    defaultValue={3}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bensin</label>
                  <input
                    type="text"
                    name="fuelType"
                    defaultValue="Bensin"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tarif Sewa Harian (Rp) *</label>
                <input
                  type="number"
                  name="dailyRate"
                  required
                  placeholder="500000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Foto Mobil</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://..."
                  defaultValue="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg"
              >
                {isPending ? 'Menyimpan Unit...' : 'Simpan Mobil ke Katalog'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Customer Identity Documents */}
      {selectedDocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Verifikasi Dokumen Identitas</span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedDocModal.customerName} ({selectedDocModal.orderNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocModal(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* KTP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Foto KTP Asli</span>
                  {selectedDocModal.idCardPhotoUrl ? (
                    <a
                      href={selectedDocModal.idCardPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Buka Tab Baru</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Tidak ada</span>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 overflow-hidden aspect-video bg-slate-100 flex items-center justify-center">
                  {selectedDocModal.idCardPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedDocModal.idCardPhotoUrl}
                      alt="Foto KTP"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Belum ada foto KTP</span>
                  )}
                </div>
              </div>

              {/* SIM A */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Foto SIM A</span>
                  {selectedDocModal.driverLicPhotoUrl ? (
                    <a
                      href={selectedDocModal.driverLicPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Buka Tab Baru</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Tidak ada</span>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 overflow-hidden aspect-video bg-slate-100 flex items-center justify-center">
                  {selectedDocModal.driverLicPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedDocModal.driverLicPhotoUrl}
                      alt="Foto SIM A"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Belum ada foto SIM A</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
