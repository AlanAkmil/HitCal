# Hitcal Clone

Kalkulator kalori harian + deteksi kalori makanan dari foto pakai Gemini Vision AI.

## Setup

1. `npm install`
2. Copy `.env.example` jadi `.env.local`, isi `GEMINI_API_KEY` (ambil dari https://aistudio.google.com/apikey)
3. `npm run dev`

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di Vercel
3. Tambahkan environment variable `GEMINI_API_KEY` di Project Settings > Environment Variables
4. Deploy

## Struktur

- `app/page.tsx` — Profil (form + ringkasan target kalori)
- `app/app/page.tsx` — Foto (upload/kamera + AI vision + status kalori harian)
- `app/histori/page.tsx` — Riwayat catatan makanan
- `app/report/page.tsx` — Statistik nutrisi (grafik 7/30 hari)
- `app/dev/page.tsx` — Changelog
- `app/api/analyze-food/route.ts` — API route yang manggil Gemini Vision
- `lib/calc.ts` — Rumus BMR (Mifflin-St Jeor), BMI, target kalori
- `lib/storage.ts` — Penyimpanan lokal (localStorage) untuk profil & catatan makanan
