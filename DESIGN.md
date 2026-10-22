# Design & Architecture Document (DESIGN.md)
## Proyek: AutoMax — Modern Car Rental Web Platform

- **Arsitektur:** Full-Stack Next.js (App Router) + TypeScript
- **Database & ORM:** Prisma ORM dengan SQLite (Dev) ➔ PostgreSQL (Prod)
- **UI & Styling:** Tailwind CSS + Lucide Icons (Mengacu pada panduan *UI/UX Pro Max*)

---

## 1. Arsitektur Sistem

Sistem AutoMax menggunakan arsitektur monolitik modern yang menyatukan antarmuka visual (Frontend) dan logika bisnis server (Backend API & Server Actions) dalam satu ekosistem:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER                              │
├──────────────────────────────────┬─────────────────────────────────────┤
│      SISI KLIEN (FRONTEND)       │        SISI SERVER (BACKEND)        │
│                                  │                                     │
│  • Halaman Utama & Katalog       │  • Server Actions (Mutasi Booking)  │
│  • Kalender Pemesanan Interaktif │  • Endpoint API Mayar Webhook       │
│  • Halaman Status & Tracking     │  • Engine Pembuat PDF Invoice       │
│  • Dashboard Admin Mobil & Order │  • Notification Service (Hook Bot)  │
└─────────────────┬────────────────┴──────────────────┬──────────────────┘
                  │                                   │
                  ▼                                   ▼
          [ Browser / HP ]                   [ Prisma ORM Client ]
       (Responsive PWA-Ready)                         │
                                                      ▼
                                            [ Database SQLite/PG ]
```

---

## 2. Skema Database Relasional (Prisma Data Model)

Sesuai panduan *database-schema-validator*, semua relasi memiliki indeks, status menggunakan enum terikat, nilai uang menggunakan integer rupiah, dan data historis harga disalin (*snapshotted*) pada setiap transaksi sewa:

```prisma
// datasource & generator
datasource db {
  provider = "sqlite" // Siap dialihkan ke "postgresql" saat produksi
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Data Mobil Armada
model Car {
  id           String        @id @default(cuid())
  name         String        // Contoh: "Toyota Avanza 1.5 G CVT"
  slug         String        @unique
  brand        String        // Contoh: "Toyota"
  category     String        // "MPV", "SUV", "City Car"
  plateNumber  String        @unique
  transmission String        // "AUTOMATIC" | "MANUAL"
  seats        Int           // 5 atau 7
  luggage      Int           // Kapasitas tas/koper
  fuelType     String        // "Bensin" | "Diesel"
  dailyRate    Int           // Harga sewa per hari dalam Rupiah (e.g. 400000)
  imageUrl     String        // URL foto resolusi tinggi
  status       CarStatus     @default(AVAILABLE)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  bookings     Booking[]

  @@index([status])
  @@index([category])
}

enum CarStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
}

// 2. Transaksi Pemesanan (Booking)
model Booking {
  id              String         @id @default(cuid())
  orderNumber     String         @unique // Format: "INV-202610-001"
  carId           String
  car             Car            @relation(fields: [carId], references: [id], onDelete: Restrict)
  
  // Data Penyewa
  customerName    String
  customerPhone   String         // Nomor WhatsApp
  customerEmail   String?
  customerAddress String?
  idCardPhotoUrl  String?        // Foto KTP
  driverLicPhotoUrl String?      // Foto SIM A

  // Rincian Sewa
  startDate       DateTime
  endDate         DateTime
  durationDays    Int
  isWithDriver    Boolean        @default(false)
  driverFeePerDay Int            @default(0)
  dailyRateSnap   Int            // Snapshot harga harian saat booking dilakukan

  // Rincian Biaya & Skema DP
  totalAmount     Int            // Total keseluruhan biaya sewa
  depositPercent  Int            @default(30) // Persentase DP (30)
  depositRequired Int            // Nominal DP yang harus dibayar (30% * total)
  paidAmount      Int            @default(0)  // Dana yang sudah masuk
  remainingAmount Int            // Sisa tagihan yang harus dibayar
  paymentType     PaymentType    @default(DOWN_PAYMENT) // DP_30 atau FULL_100

  // Status Transaksi
  status          BookingStatus  @default(PENDING_PAYMENT)
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  payments        Payment[]

  @@index([carId])
  @@index([status])
  @@index([startDate, endDate])
}

enum PaymentType {
  DOWN_PAYMENT // Bayar DP 30%
  FULL_PAYMENT // Bayar Lunas 100%
}

enum BookingStatus {
  PENDING_PAYMENT // Menunggu Pembayaran Pertama
  DP_PAID         // DP 30% Diterima (Jadwal Terkunci / Confirmed)
  PAID_IN_FULL    // Lunas 100%
  ACTIVE          // Mobil sedang dipakai penyewa
  COMPLETED       // Mobil telah kembali dengan aman
  CANCELLED       // Pesanan Dibatalkan
}

// 3. Riwayat Pembayaran (Payment Logs)
model Payment {
  id             String         @id @default(cuid())
  bookingId      String
  booking        Booking        @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  gateway        String         @default("MAYAR") // "MAYAR" | "CASH_COD" | "MANUAL_TRANSFER"
  transactionId  String?        // ID transaksi dari Mayar
  paymentUrl     String?        // Link pembayaran Mayar
  amount         Int
  method         String?        // "QRIS", "BCA_VA", "MANDIRI_VA", "CASH"
  status         PaymentStatus  @default(PENDING)
  rawResponse    String?        // JSON log respon Mayar
  paidAt         DateTime?
  createdAt      DateTime       @default(now())

  @@index([bookingId])
  @@index([status])
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  EXPIRED
}

// 4. Pengaturan Global & Akun Admin
model Setting {
  id              String   @id @default("global")
  rentalName      String   @default("AutoMax Car Rental")
  adminWhatsApp   String   @default("6281234567890")
  defaultDpPercent Int     @default(30)
  poolAddress     String   @default("Pool AutoMax, Jakarta Selatan")
  updatedAt       DateTime @updatedAt
}

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed bcrypt
  name      String
  createdAt DateTime @default(now())
}
```

---

## 3. Sistem Desain UI/UX (Panduan *UI/UX Pro Max*)

Menggunakan perpaduan gaya **Modern Luxury Automotive** dengan sentuhan **Bento Grid** dan **Subtle Glassmorphism**:

### 3.1 Palet Warna (Color Tokens)
- **Primary Canvas (Light):** Slate 50 (`#F8FAFC`) untuk latar belakang bersih dan segar.
- **Surface & Cards:** Pure White (`#FFFFFF`) dengan border halus Slate 200 (`#E2E8F0`) dan bayangan lembut (*subtle soft shadow*).
- **Dark Elements & Navigation:** Deep Navy Slate (`#0F172A`) untuk memberikan kesan kokoh dan premium khas industri otomotif.
- **Brand Primary Accent:** Electric Cobalt Blue (`#2563EB`) untuk tombol aksi utama (*Call to Action*).
- **Status Hijau (Lunas / Sukses):** Emerald (`#10B981`) melambangkan kepastian jadwal dan pembayaran sah.
- **Status Kuning/Oranye (Menunggu DP):** Amber (`#F59E0B`) untuk tagihan yang perlu diselesaikan.

### 3.2 Tipografi
- **Primary Font:** *Plus Jakarta Sans* atau *Inter* (Google Fonts).
- **Hirarki:**
  - Heading Display: Font-weight 800 (ExtraBold), letter-spacing tight (`-0.03em`).
  - Label & Spesifikasi: Font-weight 600, ukuran 14px untuk kemudahan baca di layar HP.
  - Nilai Uang / Harga: Tabular figures mono/sans untuk kejelasan digit nominal.

### 3.3 Komponen Khusus Pengguna Mobile
- **Bottom Sheet Drawer:** Pemilihan tanggal sewa dan rincian harga muncul melayang dari bawah layar ponsel.
- **Zero Page Refresh:** Filter transmisi mobil dan pergantian opsi DP 30% vs Lunas berganti secara instan tanpa kedip putih.
- **Sticky Booking Summary:** Bilah ringkasan harga sewa tetap melayang di bawah layar HP saat pengguna menggulir halaman spesifikasi mobil.

---

## 4. Alur Mesin Status & Pembayaran Mayar

```
[ Pelanggan Submit Sewa ]
           │
           ▼
[ Status: PENDING_PAYMENT ]
           │
           ├─── Opsi: Bayar DP 30% ──► Request Mayar (Nominal DP) ──► Pelanggan Scan QRIS / VA
           │                                                                 │
           └─── Opsi: Bayar Lunas ───► Request Mayar (Nominal Full) ─► Pelanggan Scan QRIS / VA
                                                                             │
                                                                             ▼
                                                                 [ Mayar Kirim Webhook ]
                                                                             │
                    ┌────────────────────────────────────────────────────────┴─────────────────┐
                    ▼                                                                          ▼
      (Jika Pelanggan Bayar DP 30%)                                              (Jika Pelanggan Bayar 100%)
      Status ➔ DP_PAID                                                           Status ➔ PAID_IN_FULL
      Jadwal Terkunci                                                            Jadwal Terkunci
      Sisa 70% ditagihkan saat serah terima                                      Tagihan Sisa = Rp 0
                    │                                                                          │
                    └─────────────────────────────┬────────────────────────────────────────────┘
                                                  ▼
                                     [ Terbitkan Invoice PDF ]
                                                  │
                                                  ▼
                               [ notificationService (Event Hook) ]
                               (WhatsApp Link Siap / Bot Siap)
```

---

## 5. Arsitektur Hook untuk Bot Telegram (*Future-Proof*)

Di dalam `src/services/notificationService.ts`, struktur dibuat modular:

```typescript
export interface NotificationPayload {
  event: 'BOOKING_CREATED' | 'PAYMENT_RECEIVED' | 'BOOKING_COMPLETED';
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  carName: string;
  amount: number;
  remainingAmount: number;
  status: string;
}

export async function dispatchNotification(payload: NotificationPayload) {
  // 1. Buat tautan cepat pesan WhatsApp
  console.log(`[Notification] Event ${payload.event} for Order ${payload.orderNumber}`);

  // 2. HOOK TELEGRAM BOT (Siap diaktifkan kapan saja):
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID) {
    // await sendTelegramMessage(payload);
  }
}
```

Ketika Anda sudah siap menghubungkan Bot Telegram di masa depan, kita hanya perlu mengisi konfigurasi token di file lingkungan `.env` tanpa merombak satu baris pun kode inti lainnya!
