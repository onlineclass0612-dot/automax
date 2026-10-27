'use client';

import React, { useState, useTransition } from 'react';
import { Printer, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  orderNumber: string;
  showSimulation?: boolean;
}

export default function OrderActionsClient({ orderNumber, showSimulation = false }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePrint = () => {
    window.print();
  };

  const handleSimulatePayment = async (type: 'DOWN_PAYMENT' | 'FULL_PAYMENT') => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/payment/simulate-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber, paymentType: type }),
        });
        if (res.ok) {
          router.refresh();
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sandbox Simulation Dropdown / Buttons (Hidden in production for non-admin) */}
      {showSimulation && (
        <>
          <button
            onClick={() => handleSimulatePayment('DOWN_PAYMENT')}
            disabled={isPending}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
            title="Simulasi bayar DP 30% untuk testing sandbox"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPending ? 'Memproses...' : 'Simulasi Bayar DP 30%'}</span>
          </button>

          <button
            onClick={() => handleSimulatePayment('FULL_PAYMENT')}
            disabled={isPending}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
            title="Simulasi bayar Lunas 100% untuk testing sandbox"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isPending ? 'Memproses...' : 'Simulasi Bayar Lunas'}</span>
          </button>
        </>
      )}

      {/* Print PDF Button */}
      <button
        onClick={handlePrint}
        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
      >
        <Printer className="w-4 h-4 text-slate-500" />
        <span>Cetak / Unduh PDF</span>
      </button>

      {/* WhatsApp CS Button */}
      <a
        href={`https://wa.me/6281234567890?text=Halo%20Admin%20AutoMax,%20saya%20ingin%20konfirmasi%20pesanan%20saya%20dengan%20nomor%20${orderNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all"
      >
        <Phone className="w-3.5 h-3.5 text-emerald-600" />
        <span>Chat WhatsApp</span>
      </a>
    </div>
  );
}
