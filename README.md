# Hitcal Clone

Kalkulator kalori harian + deteksi kalori makanan dari foto pakai Gemini Vision AI, dengan login (Email/Password + Google) dan sinkronisasi data ke Firestore.

## Setup

1. `npm install`
2. Copy `.env.example` jadi `.env.local`, isi `GEMINI_API_KEY` (ambil dari https://aistudio.google.com/apikey)
3. `npm run dev`

Config Firebase (Auth + Firestore) udah di-hardcode di `lib/firebase.ts` — gak perlu env var tambahan buat itu.

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di Vercel
3. Tambahkan environment variable `GEMINI_API_KEY` di Project Settings > Environment Variables
4. Deploy

## Setup Firebase (sekali doang)

1. Authentication → aktifin provider Email/Password dan Google (Sign-in method)
2. Authentication → Settings → Authorized domains → tambahin domain Vercel produksi
3. Firestore Database → Create database (mode Production)
4. Paste isi `firebase-rules/firestore.rules` ke tab Rules Firestore, Publish

Catatan: foto makanan disimpen langsung sebagai base64 di dokumen Firestore (bukan Firebase Storage), karena Storage butuh paket Blaze berbayar. Foto udah dikompres di browser (~300KB) sebelum disimpen, jadi aman di bawah limit 1MB per dokumen Firestore.

## Struktur

- `app/page.tsx` + `components/ProfilePageClient.tsx` — Profil (form + ringkasan target kalori)
- `app/app/page.tsx` — Foto (upload/kamera + AI vision + status kalori harian)
- `app/histori/page.tsx` — Riwayat catatan makanan
- `app/report/page.tsx` — Statistik nutrisi (grafik 7/30 hari)
- `app/dev/page.tsx` — Profil developer
- `app/login/page.tsx` — Login/daftar (Email/Password + Google)
- `app/api/analyze-food/route.ts` — API route yang manggil Gemini Vision
- `lib/calc.ts` — Rumus BMR (Mifflin-St Jeor), BMI, target kalori
- `lib/storage.ts` — Penyimpanan lokal (localStorage), dipake kalau user belum login
- `lib/firebase.ts` — Inisialisasi Firebase (Auth + Firestore)
- `lib/firestore-data.ts` — CRUD Firestore (profil + catatan makanan)
- `lib/auth-context.tsx` — Context status login user
- `lib/data-provider.tsx` — Context data terpusat (otomatis pilih localStorage vs Firestore), dipake semua halaman + BottomNav biar gak fetch berulang-ulang
