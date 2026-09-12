"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useAppData } from "@/lib/data-provider";
import {
  hitungBmr,
  hitungKebutuhanNormal,
  hitungTargetHarian,
  formatKalori,
} from "@/lib/calc";
import { filterTodayEntries } from "@/lib/storage";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Halo! Aku HidakaAi 👋 Aku bisa bantu soal saran makanan, nutrisi, atau apapun soal Hitcal. Ada yang mau ditanya?",
};

export default function HidakaChatWidget() {
  const pathname = usePathname();
  const { profile, entries } = useAppData();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (pathname === "/login") return null;

  function buildContext(): string | undefined {
    if (!profile) return undefined;
    const bmr = hitungBmr(profile);
    const target = hitungTargetHarian(hitungKebutuhanNormal(bmr), profile.tujuan);
    const totalHariIni = filterTodayEntries(entries).reduce((s, e) => s + e.totalKalori, 0);
    const sisaKuota = Math.max(target - totalHariIni, 0);
    return [
      `Nama: ${profile.nama}`,
      `Target kalori harian: ${formatKalori(target)} kalori`,
      `Sudah dimakan hari ini: ${formatKalori(totalHariIni)} kalori`,
      `Sisa kuota hari ini: ${formatKalori(sisaKuota)} kalori`,
      `Tujuan: ${profile.tujuan}`,
    ].join("\n");
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/hidaka-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          context: buildContext(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal dapat balasan.");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed z-50 flex flex-col bg-white border-[2.5px] border-slate-900 rounded-[24px] shadow-[6px_6px_0px_#0f172a] overflow-hidden"
          style={{
            bottom: "150px",
            right: "16px",
            width: "min(340px, calc(100vw - 32px))",
            height: "min(460px, calc(100vh - 220px))",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-900 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <span className="font-black text-sm">HidakaAi</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] font-medium leading-relaxed border-2 border-slate-900 ${
                    m.role === "user" ? "text-white" : "bg-white text-slate-800"
                  }`}
                  style={m.role === "user" ? { background: "var(--primary, #2563eb)" } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-slate-900 rounded-2xl px-3 py-2 text-[13px] text-slate-400 font-medium">
                  Mengetik...
                </div>
              </div>
            )}
            {error && (
              <div className="text-center text-[11px] font-bold text-red-600 px-2">{error}</div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-2.5 border-t-2 border-slate-900 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya HidakaAi..."
              disabled={loading}
              className="flex-1 border-2 border-slate-900 rounded-full px-3.5 py-2 text-[13px] font-semibold outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-full border-2 border-slate-900 bg-primary text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 h-14 w-14 rounded-full border-[2.5px] border-slate-900 bg-primary text-white flex items-center justify-center shadow-[4px_4px_0px_#0f172a]"
        style={{ bottom: "84px", right: "16px" }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
