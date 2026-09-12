"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Upload, Camera, Eye, Trash2, Clock } from "lucide-react";
import { hitungBmr, hitungKebutuhanNormal, hitungTargetHarian, formatKalori } from "@/lib/calc";
import { FoodEntry, filterTodayEntries } from "@/lib/storage";
import { useAppData } from "@/lib/data-provider";
import LoadingSpinner from "@/components/LoadingSpinner";

type AnalyzeState = "idle" | "uploading" | "analyzing" | "done" | "error";

export default function FotoPage() {
  const {
    profile,
    profileLoading,
    entries: allEntries,
    addEntry,
    deleteEntry,
    entriesLoading,
  } = useAppData();
  const entries = filterTodayEntries(allEntries);
  const [state, setState] = useState<AnalyzeState>("idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<string | null>(null);

  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  if (profileLoading || entriesLoading) return <LoadingSpinner />;

  if (!profile) {
    return (
      <div className="neo-card p-6 text-center bg-white">
        <h1 className="text-xl font-black text-slate-900 font-display">Lengkapi Profil Dulu</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Fitur AI kamera makanan &amp; rekomendasi kalori harian akan aktif setelah kamu mengisi
          data diri.
        </p>
        <Link href="/" className="neo-btn mt-4 inline-block bg-primary text-white">
          Isi Profil Sekarang
        </Link>
      </div>
    );
  }

  const bmr = hitungBmr(profile);
  const targetHarian = hitungTargetHarian(hitungKebutuhanNormal(bmr), profile.tujuan);
  const totalHariIni = entries.reduce((sum, e) => sum + e.totalKalori, 0);
  const sisaKuota = Math.max(targetHarian - totalHariIni, 0);
  const persenTercapai = Math.min(Math.round((totalHariIni / targetHarian) * 100), 100);

  async function handleFile(file: File) {
    setErrorMsg(null);
    setState("uploading");
    setProgress(10);

    let dataUrl: string;
    try {
      dataUrl = await fileToCompressedDataUrl(file);
    } catch (err) {
      setErrorMsg("Gagal memproses foto. Coba pilih foto lain.");
      setState("error");
      return;
    }
    setPreviewUrl(dataUrl);
    setProgress(25);

    const base64 = dataUrl.split(",")[1];
    const mimeType = "image/jpeg";

    setState("analyzing");
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.round(Math.random() * 10 + 5) : p));
    }, 400);

    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        clearInterval(progressTimer);
        setErrorMsg(
          res.status === 413
            ? "Foto masih kegedean buat di-upload. Coba foto lain."
            : `Server gak ngasih respons yang bener (status ${res.status}). Coba lagi.`
        );
        setState("error");
        return;
      }
      clearInterval(progressTimer);

      if (!res.ok) {
        setErrorMsg(data.error ?? "Gagal menganalisis foto.");
        setState("error");
        return;
      }

      setProgress(100);
      const entry: FoodEntry = {
        id: crypto.randomUUID(),
        judul: data.judul ?? "Makanan",
        deskripsi: data.deskripsi ?? "",
        totalKalori: Math.round(data.totalKalori ?? 0),
        rincian: data.rincian ?? [],
        fotoDataUrl: dataUrl,
        waktu: new Date().toISOString(),
      };
      await addEntry(entry);
      setState("done");
      setTimeout(() => {
        setState("idle");
        setPreviewUrl(null);
        setProgress(0);
      }, 900);
    } catch (err) {
      clearInterval(progressTimer);
      setErrorMsg(
        "Gagal terhubung ke server. Cek koneksi internet kamu dan coba lagi."
      );
      setState("error");
    }
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
  }

  const busy = state === "uploading" || state === "analyzing";

  return (
    <div className="space-y-6">
      <section className="neo-card p-6 bg-white">
        <span
          className="neo-badge inline-block mb-3"
          style={{ background: "var(--neo-blue-tint)" }}
        >
          Hitcal AI Vision
        </span>
        <h1 className="text-2xl font-black text-slate-900 font-display">
          Halo, <span className="text-primary">{profile.nama}</span>!
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Unggah atau ambil foto makananmu untuk kalkulasi kalori otomatis.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => uploadRef.current?.click()}
            className="neo-btn flex items-center justify-center gap-2 text-sm"
            style={{ background: "var(--neo-blue-tint)", color: "#0f172a" }}
          >
            <Upload size={18} /> Upload Foto
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="neo-btn flex items-center justify-center gap-2 text-sm"
            style={{ background: "var(--neo-mint)", color: "#0f172a" }}
          >
            <Camera size={18} /> Buka Kamera
          </button>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {(busy || state === "error") && previewUrl && (
          <div className="neo-card mt-4 p-4">
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-900">
              <img src={previewUrl} alt="Foto makanan" className="w-full object-cover max-h-64" />
              {busy && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-primary"
                  style={{ top: "50%" }}
                />
              )}
            </div>

            {state === "error" ? (
              <p className="mt-3 text-sm font-bold text-red-600">{errorMsg}</p>
            ) : (
              <>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-900">
                      {state === "uploading" ? "Mengunggah foto..." : "Menyusun ringkasan nutrisi..."}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Hitcal Vision AI
                    </div>
                  </div>
                  <div className="text-xl font-black text-slate-900">{progress}%</div>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full border-2 border-slate-900 overflow-hidden bg-slate-100">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div
                  className="neo-btn mt-3 w-full text-center text-xs"
                  style={{ background: "var(--neo-blue-tint)" }}
                >
                  AI Sedang Menghitung
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="neo-card p-6 bg-white">
        <span className="neo-badge inline-block bg-neo-mint mb-3" style={{ background: "var(--neo-mint)" }}>
          Ringkasan Hari Ini
        </span>
        <h2 className="text-xl font-black text-slate-900 font-display">Status Kalori</h2>

        <div className="neo-card-soft p-5 mt-3" style={{ background: "var(--neo-lavender)" }}>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 text-center">
            Sisa Kuota Kalori
          </div>
          <div className="mt-1 text-3xl font-black text-slate-900 text-center">
            {formatKalori(sisaKuota)} <span className="text-sm">Kalori</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-black text-slate-800">
          <span>Target Tercapai</span>
          <span>{persenTercapai}%</span>
        </div>
        <div className="mt-1 h-3 w-full rounded-full border-2 border-slate-900 overflow-hidden bg-slate-100">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${persenTercapai}%`,
              background:
                "linear-gradient(90deg, var(--neo-mint), var(--neo-peach), var(--neo-pink-tint))",
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] font-bold text-slate-500">
          <span>{formatKalori(totalHariIni)} kalori masuk</span>
          <span>Target {formatKalori(targetHarian)} kalori</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="neo-card-soft p-3 text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total Hari Ini
            </div>
            <div className="text-xl font-black text-slate-900">{formatKalori(totalHariIni)}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Kalori</div>
          </div>
          <div className="neo-card-soft p-3 text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Jumlah Makan
            </div>
            <div className="text-xl font-black text-slate-900">{entries.length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Makanan</div>
          </div>
        </div>
      </section>

      <section className="neo-card p-6 bg-white">
        <h2 className="text-lg font-black text-slate-900 font-display">Makanan Hari Ini</h2>
        <div className="label-eyebrow text-slate-500 mt-0.5">Catatan Lokal Tersimpan</div>

        {entries.length === 0 ? (
          <div className="neo-card-soft mt-4 p-6 text-center text-sm font-semibold text-slate-500">
            Belum ada catatan hari ini. Yuk foto atau upload makananmu!
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="neo-card p-4">
                <div className="relative">
                  <img
                    src={entry.fotoDataUrl}
                    alt={entry.judul}
                    className="w-full object-cover max-h-56 rounded-2xl border-2 border-slate-900"
                  />
                  <button
                    onClick={() => setPreviewModal(entry.fotoDataUrl)}
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center"
                  >
                    <Eye size={16} />
                  </button>
                </div>

                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="font-black text-lg text-slate-900 leading-tight">
                    {entry.judul}
                  </div>
                  <span className="neo-badge shrink-0 flex items-center gap-1 bg-white text-[10px]">
                    <Clock size={12} /> {formatTime(entry.waktu)}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1">{entry.deskripsi}</p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-2xl font-black text-slate-900">
                    {formatKalori(entry.totalKalori)}{" "}
                    <span className="text-xs text-slate-500">Kalori</span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="h-9 w-9 rounded-full border-2 border-slate-900 flex items-center justify-center"
                    style={{ background: "var(--neo-pink-tint)" }}
                  >
                    <Trash2 size={16} />
                  </button>
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
            ))}
          </div>
        )}
      </section>

      {previewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setPreviewModal(null)}
        >
          <img
            src={previewModal}
            alt="Preview"
            className="max-h-full rounded-2xl border-2 border-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// Resizes + re-compresses the photo client-side before it ever leaves the
// browser. Phone camera photos are easily 5-10MB+, well past Vercel's
// ~4.5MB request body limit — sending one raw causes the request to get
// cut off, which shows up client-side as a generic "network error" even
// though the connection itself is fine. Capping the longest side at 1280px
// and re-encoding as JPEG keeps payloads small (usually under ~300KB) and
// uploads noticeably faster too.
function fileToCompressedDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas gak didukung di browser ini."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar."));
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")} WIB`;
}
