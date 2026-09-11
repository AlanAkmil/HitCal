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
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
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

// Uploads the entry's base64 photo to Firebase Storage and swaps
// fotoDataUrl to the resulting https download URL before writing the
// Firestore document, so entry.fotoDataUrl always works as an <img src>
// regardless of whether it's local (data:) or cloud (https:).
export async function addFoodEntryCloud(uid: string, entry: FoodEntry): Promise<FoodEntry> {
  let fotoDataUrl = entry.fotoDataUrl;

  if (fotoDataUrl.startsWith("data:")) {
    const storageRef = ref(storage, `users/${uid}/food/${entry.id}.jpg`);
    await uploadString(storageRef, fotoDataUrl, "data_url");
    fotoDataUrl = await getDownloadURL(storageRef);
  }

  const cloudEntry: FoodEntry = { ...entry, fotoDataUrl };
  await setDoc(doc(db, "users", uid, "foodEntries", entry.id), cloudEntry);
  return cloudEntry;
}

export async function deleteFoodEntryCloud(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "foodEntries", id));
  try {
    await deleteObject(ref(storage, `users/${uid}/food/${id}.jpg`));
  } catch {
    // Photo may not exist (e.g. entry created before cloud sync) — ignore.
  }
}
