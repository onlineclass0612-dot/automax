'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Car, Phone, ShieldCheck, Menu, X, Clock, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Auto<span className="text-blue-600">Max</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-700 tracking-wider uppercase -mt-1">
                Rental Mobil
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#katalog" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Katalog Mobil
            </Link>
            <Link href="/#cara-sewa" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Cara Sewa
            </Link>
            <Link href="/#keunggulan" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Keunggulan
            </Link>
            <Link href="/admin" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Portal Admin
            </Link>
          </nav>

          {/* Quick Action */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://wa.me/6281234567890?text=Halo%20AutoMax,%20saya%20ingin%20tanya%20sewa%20mobil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp CS</span>
            </a>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/#katalog"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Katalog Mobil
          </Link>
          <Link
            href="/#cara-sewa"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cara Sewa & Skema DP
          </Link>
          <Link
            href="/#keunggulan"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Keunggulan Layanan
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-blue-600 hover:bg-blue-50"
          >
            Portal Admin AutoMax
          </Link>
          <a
            href="https://wa.me/6281234567890?text=Halo%20AutoMax,%20saya%20ingin%20tanya%20sewa%20mobil"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Chat WhatsApp CS</span>
          </a>
        </div>
      )}
    </header>
  );
}
