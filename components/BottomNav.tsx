"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Camera, History, BarChart3, CodeXml } from "lucide-react";
import { useProfileData } from "@/lib/data-hooks";

export default function BottomNav() {
  const pathname = usePathname();
  const { profile } = useProfileData();
  const hasProfile = !!profile;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (pathname === "/login") return null;

  const sideLinks = hasProfile
    ? [
        { href: "/", label: "Profil", icon: User },
        { href: "/histori", label: "Histori", icon: History },
      ]
    : [{ href: "/", label: "Profil", icon: User }];

  const rightLinks = hasProfile
    ? [
        { href: "/report", label: "Stats", icon: BarChart3 },
        { href: "/dev", label: "Dev", icon: CodeXml },
      ]
    : [{ href: "/dev", label: "Dev", icon: CodeXml }];

  const gridCols = hasProfile ? "grid-cols-5" : "grid-cols-3";

  return (
    <div className="fixed bottom-0 sm:bottom-6 left-0 right-0 mx-auto w-full sm:w-[92%] sm:max-w-[460px] z-40 px-0 sm:px-2">
      <nav
        className={`relative grid h-[68px] sm:h-[66px] w-full items-center rounded-none sm:rounded-full border-t-2.5 sm:border-2.5 border-x-0 sm:border-x-2.5 border-b-0 sm:border-b-2.5 border-slate-900 bg-white/98 sm:bg-white/95 px-2 pb-1 sm:pb-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_10px_30px_rgba(0,0,0,0.15),4px_4px_0px_#0f172a] backdrop-blur-xl ${gridCols}`}
      >
        {sideLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center h-full z-10 w-full py-1"
            >
              {active && (
                <div className="absolute inset-1 rounded-full bg-primary border-[1.5px] border-slate-900 -z-10 shadow-[1px_1px_0px_#0f172a]" />
              )}
              <Icon
                size={20}
                strokeWidth={2.5}
                className={`mb-0.5 ${active ? "text-white" : "text-slate-500"}`}
              />
              <span
                className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                  active ? "text-white" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        <div className="relative flex h-full flex-col items-center justify-end pb-1.5">
          <Link href="/app" className="block -top-7 absolute z-20">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[2.5px] border-slate-900 bg-primary text-white shadow-[0_6px_16px_rgba(37,99,235,0.35),3px_3px_0px_#0f172a]">
              <Camera size={24} strokeWidth={2.5} />
            </div>
          </Link>
          <span
            className={`pt-1 text-[9px] uppercase tracking-wider font-black ${
              isActive("/app") ? "text-primary" : "text-slate-500"
            }`}
          >
            Foto
          </span>
        </div>

        {rightLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center h-full z-10 w-full py-1"
            >
              {active && (
                <div className="absolute inset-1 rounded-full bg-primary border-[1.5px] border-slate-900 -z-10 shadow-[1px_1px_0px_#0f172a]" />
              )}
              <Icon
                size={20}
                strokeWidth={2}
                className={`mb-0.5 ${active ? "text-white" : "text-slate-500"}`}
              />
              <span
                className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                  active ? "text-white" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
