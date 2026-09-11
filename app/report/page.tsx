"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { filterEntriesInRange, FoodEntry } from "@/lib/storage";
import { formatKalori, hitungBmr, hitungKebutuhanNormal, hitungTargetHarian } from "@/lib/calc";
import { useProfileData, useFoodLogData } from "@/lib/data-hooks";

type RangeOpt = 7 | 30;

export default function ReportPage() {
  const [range, setRange] = useState<RangeOpt>(7);
  const { profile, loading: profileLoading } = useProfileData();
  const { entries: allEntries, loading: entriesLoading } = useFoodLogData();
  const entries = filterEntriesInRange(allEntries, range);
  const loaded = !profileLoading && !entriesLoading;

  const target = profile
    ? hitungTargetHarian(hitungKebutuhanNormal(hitungBmr(profile)), profile.tujuan)
    : 2000;

  const chartData = useMemo(() => buildChartData(entries, range), [entries, range]);

  const totalKalori = entries.reduce((s, e) => s + e.totalKalori, 0);
  const hariAktif = new Set(entries.map((e) => new Date(e.waktu).toDateString())).size;
  const rataRata = hariAktif > 0 ? Math.round(totalKalori / hariAktif) : 0;
  const vsTarget = target > 0 ? Math.round((rataRata / target) * 100) : 0;

  if (!loaded) return null;

  const { start, end } = rangeLabel(range);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Statistik Nutrisi</h1>
        <p className="text-sm font-medium text-slate-600 mt-0.5">
          Dashboard visual analisis kalori harian dan mingguanmu.
        </p>
      </div>

      <button
        onClick={() => window.print()}
        className="neo-btn w-full flex items-center justify-center gap-2 bg-primary text-white"
      >
        <Download size={18} /> Export Laporan PDF
      </button>

      <div className="neo-card p-5 bg-white">
        <div className="label-eyebrow text-slate-500">Periode Laporan</div>
        <div className="text-xl font-black text-slate-900 mt-0.5">
          {start} &ndash; {end}
        </div>
        <div className="mt-3 inline-flex rounded-full border-2 border-slate-900 p-1">
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as RangeOpt)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                range === r ? "bg-slate-900 text-white" : "text-slate-900"
              }`}
            >
              {r} Hari
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="neo-card p-5" style={{ background: "var(--neo-mint)" }}>
          <div className="text-2xl font-black text-slate-900">
            {formatKalori(totalKalori)} <span className="text-sm">kalori</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 mt-1">
            Total Kalori
          </div>
        </div>
        <div className="neo-card p-5" style={{ background: "var(--neo-lavender)" }}>
          <div className="text-2xl font-black text-slate-900">
            {formatKalori(rataRata)} <span className="text-sm">kalori</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 mt-1">
            Rata-rata
          </div>
        </div>
        <div className="neo-card p-5" style={{ background: "var(--neo-peach)" }}>
          <div className="text-2xl font-black text-slate-900">{hariAktif} hari</div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 mt-1">
            Hari Aktif
          </div>
        </div>
        <div className="neo-card p-5" style={{ background: "var(--neo-mint)" }}>
          <div className="text-2xl font-black text-slate-900">{vsTarget}%</div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 mt-1">
            vs Target
          </div>
        </div>
      </div>

      <div className="neo-card p-5 bg-white">
        <h2 className="text-lg font-black text-slate-900 font-display">Grafik Asupan Harian</h2>
        <div className="label-eyebrow text-slate-500">
          Distribusi kalori {range} hari terakhir
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Asupan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Target ({formatKalori(target)} kalori)
          </span>
        </div>
        <div className="mt-3" style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11, fontWeight: 700 }} />
              <Tooltip
                formatter={(v: number) => [`${formatKalori(v)} kalori`, "Asupan"]}
              />
              <Bar dataKey="kalori" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="neo-card p-5 bg-white">
        <h2 className="text-lg font-black text-slate-900 font-display">Rincian Makanan</h2>
        {entries.length === 0 ? (
          <div className="neo-card-soft mt-4 p-6 text-center text-sm font-semibold text-slate-500">
            Belum ada catatan makanan dalam rentang tanggal ini.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex justify-between text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span className="truncate pr-2">{e.judul}</span>
                <span className="shrink-0">{formatKalori(e.totalKalori)} kalori</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildChartData(entries: FoodEntry[], range: RangeOpt) {
  const days: { key: string; label: string; kalori: number }[] = [];
  const now = new Date();
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      kalori: 0,
    });
  }
  for (const e of entries) {
    const key = new Date(e.waktu).toDateString();
    const day = days.find((d) => d.key === key);
    if (day) day.kalori += e.totalKalori;
  }
  return days;
}

function rangeLabel(range: RangeOpt) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (range - 1));
  const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return { start: fmt(start), end: fmt(now) };
}
