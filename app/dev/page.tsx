import Image from "next/image";
import { CodeXml, Instagram, Globe } from "lucide-react";

const LINKS = [
  {
    label: "WhatsApp",
    value: "628138354970",
    href: "https://wa.me/628138354970",
    isWhatsApp: true,
    bg: "#25D366",
    disabled: false,
  },
  {
    label: "Instagram",
    value: "@hidaka401",
    href: "https://instagram.com/hidaka401",
    icon: Instagram,
    bg: "var(--neo-pink-tint)",
    disabled: false,
  },
  {
    label: "TikTok",
    value: "@alan.subagyo",
    href: "https://tiktok.com/@alan.subagyo",
    isTikTok: true,
    bg: "#2563EB",
    disabled: false,
  },
  {
    label: "Website",
    value: "Segera hadir",
    href: undefined,
    icon: Globe,
    bg: "var(--neo-blue-tint)",
    disabled: true,
  },
];

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
      <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.75 13.34L3 21l3.79-1.24a8.93 8.93 0 0 0 4.26 1.08h0a8.94 8.94 0 0 0 8.94-8.94 8.9 8.9 0 0 0-2.39-6.58zM12.05 19.2a7.41 7.41 0 0 1-3.79-1.04l-.27-.16-2.83.93.94-2.77-.18-.28a7.42 7.42 0 1 1 13.77-3.9 7.44 7.44 0 0 1-7.64 7.22zm4.08-5.56c-.22-.11-1.31-.65-1.51-.72s-.35-.11-.5.11-.58.72-.71.87-.26.17-.48.06a6.1 6.1 0 0 1-1.79-1.1 6.7 6.7 0 0 1-1.24-1.54c-.13-.22 0-.34.1-.45s.22-.26.33-.39a1.5 1.5 0 0 0 .22-.37.4.4 0 0 0 0-.39c-.06-.11-.5-1.2-.68-1.65s-.36-.38-.5-.38h-.43a.83.83 0 0 0-.6.28 2.53 2.53 0 0 0-.79 1.88 4.4 4.4 0 0 0 .92 2.33 10.06 10.06 0 0 0 3.85 3.4 4.36 4.36 0 0 0 2.71.57 2.31 2.31 0 0 0 1.52-1.07 1.87 1.87 0 0 0 .13-1.07c-.06-.1-.2-.16-.42-.27z" />
    </svg>
  );
}

export default function DevPage() {
  return (
    <div className="neo-card p-7 bg-white">
      <div
        className="w-32 h-32 rounded-[28px] border-[3px] border-primary p-1 mx-auto mb-4 overflow-hidden"
        style={{ background: "#0b1220", boxShadow: "4px 4px 0px var(--ink)" }}
      >
        <Image
          src="/dev-avatar.jpg"
          alt="Foto profil developer"
          width={128}
          height={128}
          className="w-full h-full object-cover rounded-[22px]"
        />
      </div>

      <h1 className="text-center text-[26px] font-black tracking-tight font-display">
        Hidaka401
      </h1>

      <div
        className="flex items-center justify-center gap-1.5 w-fit mx-auto mb-4 mt-2 font-extrabold text-[13px] px-4 py-1.5 rounded-full border-2 border-slate-900"
        style={{ background: "var(--neo-mint)" }}
      >
        <CodeXml size={14} strokeWidth={2.5} />
        LEAD DEVELOPER
      </div>

      <p className="text-center text-slate-600 font-medium text-[14.5px] leading-relaxed mb-5">
        Membangun solusi cerdas dan menyenangkan untuk gaya hidup sehat melalui
        teknologi AI modern &amp; database lokal cepat.
      </p>

      <div className="space-y-3.5">
        {LINKS.map((link) => {
          const Icon = "icon" in link ? link.icon : undefined;
          const content = (
            <div
              className={`flex items-center gap-3.5 border-[2.5px] border-slate-900 rounded-2xl px-4 py-3.5 bg-white ${
                link.disabled ? "opacity-50" : ""
              }`}
            >
              <div
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
                style={{ background: link.bg }}
              >
                {"isWhatsApp" in link && link.isWhatsApp ? (
                  <WhatsAppIcon />
                ) : "isTikTok" in link && link.isTikTok ? (
                  <TikTokIcon />
                ) : Icon ? (
                  <Icon size={22} className="text-white" strokeWidth={2} />
                ) : null}
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                  {link.label}
                </div>
                <div className="text-base font-black text-slate-900">{link.value}</div>
              </div>
            </div>
          );

          return link.disabled || !link.href ? (
            <div key={link.label}>{content}</div>
          ) : (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}
