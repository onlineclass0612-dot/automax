import React from 'react';
import Link from 'next/link';
import { Car, ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Auto<span className="text-blue-500">Max</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solusi rental mobil terpercaya di Jakarta & sekitarnya. Unit terbaru, bersih, wangi, dengan opsi Lepas Kunci maupun Dengan Supir.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Jaminan Kunci Jadwal DP 30%</span>
            </div>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Layanan</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#katalog" className="hover:text-white transition-colors">
                  Sewa Mobil Lepas Kunci
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-white transition-colors">
                  Sewa Mobil Dengan Supir
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-white transition-colors">
                  Antar Jemput Bandara
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-white transition-colors">
                  Sewa Mingguan & Bulanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational & Pool */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Lokasi Pool</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan 12430</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Layanan 24 Jam Setiap Hari</span>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Hubungi Kami</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>cs@automax.id</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AutoMax Car Rental. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-slate-300">
              Admin Portal
            </Link>
            <span>•</span>
            <span className="text-slate-400">Integrated with Mayar Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
