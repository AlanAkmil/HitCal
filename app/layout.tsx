import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth-context";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: "Hitcal | Hitung Kalori Makanan dengan AI",
  description:
    "Hitung kalori makanan dari foto dan kenali kebutuhan kalori harianmu secara instan bersama Hitcal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} ${grotesk.variable} font-sans`}>
        <AuthProvider>
          <div className="flex min-h-dvh flex-col relative overflow-x-hidden pb-28">
            <main className="mx-auto mt-6 w-full max-w-xl px-4 flex-1">
              {children}
            </main>
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
