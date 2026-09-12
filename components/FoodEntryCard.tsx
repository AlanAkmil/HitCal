"use client";

import { useState } from "react";
import { Eye, Trash2, Clock, Pencil, Plus, X, Check } from "lucide-react";
import { FoodEntry, FoodItemDetail } from "@/lib/storage";
import { formatKalori, formatTime } from "@/lib/calc";

export default function FoodEntryCard({
  entry,
  onUpdate,
  onDelete,
  onPreview,
}: {
  entry: FoodEntry;
  onUpdate: (entry: FoodEntry) => Promise<void>;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [judul, setJudul] = useState(entry.judul);
  const [deskripsi, setDeskripsi] = useState(entry.deskripsi);
  const [rincian, setRincian] = useState<FoodItemDetail[]>(entry.rincian);
  const [saving, setSaving] = useState(false);

  const totalKalori = rincian.reduce((sum, item) => sum + (Number(item.kalori) || 0), 0);

  function startEdit() {
    setJudul(entry.judul);
    setDeskripsi(entry.deskripsi);
    setRincian(
      entry.rincian.length > 0 ? entry.rincian : [{ nama: "", kalori: entry.totalKalori }]
    );
    setEditing(true);
  }

  function updateRincianItem(i: number, field: "nama" | "kalori", value: string) {
    setRincian((prev) =>
      prev.map((item, idx) =>
        idx === i
          ? {
              ...item,
              [field]: field === "kalori" ? Number(value.replace(/\D/g, "")) || 0 : value,
            }
          : item
      )
    );
  }

  function addRincianRow() {
    setRincian((prev) => [...prev, { nama: "", kalori: 0 }]);
  }

  function removeRincianRow(i: number) {
    setRincian((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdate({
        ...entry,
        judul: judul.trim() || "Makanan",
        deskripsi: deskripsi.trim(),
        rincian: rincian.filter((r) => r.nama.trim() !== ""),
        totalKalori,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="neo-card p-4">
        <img
          src={entry.fotoDataUrl}
          alt={entry.judul}
          className="w-full object-cover max-h-56 rounded-2xl border-2 border-slate-900"
        />

        <label className="block mt-3">
          <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Judul
          </div>
          <input
            className="neo-input !py-2 !text-sm"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
          />
        </label>

        <label className="block mt-2">
          <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Deskripsi
          </div>
          <input
            className="neo-input !py-2 !text-sm"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </label>

        <div className="neo-card-soft mt-3 p-3 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
            Rincian
          </div>
          {rincian.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="neo-input !py-1.5 !px-2.5 !text-xs flex-1"
                placeholder="Nama item"
                value={item.nama}
                onChange={(e) => updateRincianItem(i, "nama", e.target.value)}
              />
              <input
                type="text"
                inputMode="numeric"
                className="neo-input !py-1.5 !px-2.5 !text-xs w-20 text-right"
                placeholder="0"
                value={item.kalori === 0 ? "" : String(item.kalori)}
                onChange={(e) => updateRincianItem(i, "kalori", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeRincianRow(i)}
                className="h-8 w-8 shrink-0 rounded-full border-2 border-slate-900 flex items-center justify-center"
                style={{ background: "var(--neo-pink-tint)" }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRincianRow}
            className="neo-btn w-full !py-2 text-xs flex items-center justify-center gap-1.5"
            style={{ background: "var(--neo-mint)" }}
          >
            <Plus size={14} /> Tambah Item
          </button>
        </div>

        <div className="mt-3 text-sm font-black text-slate-900">
          Total: {formatKalori(totalKalori)} <span className="text-xs text-slate-500">Kalori</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="neo-btn !py-2.5 text-sm"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="neo-btn !py-2.5 text-sm bg-primary text-white flex items-center justify-center gap-1.5"
          >
            <Check size={16} /> {saving ? "Nyimpen..." : "Simpan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card p-4">
      <div className="relative">
        <img
          src={entry.fotoDataUrl}
          alt={entry.judul}
          className="w-full object-cover max-h-56 rounded-2xl border-2 border-slate-900"
        />
        <button
          onClick={() => onPreview(entry.fotoDataUrl)}
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center"
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="font-black text-lg text-slate-900 leading-tight">{entry.judul}</div>
        <span className="neo-badge shrink-0 flex items-center gap-1 bg-white text-[10px]">
          <Clock size={12} /> {formatTime(entry.waktu)}
        </span>
      </div>
      <p className="text-xs font-medium text-slate-600 mt-1">{entry.deskripsi}</p>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-black text-slate-900">
          {formatKalori(entry.totalKalori)} <span className="text-xs text-slate-500">Kalori</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startEdit}
            className="h-9 w-9 rounded-full border-2 border-slate-900 flex items-center justify-center"
            style={{ background: "var(--neo-blue-tint)" }}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="h-9 w-9 rounded-full border-2 border-slate-900 flex items-center justify-center"
            style={{ background: "var(--neo-pink-tint)" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {entry.rincian.length > 0 && (
        <div className="neo-card-soft mt-3 p-3 space-y-2">
          {entry.rincian.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] gap-x-3 items-baseline text-sm font-semibold text-slate-800"
            >
              <span className="leading-snug">{item.nama}</span>
              <span className="whitespace-nowrap text-slate-600 text-right">
                {formatKalori(item.kalori)} kalori
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
