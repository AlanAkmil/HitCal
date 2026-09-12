export type Gender = "wanita" | "pria";
export type Goal = "stabilkan" | "turunkan" | "naikkan";

export interface Profile {
  nama: string;
  usia: number;
  gender: Gender;
  berat: number; // kg
  tinggi: number; // cm
  tujuan: Goal;
}

export interface BmiResult {
  bmi: number;
  label: string;
  desc: string;
  colorVar: string;
}

const ACTIVITY_FACTOR = 1.55;
const GOAL_DELTA = 500;

export function hitungBmr(profile: Pick<Profile, "gender" | "berat" | "tinggi" | "usia">): number {
  const { gender, berat, tinggi, usia } = profile;
  const base = 10 * berat + 6.25 * tinggi - 5 * usia;
  return Math.round(gender === "pria" ? base + 5 : base - 161);
}

export function hitungKebutuhanNormal(bmr: number): number {
  return Math.round(bmr * ACTIVITY_FACTOR);
}

export function hitungTargetHarian(kebutuhanNormal: number, tujuan: Goal): number {
  if (tujuan === "turunkan") return Math.round(kebutuhanNormal - GOAL_DELTA);
  if (tujuan === "naikkan") return Math.round(kebutuhanNormal + GOAL_DELTA);
  return kebutuhanNormal;
}

export function hitungBmi(berat: number, tinggi: number): BmiResult {
  const tinggiM = tinggi / 100;
  const bmi = berat / (tinggiM * tinggiM);
  const rounded = Math.round(bmi * 10) / 10;

  if (bmi < 18.5) {
    return {
      bmi: rounded,
      label: "Kurus (Underweight)",
      desc: "Berat badan kamu di bawah rata-rata. Perbanyak asupan padat nutrisi.",
      colorVar: "var(--neo-blue-tint)",
    };
  }
  if (bmi < 25) {
    return {
      bmi: rounded,
      label: "Normal (Ideal)",
      desc: "Berat badan kamu ideal. Pertahankan pola makan seimbang dan aktivitas fisik!",
      colorVar: "var(--neo-mint)",
    };
  }
  if (bmi < 30) {
    return {
      bmi: rounded,
      label: "Gemuk (Overweight)",
      desc: "Berat badan kamu di atas rata-rata. Coba jaga porsi makan dan lebih aktif bergerak.",
      colorVar: "var(--neo-peach)",
    };
  }
  return {
    bmi: rounded,
    label: "Obesitas",
    desc: "Berat badan kamu cukup tinggi. Pertimbangkan konsultasi ke tenaga kesehatan.",
    colorVar: "var(--neo-pink-tint)",
  };
}

export function formatKalori(n: number): string {
  return Math.round(n).toLocaleString("id-ID");
}

export function goalLabel(tujuan: Goal): string {
  if (tujuan === "turunkan") return "Turunkan Berat Badan";
  if (tujuan === "naikkan") return "Naikkan Berat Badan";
  return "Stabilkan Berat Badan";
}

export function targetBeratSaran(profile: Profile): number {
  // Simple heuristic: ideal weight at BMI 22 for stabilize goal display,
  // otherwise nudge 5kg in the requested direction.
  const tinggiM = profile.tinggi / 100;
  const idealBerat = Math.round(22 * tinggiM * tinggiM);
  if (profile.tujuan === "turunkan") return Math.min(profile.berat - 5, idealBerat);
  if (profile.tujuan === "naikkan") return Math.max(profile.berat + 5, idealBerat);
  return idealBerat;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")} WIB`;
}
