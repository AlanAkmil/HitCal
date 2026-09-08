"use client";

import { useEffect, useState } from "react";
import { CircleHelp, UserCheck2 } from "lucide-react";
import ProfileForm from "./ProfileForm";
import {
  Profile,
  goalLabel,
  hitungBmi,
  hitungBmr,
  hitungKebutuhanNormal,
  hitungTargetHarian,
  formatKalori,
  targetBeratSaran,
} from "@/lib/calc";
import { getProfile } from "@/lib/storage";

export default function ProfilePageClient() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (profile === undefined) return null;

  if (!profile || editing) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-5 order-1 md:order-2">
          <div
            className="neo-card relative overflow-hidden p-7"
            style={{ background: "var(--neo-lavender)" }}
          >
            <span className="neo-badge inline-block bg-white text-slate-900 mb-3">
              Mulai Hitcal
            </span>
            <div className="text-2xl md:text-3xl font-black leading-tight text-slate-900 font-display">
              Isi datamu dulu ya!
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800 leading-relaxed">
              Rekomendasi kalori &amp; fitur foto makanan AI akan otomatis terbuka setelah kamu
              menyimpan profil di samping.
            </p>
          </div>

          <div className="neo-card p-6 bg-white">
            <div className="flex items-center gap-2 text-base font-black text-slate-900">
              <CircleHelp size={20} className="text-primary" />
              <span>Metode Perhitungan Hitcal</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs md:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" />
                <span>BMR dihitung dengan formula baku Mifflin–St Jeor.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" />
                <span>Kebutuhan harian disesuaikan faktor aktivitas harian (1.55x).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" />
                <span>Defisit / Surplus sehat berkisar ±500 kalori per hari.</span>
              </li>
            </ul>
          </div>
        </section>

        <div className="order-2 md:order-1">
          <ProfileForm
            initial={profile ?? undefined}
            onSaved={(saved) => {
              setProfile(saved);
              setEditing(false);
            }}
          />
        </div>
      </div>
    );
  }

  const bmr = hitungBmr(profile);
  const kebutuhanNormal = hitungKebutuhanNormal(bmr);
  const targetHarian = hitungTargetHarian(kebutuhanNormal, profile.tujuan);
  const bmi = hitungBmi(profile.berat, profile.tinggi);
  const targetBerat = targetBeratSaran(profile);

  return (
    <div className="space-y-6">
      <div
        className="neo-card relative overflow-hidden p-7"
        style={{ background: "var(--neo-peach)" }}
      >
        <span className="neo-badge inline-block bg-white text-slate-900 mb-3">
          Target Harian
        </span>
        <div className="text-4xl font-black leading-tight text-slate-900 font-display">
          {formatKalori(targetHarian)}{" "}
          <span className="text-lg font-black">KALORI / HARI</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-800 leading-relaxed">
          Rekomendasi asupan kalori optimal berdasarkan target tubuhmu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="neo-card p-5" style={{ background: "var(--neo-mint)" }}>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800">
            BMR (Metabolisme Basal)
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatKalori(bmr)} <span className="text-xs">Kalori</span>
          </div>
        </div>
        <div className="neo-card p-5" style={{ background: "var(--neo-lavender)" }}>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800">
            Kebutuhan Normal
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatKalori(kebutuhanNormal)} <span className="text-xs">Kalori</span>
          </div>
        </div>
      </div>

      <div className="neo-card p-6 bg-white">
        <div className="flex items-center gap-2 text-base font-black text-slate-900">
          <CircleHelp size={20} className="text-primary" />
          <span>Metode Perhitungan Hitcal</span>
        </div>
        <ul className="mt-3 space-y-2 text-xs md:text-sm font-semibold text-slate-700">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" />
            <span>BMR dihitung dengan formula baku Mifflin–St Jeor.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" />
            <span>Kebutuhan harian disesuaikan faktor aktivitas harian (1.55x).</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" />
            <span>Defisit / Surplus sehat berkisar ±500 kalori per hari.</span>
          </li>
        </ul>
      </div>

      <div className="neo-card p-6 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="label-eyebrow text-slate-500">Profil Pengguna</div>
            <div className="text-2xl font-black text-slate-900 font-display">{profile.nama}</div>
          </div>
          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "var(--neo-mint)" }}>
            <UserCheck2 size={20} className="text-slate-900" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200" />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="neo-card-soft p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Kondisi
            </div>
            <div className="text-sm font-black text-slate-900">
              {profile.usia} th &middot; {profile.gender === "pria" ? "Pria" : "Wanita"}
            </div>
          </div>
          <div className="neo-card-soft p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Postur
            </div>
            <div className="text-sm font-black text-slate-900">
              {profile.berat} kg &middot; {profile.tinggi} cm
            </div>
          </div>
        </div>

        <div
          className="neo-card-soft p-3.5 mt-3"
          style={{ background: bmi.colorVar }}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-900/70">
            Status BMI (Body Mass Index)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900">{bmi.label}</span>
            <span className="text-xs font-black text-slate-800">({bmi.bmi})</span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-slate-800 leading-relaxed">{bmi.desc}</p>
        </div>

        <div className="neo-card-soft p-3.5 mt-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Tujuan Utama
          </div>
          <div className="text-sm font-black text-slate-900 mt-0.5">
            {goalLabel(profile.tujuan)} (Target {targetBerat} kg)
          </div>
        </div>

        <button
          onClick={() => setEditing(true)}
          className="neo-btn mt-4 w-full"
          style={{ background: "var(--neo-blue-tint)", color: "#0f172a" }}
        >
          Ubah Data Profil
        </button>
      </div>
    </div>
  );
}
