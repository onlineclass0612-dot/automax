import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'AutoMax — Rental Mobil Nyaman, Jadwal Pasti DP 30%',
  description:
    'Platform rental mobil modern di Jakarta. Sewa lepas kunci & dengan supir. Bebas pilih bayar DP 30% atau Lunas via QRIS & Virtual Account Mayar.',
  keywords: [
    'Rental Mobil Jakarta',
    'Sewa Mobil Lepas Kunci',
    'Sewa Avanza Murah',
    'Rental Innova Reborn',
    'AutoMax Rental Mobil',
    'Sewa Mobil DP 30 Persen',
  ],
  authors: [{ name: 'AutoMax' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
