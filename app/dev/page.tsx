const CHANGELOG = [
  {
    versi: "v1.0.0",
    tanggal: "8 Sep 2026",
    catatan: [
      "Rilis awal Hitcal: profil, kalkulator BMR/BMI, target kalori harian.",
      "Fitur foto makanan dengan Hitcal AI Vision (Gemini).",
      "Histori catatan makanan tersimpan lokal di perangkat.",
      "Dashboard statistik nutrisi 7/30 hari dengan grafik asupan.",
    ],
  },
];

export default function DevPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Dev &amp; Changelog</h1>
        <p className="text-sm font-medium text-slate-600 mt-0.5">
          Catatan pembaruan dan info teknis aplikasi Hitcal.
        </p>
      </div>

      <div className="neo-card p-5 bg-white">
        <div className="label-eyebrow text-slate-500">Stack</div>
        <ul className="mt-2 space-y-1.5 text-sm font-semibold text-slate-800">
          <li>Next.js 14 (App Router) + TypeScript + Tailwind CSS</li>
          <li>Hitcal AI Vision — Gemini API (model gemini-flash-latest)</li>
          <li>Penyimpanan data lokal di perangkat (localStorage)</li>
        </ul>
      </div>

      {CHANGELOG.map((entry) => (
        <div key={entry.versi} className="neo-card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="neo-badge bg-white">{entry.versi}</span>
            <span className="text-xs font-bold text-slate-500">{entry.tanggal}</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
            {entry.catatan.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0 mt-1.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
