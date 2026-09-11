import {
  doc,
  getDoc,
  setDoc,
  collection,
  deleteDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { Profile } from "./calc";
import { FoodEntry } from "./storage";

export async function getProfileCloud(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as Profile;
}

export async function saveProfileCloud(uid: string, profile: Profile): Promise<void> {
  await setDoc(doc(db, "users", uid), profile);
}

export async function getFoodLogCloud(uid: string): Promise<FoodEntry[]> {
  const q = query(collection(db, "users", uid, "foodEntries"), orderBy("waktu", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FoodEntry);
}

// Storage requires the paid Blaze plan, so the photo's compressed base64
// data URL (already resized to ~1280px / ~300KB by the Foto page before it
// gets here) is stored directly on the Firestore document instead of a
// separate Storage file. That comfortably fits under Firestore's 1MB
// per-document limit while staying on the free Spark plan.
export async function addFoodEntryCloud(uid: string, entry: FoodEntry): Promise<FoodEntry> {
  await setDoc(doc(db, "users", uid, "foodEntries", entry.id), entry);
  return entry;
}

export async function deleteFoodEntryCloud(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "foodEntries", id));
}
