'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Car, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { loginAdminAction } from '@/app/actions/adminAuthActions';

export default function AdminLoginForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFillDemo = () => {
    setEmail('admin@automax.id');
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);

    startTransition(async () => {
      const res = await loginAdminAction(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-white">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Car className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            Auto<span className="text-blue-500">Max</span>
          </span>
        </Link>
        <h2 className="text-xl font-black tracking-tight text-white">Portal Masuk Admin</h2>
        <p className="text-xs text-slate-400">
          Autentikasi terenkripsi untuk manajemen armada & verifikasi pesanan
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Email Admin</span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@automax.id"
              className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Kata Sandi (Password)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm pl-4 pr-11 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span>Memverifikasi Akses...</span>
          ) : (
            <>
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Helper Box */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-center sm:text-left">
            <span className="font-bold text-slate-300 block">Akun Demo Pengembang:</span>
            <span className="font-mono text-[11px] text-slate-400">admin@automax.id • password123</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Isi Otomatis</span>
          </button>
        </div>
      </div>

      {/* Back to Website */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Kembali ke Halaman Utama AutoMax
        </Link>
      </div>
    </div>
  );
}
