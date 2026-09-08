"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Gender, Goal, Profile, hitungBmi } from "@/lib/calc";
import { saveProfile } from "@/lib/storage";

const GOALS: { value: Goal; label: string }[] = [
  { value: "stabilkan", label: "Stabilkan" },
  { value: "turunkan", label: "Turunkan" },
  { value: "naikkan", label: "Naikkan" },
];

export default function ProfileForm({
  initial,
  onSaved,
}: {
  initial?: Profile | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [usia, setUsia] = useState(initial?.usia ?? 25);
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "wanita");
  const [berat, setBerat] = useState(initial?.berat ?? 60);
  const [tinggi, setTinggi] = useState(initial?.tinggi ?? 165);
  const [tujuan, setTujuan] = useState<Goal>(initial?.tujuan ?? "stabilkan");

  const bmi = useMemo(() => hitungBmi(berat, tinggi), [berat, tinggi]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) return;
    const profile: Profile = { nama: nama.trim(), usia, gender, berat, tinggi, tujuan };
    saveProfile(profile);
    router.refresh();
    onSaved?.();
  }

  return (
    <section className="neo-card p-6 md:p-8 h-fit bg-white">
      <span className="neo-badge inline-block bg-neo-mint text-slate-900 mb-3" style={{ background: "var(--neo-mint)" }}>
        Langkah Awal
      </span>
      <h1 className="text-2xl sm:text-3xl font-black leading-tight text-slate-900 font-display">
        Kenalan dulu, yuk! <br />
        <span className="text-primary">Biar kalorimu pas.</span>
      </h1>
      <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600">
        Isi datamu untuk membuka fitur foto makanan &amp; rekomendasi kalori harian yang dipersonalisasi.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <div className="mb-1 text-xs font-black uppercase tracking-wider text-slate-800">
            Nama Lengkap / Panggilan
          </div>
          <input
            className="neo-input"
            placeholder="Contoh: Kuzuroken"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="mb-1 text-xs font-black uppercase tracking-wider text-slate-800">Usia</div>
            <input
              type="number"
              min={10}
              max={100}
              className="neo-input"
              value={usia}
              onChange={(e) => setUsia(Number(e.target.value))}
            />
          </label>
          <div className="block">
            <div className="mb-1 text-xs font-black uppercase tracking-wider text-slate-800">
              Jenis Kelamin
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender("wanita")}
                className="neo-btn flex-1 !p-2 text-xs font-extrabold"
                style={{
                  background: gender === "wanita" ? "var(--neo-lavender)" : "#fff",
                  color: gender === "wanita" ? "#0f172a" : "#334155",
                }}
              >
                Wanita
              </button>
              <button
                type="button"
                onClick={() => setGender("pria")}
                className="neo-btn flex-1 !p-2 text-xs font-extrabold"
                style={{
                  background: gender === "pria" ? "var(--neo-lavender)" : "#fff",
                  color: gender === "pria" ? "#0f172a" : "#334155",
                }}
              >
                Pria
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="mb-1 text-xs font-black uppercase tracking-wider text-slate-800">
              Berat Badan (kg)
            </div>
            <input
              type="number"
              min={20}
              max={300}
              className="neo-input"
              value={berat}
              onChange={(e) => setBerat(Number(e.target.value))}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-black uppercase tracking-wider text-slate-800">
              Tinggi Badan (cm)
            </div>
            <input
              type="number"
              min={100}
              max={250}
              className="neo-input"
              value={tinggi}
              onChange={(e) => setTinggi(Number(e.target.value))}
            />
          </label>
        </div>

        <div
          className="neo-card-soft p-3.5 transition-all duration-300"
          style={{ background: bmi.colorVar }}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-900/70">
            Pratinjau Status BMI Anda
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900">{bmi.label}</span>
            <span className="text-xs font-black text-slate-800">({bmi.bmi})</span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-slate-800 leading-relaxed">{bmi.desc}</p>
        </div>

        <label className="block">
          <div className="mb-1 text-xs font-black uppercase tracking-wider text-slate-800">
            Tujuan Kalori
          </div>
          <div className="grid grid-cols-3 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setTujuan(g.value)}
                className="neo-btn flex flex-col items-center gap-1 !py-2.5 !px-1 text-xs font-black"
                style={{
                  background: tujuan === g.value ? "#0f172a" : "#fff",
                  color: tujuan === g.value ? "#fff" : "#0f172a",
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </label>

        <button
          type="submit"
          className="neo-btn mt-4 w-full text-base bg-primary text-white font-extrabold tracking-wide"
        >
          Mulai Hitcal
        </button>
      </form>
    </section>
  );
}
