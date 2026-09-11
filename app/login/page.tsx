"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
  ConfirmationResult,
} from "firebase/auth";
import { ArrowRight, ArrowLeft, Phone } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "signup";
type Panel = "form" | "phone-input" | "phone-otp";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return "+62" + digits.slice(1);
  if (digits.startsWith("62")) return "+" + digits;
  return "+62" + digits;
}

function friendlyFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-email": "Format email gak valid.",
    "auth/user-not-found": "Email belum terdaftar. Coba daftar dulu.",
    "auth/wrong-password": "Password salah.",
    "auth/invalid-credential": "Email atau password salah.",
    "auth/email-already-in-use": "Email ini udah kepake. Coba masuk aja.",
    "auth/weak-password": "Password minimal 6 karakter.",
    "auth/popup-closed-by-user": "Popup Google ditutup sebelum selesai.",
    "auth/popup-blocked": "Popup Google diblokir browser. Izinkan popup dulu.",
    "auth/cancelled-popup-request": "Popup Google dibatalkan.",
    "auth/unauthorized-domain": "Domain ini belum diizinkan di Firebase Console (Authentication > Settings > Authorized domains).",
    "auth/operation-not-allowed": "Metode login ini belum diaktifin di Firebase Console.",
    "auth/invalid-phone-number": "Format nomor HP gak valid.",
    "auth/invalid-verification-code": "Kode OTP salah.",
    "auth/code-expired": "Kode OTP udah kedaluwarsa, kirim ulang.",
    "auth/quota-exceeded": "Kuota SMS harian abis. Coba lagi besok atau upgrade paket Firebase.",
    "auth/captcha-check-failed": "Verifikasi reCAPTCHA gagal. Coba refresh halaman.",
    "auth/invalid-app-credential": "Verifikasi reCAPTCHA gagal. Coba refresh halaman.",
    "auth/missing-app-credential": "Verifikasi reCAPTCHA gagal. Coba refresh halaman.",
    "auth/network-request-failed": "Koneksi internet bermasalah.",
    "auth/too-many-requests": "Kebanyakan percobaan. Coba lagi beberapa saat.",
  };
  const message = map[code] ?? "Ada yang salah, coba lagi.";
  return code ? `${message} (${code})` : message;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [panel, setPanel] = useState<Panel>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [authLoading, user, router]);

  function getRecaptcha(): RecaptchaVerifier {
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        { size: "invisible" }
      );
    }
    return recaptchaVerifierRef.current!;
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace("/");
    } catch (err: any) {
      setError(friendlyFirebaseError(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/");
    } catch (err: any) {
      setError(friendlyFirebaseError(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const verifier = getRecaptcha();
      const result = await signInWithPhoneNumber(auth, normalizePhone(phone), verifier);
      setConfirmationResult(result);
      setPanel("phone-otp");
    } catch (err: any) {
      setError(friendlyFirebaseError(err?.code ?? ""));
      recaptchaVerifierRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationResult) return;
    setError(null);
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      router.replace("/");
    } catch (err: any) {
      setError(friendlyFirebaseError(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  function backToForm() {
    setPanel("form");
    setOtp("");
    setError(null);
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, var(--neo-blue-tint) 0%, var(--neo-lavender) 45%, #eef1f7 45%)" }}>
      <div className="relative flex items-center justify-center" style={{ height: "30vh", minHeight: 190 }}>
        <div
          className="absolute rounded-full border-[2.5px] border-dashed"
          style={{ width: 150, height: 150, borderColor: "rgba(15,23,42,0.25)", animation: "spin 18s linear infinite" }}
        />
        <div
          className="absolute rounded-full border-[2.5px] border-dashed"
          style={{ width: 196, height: 196, borderColor: "rgba(15,23,42,0.25)", animation: "spin 26s linear infinite reverse" }}
        />
        <div className="absolute rounded-full border-2 border-slate-900" style={{ width: 16, height: 16, background: "var(--neo-peach)", top: "14%", left: "20%" }} />
        <div className="absolute rounded-full" style={{ width: 12, height: 12, background: "var(--primary, #2563eb)", top: "60%", right: "18%" }} />
        <div className="absolute rounded-full border-2 border-slate-900 bg-white" style={{ width: 10, height: 10, top: "24%", right: "22%" }} />

        <div
          className="relative z-10 w-[88px] h-[88px] rounded-[26px] border-[3px] border-slate-900 flex items-center justify-center bg-slate-900"
          style={{ boxShadow: "5px 5px 0px rgba(15,23,42,0.3)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--neo-mint)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-[42px] h-[42px]">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-0 right-0 text-center font-display font-bold text-[15px] tracking-wider text-slate-900">
          HITCAL
        </div>
      </div>

      <div className="relative flex-1 bg-white border-[2.5px] border-b-0 border-slate-900 rounded-t-[32px] px-6 pt-3.5 pb-7 flex flex-col overflow-y-auto z-10">
        <div className="w-[42px] h-[5px] bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

        {panel === "form" && (
          <>
            <div className="relative grid grid-cols-2 bg-slate-100 border-2 border-slate-900 rounded-full p-1 mb-4 shrink-0">
              <div
                className="absolute top-1 left-1 h-[calc(100%-8px)] bg-slate-900 rounded-full transition-transform duration-300"
                style={{ width: "calc(50% - 4px)", transform: mode === "signup" ? "translateX(100%)" : "translateX(0)" }}
              />
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className={`relative z-10 py-2.5 rounded-full text-xs font-black tracking-wide ${mode === "login" ? "text-white" : "text-slate-500"}`}
              >
                MASUK
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(null); }}
                className={`relative z-10 py-2.5 rounded-full text-xs font-black tracking-wide ${mode === "signup" ? "text-white" : "text-slate-500"}`}
              >
                DAFTAR
              </button>
            </div>

            <form onSubmit={handleEmailSubmit}>
              {mode === "signup" && (
                <label className="block relative mb-4">
                  <input
                    className="neo-input"
                    placeholder="Nama Lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}

              <label className="block relative mb-4">
                <input
                  type="email"
                  required
                  className="neo-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="block relative mb-2">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="neo-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {mode === "login" && (
                <div className="text-right mb-4">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs font-bold text-primary"
                  >
                    Lupa password?
                  </a>
                </div>
              )}

              {error && (
                <p className="text-xs font-bold text-red-600 mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="neo-btn w-full text-[15px] bg-primary text-white font-extrabold"
              >
                {loading ? "Memproses..." : mode === "signup" ? "Daftar Sekarang" : "Masuk"}
              </button>
            </form>

            <div className="flex items-center gap-2.5 my-4 shrink-0">
              <div className="flex-1 h-[2px] bg-slate-200" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">atau</span>
              <div className="flex-1 h-[2px] bg-slate-200" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="neo-btn w-full flex items-center justify-center gap-2.5 bg-white text-[14px] mb-3"
            >
              <svg viewBox="0 0 48 48" className="w-[18px] h-[18px]">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.6 35.4 27 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C39.9 37 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
              </svg>
              Lanjutkan dengan Google
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => { setPanel("phone-input"); setError(null); }}
              className="neo-btn w-full flex items-center justify-center gap-2.5 text-[14px]"
              style={{ background: "var(--neo-mint)" }}
            >
              <Phone size={18} />
              Lanjutkan dengan Nomor HP
            </button>
          </>
        )}

        {panel === "phone-input" && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={backToForm}
                className="w-[30px] h-[30px] rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0"
              >
                <ArrowLeft size={15} />
              </button>
              <h1 className="font-display font-bold text-[20px]">Masukin Nomor HP</h1>
            </div>
            <p className="text-[13px] font-semibold text-slate-500 mb-4">
              Kami bakal kirim kode OTP lewat SMS ke nomor ini.
            </p>

            <form onSubmit={handleSendOtp}>
              <label className="block relative mb-4">
                <input
                  type="tel"
                  required
                  className="neo-input"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              {error && (
                <p className="text-xs font-bold text-red-600 mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="neo-btn w-full flex items-center justify-center gap-2 text-[15px] bg-primary text-white font-extrabold"
              >
                {loading ? "Mengirim..." : "Kirim Kode OTP"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        )}

        {panel === "phone-otp" && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => setPanel("phone-input")}
                className="w-[30px] h-[30px] rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0"
              >
                <ArrowLeft size={15} />
              </button>
              <h1 className="font-display font-bold text-[20px]">Masukin Kode OTP</h1>
            </div>
            <p className="text-[13px] font-semibold text-slate-500 mb-4">
              Kode udah dikirim ke {normalizePhone(phone)}
            </p>

            <form onSubmit={handleVerifyOtp}>
              <label className="block relative mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  className="neo-input tracking-[0.3em] text-center"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </label>

              {error && (
                <p className="text-xs font-bold text-red-600 mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="neo-btn w-full text-[15px] bg-primary text-white font-extrabold"
              >
                {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
              </button>
            </form>
          </div>
        )}

        {panel === "form" && (
          <p className="text-center text-xs font-semibold text-slate-400 mt-4 shrink-0">
            {mode === "login" ? (
              <>Belum punya akun?{" "}
                <button type="button" onClick={() => setMode("signup")} className="font-black text-primary">
                  Daftar
                </button>
              </>
            ) : (
              <>Udah punya akun?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-black text-primary">
                  Masuk
                </button>
              </>
            )}
          </p>
        )}
      </div>

      {/* invisible reCAPTCHA anchor required by Firebase phone auth */}
      <div ref={recaptchaContainerRef} id="recaptcha-container" />

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
