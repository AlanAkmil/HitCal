"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AccountBar() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="neo-card p-4 bg-white flex items-center justify-between gap-3 mb-6">
        <div>
          <div className="text-sm font-black text-slate-900">Belum masuk akun</div>
          <div className="text-xs font-semibold text-slate-500">
            Data kamu cuma kesimpen di perangkat ini.
          </div>
        </div>
        <Link
          href="/login"
          className="neo-btn shrink-0 flex items-center gap-1.5 !py-2 !px-3.5 text-xs bg-primary text-white"
        >
          <LogIn size={14} />
          Masuk
        </Link>
      </div>
    );
  }

  const label = user.displayName || user.email || user.phoneNumber || "Akun kamu";

  return (
    <div className="neo-card p-4 bg-white flex items-center justify-between gap-3 mb-6">
      <div className="min-w-0">
        <div className="text-sm font-black text-slate-900 truncate">Halo, {label}</div>
        <div className="text-xs font-semibold text-slate-500">Kamu udah masuk akun.</div>
      </div>
      <button
        onClick={() => signOut()}
        className="neo-btn shrink-0 flex items-center gap-1.5 !py-2 !px-3.5 text-xs"
        style={{ background: "var(--neo-pink-tint)" }}
      >
        <LogOut size={14} />
        Keluar
      </button>
    </div>
  );
}
