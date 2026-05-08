# VisiTrack - Sistem Manajemen Buku Tamu Digital

VisiTrack adalah sebuah aplikasi *multi-tenant* berbasis web untuk manajemen buku tamu digital. Sistem ini dirancang untuk mempermudah instansi dalam mendata, memvalidasi, dan mengelola kunjungan tamu secara modern dan real-time. Aplikasi ini mendukung berbagai peran pengguna, pelacakan dengan QR code, pengambilan foto bukti, dan pelaporan yang komprehensif.

## 🚀 Fitur Utama

- **Multi-Tenant Architecture**: Mendukung banyak instansi dengan URL khusus (`/[slug]`).
- **Sistem Role-Based Access Control (RBAC)**: Tersedia role Superadmin, Admin, PPID, Petugas, dan Guest.
- **Check-In/Check-Out Otomatis & Manual**: Tamu dapat mengisi formulir mandiri atau dibantu oleh petugas.
- **QR Code & Foto Validasi**: Memanfaatkan QR Code untuk pencatatan instan serta dukungan unggah/ambil foto untuk tamu.
- **Notifikasi Real-Time**: Terintegrasi dengan Pusher untuk update status kunjungan secara *real-time*.
- **Ekspor & Impor Data**: Manajemen data yang mudah dengan dukungan format Excel (.xlsx).
- **Dashboard & Statistik**: Laporan komprehensif melalui grafik interaktif (Recharts).

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Autentikasi**: NextAuth.js
- **Database**: MySQL (diakses menggunakan `mysql2`)
- **Real-Time Engine**: Pusher
- **Icons & Animasi**: Lucide React, Framer Motion, React Icons

## 📂 Struktur Folder Proyek

Di bawah ini adalah struktur folder lengkap dari aplikasi VisiTrack:

```text
visitrack-next/
 ├── app/                         # Direktori utama Next.js (App Router)
 │   ├── api/                     # Endpoint API backend
 │   │   ├── activity-logs/       # API untuk log aktivitas sistem
 │   │   ├── admin/               # API khusus manajemen level Admin
 │   │   ├── auth/                # API autentikasi (NextAuth, reset password)
 │   │   ├── check-instance-status/ # API pengecekan status instansi
 │   │   ├── guest/               # API untuk public/tamu (submit form, foto)
 │   │   ├── instance-id/         # API resolver untuk multi-tenancy
 │   │   ├── petugas/             # API khusus untuk petugas (check-in, validasi)
 │   │   ├── ppid/                # API rekapitulasi PPID
 │   │   ├── superadmin/          # API khusus superadmin (kelola instansi, backup)
 │   │   └── test/                # Endpoint testing
 │   ├── expired/                 # Halaman penanganan link/token expired
 │   ├── forbidden/               # Halaman error 403 (Akses Ditolak)
 │   ├── forgot-password/         # Halaman lupa password
 │   ├── reset-password/          # Halaman reset password
 │   ├── signin/                  # Halaman login utama
 │   ├── [slug]/                  # DYNAMIC ROUTING MULTI-TENANT (Per Instansi)
 │   │   ├── admin/               # Dashboard dan manajemen admin instansi
 │   │   ├── guest-form/          # Formulir tamu mengisi kunjungan
 │   │   ├── guest-status/        # Lacak status tamu (pending/approved/done)
 │   │   ├── guest-success/       # Layar sukses pasca pengisian
 │   │   ├── petugas/             # Antarmuka operasional petugas di lapangan
 │   │   └── ppid/                # Antarmuka untuk PPID instansi
 │   ├── superadmin/              # Halaman manajemen sentral Superadmin
 │   ├── suspended/               # Halaman notifikasi instansi di-suspend
 │   ├── globals.css              # File CSS global & Tailwind setup
 │   ├── layout.tsx               # Root layout Next.js
 │   ├── not-found.tsx            # Halaman error 404 global
 │   └── page.tsx                 # Landing page utama
 ├── backups/                     # Penyimpanan file sistem backup database
 ├── components/                  # Komponen UI React yang dapat digunakan ulang (Reusable)
 │   ├── ui/                      # Base component dari shadcn/ui (Button, Card, Table, dll)
 │   ├── superadmin/              # Komponen terpisah khusus superadmin
 │   ├── FAQSection.tsx           # Komponen layout FAQ
 │   ├── Footer.tsx               # Komponen Footer global
 │   ├── Navbar.tsx               # Komponen navigasi
 │   └── SolutionsSection.tsx     # Komponen fitur/solusi
 ├── hooks/                       # Custom React Hooks
 │   └── use-mobile.ts            # Hook deteksi ukuran layar mobile
 ├── lib/                         # Konfigurasi, utilitas, dan layanan pendukung
 │   ├── activity-log.ts          # Fungsi pencatat aktivitas ke database
 │   ├── auth.ts                  # Konfigurasi dan opsi NextAuth
 │   ├── db.ts                    # Konfigurasi koneksi MySQL
 │   ├── email.ts                 # Utilitas pengiriman email (Nodemailer)
 │   ├── encryption.ts            # Utilitas kriptografi token
 │   ├── pusher/                  # Setup server & client untuk Pusher (Real-Time)
 │   └── utils.ts                 # Helper format class CSS Tailwind (clsx & twMerge)
 ├── public/                      # Aset statis & Media
 │   ├── images/                  # Ikon, ilustrasi, background
 │   ├── uploads/                 # Tempat penyimpanan foto tamu dan logo instansi (Local)
 │   └── favicon.ico              # Ikon website
 ├── types/                       # Deklarasi tipe data TypeScript (Interfaces & Types)
 │   ├── index.ts                 # Type global
 │   └── next-auth.d.ts           # Override tipe dari NextAuth
 ├── middleware.ts                # Middleware untuk router protection & redirect instansi
 ├── next.config.ts               # Konfigurasi environment Next.js
 ├── package.json                 # Daftar dependensi NPM & script proyek
 ├── postcss.config.mjs           # Konfigurasi CSS PostCSS
 ├── tailwind.config.ts           # Konfigurasi desain Tailwind
 └── tsconfig.json                # Aturan dan konfigurasi TypeScript
```

## 🧑‍💻 Peran Pengguna (Roles)

1. **Superadmin**: Berwenang penuh mengatur *instances* (instansi-instansi pengguna sistem), melihat logs, serta melakukan manajemen dan pencadangan (backup) database pusat.
2. **Admin**: Pengelola utama di suatu instansi (berada dalam URL `/[slug]/admin`). Dapat mengelola data petugas, PPID, pegawai, serta mengatur pengaturan logo dan informasi instansi.
3. **PPID**: Pengawas dan pemegang data informasi yang berwenang untuk mencetak, mengekspor laporan, serta merekap semua riwayat kunjungan.
4. **Petugas**: Pengguna di lini depan (resepsionis/satpam) yang memverifikasi, melakukan scan QR Code tamu, mengubah status pengunjung (check-in/check-out), atau menambahkan data tamu secara manual.
5. **Guest (Tamu)**: Pengguna eksternal yang mengunjungi *form link* instansi terkait untuk mengisi tujuan, data diri, serta mengunggah/mengambil foto untuk bukti sebelum dapat disetujui untuk berkunjung.

## ⚙️ Persyaratan Sistem & Instalasi

Untuk menjalankan *repository* ini secara lokal, pastikan Anda telah memiliki:

- Node.js (Minimal v18.x)
- MySQL Server

### 1. Kloning Repository

```bash
git clone <url-repository>
cd visitrack-next
```

### 2. Instalasi Dependensi

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Konfigurasi Lingkungan (.env)

Buat file `.env` di root folder dan konfigurasikan *environment variables* berikut sesuai dengan sistem Anda:

```env
# Database
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="visitrack_db"

# NextAuth
NEXTAUTH_SECRET="secret-random-string-anda"
NEXTAUTH_URL="http://localhost:3000"

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY="pusher-key-anda"
PUSHER_APP_ID="pusher-id-anda"
PUSHER_SECRET="pusher-secret-anda"
NEXT_PUBLIC_PUSHER_CLUSTER="ap1"

# Email SMTP (Untuk Lupa Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="email@anda.com"
SMTP_PASS="password-app-anda"
```

### 4. Menjalankan Mode Pengembangan (Development)

```bash
npm run dev
```

Aplikasi sekarang dapat diakses melalui `http://localhost:3000`.
