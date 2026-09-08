"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Clock } from "lucide-react";
import { deleteFoodEntry, FoodEntry, getFoodLog } from "@/lib/storage";
import { formatKalori } from "@/lib/calc";

export default function HistoriPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(getFoodLog());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (entries.length === 0) {
    return (
      <div className="neo-card p-6 text-center bg-white">
        <h1 className="text-xl font-black text-slate-900 font-display">Belum Ada Riwayat</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Kamu belum menyimpan catatan makanan.
        </p>
        <Link href="/app" className="neo-btn mt-4 inline-block bg-primary text-white">
          Foto Makanan Pertamamu
        </Link>
      </div>
    );
  }

  const grouped = groupByDate(entries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 font-display">Histori Makanan</h1>
      {Object.entries(grouped).map(([tanggal, items]) => (
        <div key={tanggal}>
          <div className="label-eyebrow text-slate-500 mb-2">{tanggal}</div>
          <div className="space-y-3">
            {items.map((entry) => (
              <div key={entry.id} className="neo-card p-4 flex gap-3">
                <img
                  src={entry.fotoDataUrl}
                  alt={entry.judul}
                  className="h-16 w-16 object-cover rounded-xl border-2 border-slate-900 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-black text-sm text-slate-900 truncate">{entry.judul}</div>
                    <span className="neo-badge shrink-0 flex items-center gap-1 bg-white text-[9px]">
                      <Clock size={11} /> {formatTime(entry.waktu)}
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {formatKalori(entry.totalKalori)}{" "}
                    <span className="text-xs text-slate-500 font-bold">Kalori</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    deleteFoodEntry(entry.id);
                    setEntries(getFoodLog());
                  }}
                  className="h-9 w-9 shrink-0 rounded-full border-2 border-slate-900 flex items-center justify-center self-center"
                  style={{ background: "var(--neo-pink-tint)" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(entries: FoodEntry[]): Record<string, FoodEntry[]> {
  const groups: Record<string, FoodEntry[]> = {};
  for (const e of entries) {
    const d = new Date(e.waktu);
    const key = d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")} WIB`;
}
