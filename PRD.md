# Product Requirements Document (PRD)
## Proyek: AutoMax — Modern Car Rental Web Platform

- **Nama Produk:** AutoMax Car Rental
- **Versi:** 1.0 (MVP to Production)
- **Target Pasar:** Pelanggan rental mobil perorangan & korporat di Indonesia (Mayoritas pengguna Mobile/Smartphone)
- **Status Dokumen:** Approved / Active

---

## 1. Visi & Gambaran Umum Produk

AutoMax adalah platform penyewaan mobil modern berbasis web (PWA-ready) yang dirancang untuk memberikan pengalaman pemesanan mobil yang cepat, transparan, dan tanpa hambatan (*frictionless*) bagi pelanggan smartphone. 

Platform ini menyelesaikan 3 masalah krusial operasional rental mobil:
1. **Pencegahan Double Booking:** Kalender ketersediaan armada otomatis secara *real-time*.
2. **Fleksibilitas Pembayaran Aman:** Dukungan skema **DP 30% (Kunci Jadwal)** atau **Bayar Lunas 100%** terintegrasi langsung dengan payment gateway **Mayar (QRIS Dinamis & Virtual Account)**.
3. **Efisiensi Admin Terpusat:** Dashboard pengelolaan armada mobil, pelacakan pesanan, dan penerbitan dokumen invoice resmi otomatis berstempel, dengan arsitektur yang siap dihubungkan ke **Bot Telegram** di masa depan.

---

## 2. Target Pengguna (User Persona)

1. **Penyewa Mobil (Customer - 85% Mobile):**
   - Menginginkan proses sewa yang cepat dari HP tanpa instalasi aplikasi berat dari Play Store.
   - Butuh kepastian ketersediaan unit pada tanggal yang dipilih.
   - Menginginkan opsi bayar DP terlebih dahulu untuk mengunci mobil, dengan sisa dilunasi saat serah terima.
   - Membutuhkan invoice/e-tiket resmi yang bisa diunduh langsung untuk arsip atau klaim kantor.

2. **Pemilik & Admin Rental (Fleet Operator):**
   - Membutuhkan sistem ringkas untuk menambah, mengubah, dan memantau status armada (Tersedia, Disewa, Servis).
   - Memantau arus pesanan masuk dan verifikasi pembayaran otomatis tanpa perlu cek mutasi manual berulang kali.
   - Menghendaki notifikasi terpusat yang di masa depan terintegrasi dengan Bot Telegram & link instan WhatsApp.

---

## 3. Fitur Utama & Kebutuhan Fungsional

### 3.1 Sisi Pelanggan (Public Facing Web)
1. **Katalog Mobil & Filter Interaktif:**
   - Filter instan berdasarkan: Transmisi (Matic / Manual), Kapasitas Penumpang (5-seater / 7-seater), dan Rentang Harga.
   - Kartu spesifikasi mobil: Foto beresolusi tinggi, tahun, jenis bahan bakar, kapasitas koper, dan tarif harian.
2. **Pemesanan & Kalender Ketersediaan:**
   - Pemilihan rentang tanggal sewa (Mulai & Selesai) dengan kalkulasi otomatis durasi hari dan total biaya.
   - Pengecekan otomatis: Tanggal yang sudah dipesan oleh orang lain tidak dapat dipilih (*collision prevention*).
   - Opsi layanan: **Lepas Kunci** atau **Dengan Supir**.
   - Formulir identitas: Nama, Nomor WhatsApp, dan unggah foto KTP/SIM A.
3. **Sistem Pembayaran Fleksibel (Mayar Gateway):**
   - **Opsi A (Uang Muka / DP 30%):** Membayar 30% dari total sewa secara instan melalui QRIS Dinamis atau Virtual Account untuk mengunci jadwal. Sisa 70% dilunasi saat serah terima mobil (COD / Tunai / Transfer).
   - **Opsi B (Lunas 100%):** Pembayaran penuh langsung di awal untuk kepraktisan serah terima unit tanpa tagihan sisa.
4. **Halaman Pelacakan Pesanan & Invoice Publik:**
   - Halaman status unik: `/order/[orderNumber]` (misal: `INV-202610-001`).
   - Tampilan status dinamis: *Menunggu Pembayaran*, *DP Diterima (Terkonfirmasi)*, *Lunas Penuh*, *Selesai*.
   - Tombol **Unduh Invoice PDF Resmi** berstempel digital.
   - Tombol cepat **Hubungi Admin via WhatsApp** dengan pesan otomatis.

### 3.2 Sisi Admin Rental (Admin Dashboard)
1. **Manajemen Armada Mobil (Fleet CRUD):**
   - Tambah unit mobil baru (Foto, Nama, Plat Nomor, Transmisi, Kapasitas, Harga/Hari).
   - Edit tarif sewa dan ubah status ketersediaan secara manual (Tersedia / Sedang Servis di Bengkel).
2. **Manajemen Transaksi & Booking:**
   - Tabel seluruh pesanan dengan filter status (*Pending, DP Paid, Fully Paid, Active, Completed, Cancelled*).
   - Detail pesanan lengkap: data penyewa, dokumen KTP/SIM, rincian pembayaran, dan tombol cetak ulang invoice.
3. **Pengaturan Sistem (Settings):**
   - Konfigurasi persentase DP default (30%).
   - Pengaturan nomor WhatsApp admin dan alamat pool serah terima kendaraan.

### 3.3 Arsitektur Ekstensibilitas Bot Telegram (*Future Hook*)
- Menerapkan arsitektur *Service Layer* terisolasi: `src/services/notificationService.ts`.
- Setiap kali event `onBookingCreated` atau `onPaymentSuccess` terpicu, fungsi ini siap memanggil API Bot Telegram tanpa perlu mengubah kode inti website di masa depan.

---

## 4. Kebutuhan Non-Fungsional (Kualitas Sistem)

1. **Mobile-First & PWA Readiness:**
   - Desain responsif optimal pada resolusi ponsel (`360px` - `420px`).
   - Dukungan Web App Manifest agar dapat di-*install* langsung ke Layar Utama (*Home Screen*) HP pengguna.
2. **Performa & Optimasi Aset:**
   - Skor Core Web Vitals tinggi; *First Contentful Paint* (FCP) < 1.2 detik pada jaringan 4G.
   - Kompresi gambar mobil otomatis ke format `.webp` melalui `next/image`.
3. **Keamanan & Validasi Data:**
   - Sanitasi data formulir dan validasi skema input (Zod).
   - Proteksi otentikasi pada rute admin (`/admin/*`).
   - Verifikasi tanda tangan (*signature verification*) pada webhook Mayar.
4. **Keandalan Database:**
   - Menyimpan nilai uang dalam format integer (IDR) untuk mencegah bug pembulatan desimal.
   - Skema relasional yang siap diskalakan dari SQLite (pengembangan lokal) ke PostgreSQL (produksi).

---

## 5. Milestone & Tahapan Rilis

- **Milestone 1:** Spesifikasi Dokumen (`PRD.md` & `DESIGN.md`) & Inisialisasi Proyek Next.js.
- **Milestone 2:** Pembuatan Skema Database Prisma & Data Awal Armada (Seed Data).
- **Milestone 3:** Halaman Publik (Katalog Mobil, Form Booking & Kalender Sewa).
- **Milestone 4:** Integrasi Mayar Payment Gateway (DP 30% & Lunas 100%) + Webhook Listener.
- **Milestone 5:** Generator Dokumen Invoice PDF & Halaman Pelacakan Pesanan.
- **Milestone 6:** Dashboard Admin Pengelolaan Mobil & Pesanan.
