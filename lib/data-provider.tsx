"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { Profile } from "./calc";
import {
  FoodEntry,
  getProfile as getProfileLocal,
  saveProfile as saveProfileLocal,
  getFoodLog as getFoodLogLocal,
  addFoodEntry as addFoodEntryLocal,
  updateFoodEntry as updateFoodEntryLocal,
  deleteFoodEntry as deleteFoodEntryLocal,
} from "./storage";
import {
  getProfileCloud,
  saveProfileCloud,
  getFoodLogCloud,
  addFoodEntryCloud,
  updateFoodEntryCloud,
  deleteFoodEntryCloud,
} from "./firestore-data";

interface DataContextValue {
  profile: Profile | null | undefined;
  profileLoading: boolean;
  saveProfile: (p: Profile) => Promise<void>;
  entries: FoodEntry[];
  entriesLoading: boolean;
  addEntry: (e: FoodEntry) => Promise<void>;
  updateEntry: (e: FoodEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

// Single shared fetch for profile + food log, used by every page and by
// BottomNav. Previously each component called its own copy of these
// fetches independently, which meant 2-3 redundant Firestore round-trips
// firing at once on every navigation — visible as flicker/jank, especially
// on a slow connection.
export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid;
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (uid) {
      setProfile(await getProfileCloud(uid));
    } else {
      setProfile(getProfileLocal());
    }
  }, [uid]);

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    if (uid) {
      setEntries(await getFoodLogCloud(uid));
    } else {
      setEntries(getFoodLogLocal());
    }
    setEntriesLoading(false);
  }, [uid]);

  useEffect(() => {
    if (authLoading) return;
    setProfile(undefined);
    loadProfile();
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, uid]);

  const saveProfile = useCallback(
    async (p: Profile) => {
      if (uid) {
        await saveProfileCloud(uid, p);
      } else {
        saveProfileLocal(p);
      }
      setProfile(p);
    },
    [uid]
  );

  const addEntry = useCallback(
    async (entry: FoodEntry) => {
      if (uid) {
        await addFoodEntryCloud(uid, entry);
      } else {
        addFoodEntryLocal(entry);
      }
      await loadEntries();
    },
    [uid, loadEntries]
  );

  const updateEntry = useCallback(
    async (entry: FoodEntry) => {
      if (uid) {
        await updateFoodEntryCloud(uid, entry);
      } else {
        updateFoodEntryLocal(entry);
      }
      await loadEntries();
    },
    [uid, loadEntries]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (uid) {
        await deleteFoodEntryCloud(uid, id);
      } else {
        deleteFoodEntryLocal(id);
      }
      await loadEntries();
    },
    [uid, loadEntries]
  );

  return (
    <DataContext.Provider
      value={{
        profile,
        profileLoading: authLoading || profile === undefined,
        saveProfile,
        entries,
        entriesLoading: authLoading || entriesLoading,
        addEntry,
        updateEntry,
        deleteEntry,
        refreshEntries: loadEntries,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useAppData must be used inside <DataProvider>");
  }
  return ctx;
}
