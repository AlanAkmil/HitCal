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
  deleteFoodEntry as deleteFoodEntryLocal,
} from "./storage";
import {
  getProfileCloud,
  saveProfileCloud,
  getFoodLogCloud,
  addFoodEntryCloud,
  deleteFoodEntryCloud,
} from "./firestore-data";

interface DataContextValue {
  profile: Profile | null | undefined;
  profileLoading: boolean;
  saveProfile: (p: Profile) => Promise<void>;
  entries: FoodEntry[];
  entriesLoading: boolean;
  addEntry: (e: FoodEntry) => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (user) {
      setProfile(await getProfileCloud(user.uid));
    } else {
      setProfile(getProfileLocal());
    }
  }, [user]);

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    if (user) {
      setEntries(await getFoodLogCloud(user.uid));
    } else {
      setEntries(getFoodLogLocal());
    }
    setEntriesLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setProfile(undefined);
    loadProfile();
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const saveProfile = useCallback(
    async (p: Profile) => {
      if (user) {
        await saveProfileCloud(user.uid, p);
      } else {
        saveProfileLocal(p);
      }
      setProfile(p);
    },
    [user]
  );

  const addEntry = useCallback(
    async (entry: FoodEntry) => {
      if (user) {
        await addFoodEntryCloud(user.uid, entry);
      } else {
        addFoodEntryLocal(entry);
      }
      await loadEntries();
    },
    [user, loadEntries]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (user) {
        await deleteFoodEntryCloud(user.uid, id);
      } else {
        deleteFoodEntryLocal(id);
      }
      await loadEntries();
    },
    [user, loadEntries]
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
