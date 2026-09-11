import { Profile } from "./calc";

const PROFILE_KEY = "hitcal_profile";
const FOODLOG_KEY = "hitcal_foodlog";

export interface FoodItemDetail {
  nama: string;
  kalori: number;
}

export interface FoodEntry {
  id: string;
  judul: string;
  deskripsi: string;
  totalKalori: number;
  rincian: FoodItemDetail[];
  fotoDataUrl: string;
  waktu: string; // ISO string
}

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export const PROFILE_UPDATED_EVENT = "hitcal:profile-updated";

export function saveProfile(profile: Profile): void {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}

export function getFoodLog(): FoodEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(FOODLOG_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FoodEntry[];
  } catch {
    return [];
  }
}

export function addFoodEntry(entry: FoodEntry): void {
  const log = getFoodLog();
  log.unshift(entry);
  window.localStorage.setItem(FOODLOG_KEY, JSON.stringify(log));
}

export function deleteFoodEntry(id: string): void {
  const log = getFoodLog().filter((e) => e.id !== id);
  window.localStorage.setItem(FOODLOG_KEY, JSON.stringify(log));
}

export function isSameDay(iso: string, ref: Date = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

// Pure array filters — reusable whether the entries came from localStorage
// or Firestore, so the cloud-sync data layer doesn't duplicate this logic.
export function filterTodayEntries(entries: FoodEntry[]): FoodEntry[] {
  return entries.filter((e) => isSameDay(e.waktu));
}

export function filterEntriesInRange(entries: FoodEntry[], days: number): FoodEntry[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);
  return entries.filter((e) => new Date(e.waktu) >= cutoff);
}

export function getTodayEntries(): FoodEntry[] {
  return filterTodayEntries(getFoodLog());
}

export function getEntriesInRange(days: number): FoodEntry[] {
  return filterEntriesInRange(getFoodLog(), days);
}
