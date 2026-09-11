"use client";

import { useCallback, useEffect, useState } from "react";
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

// Reads/writes the profile from Firestore when logged in, or localStorage
// when not — so every page can just call this hook instead of juggling
// two storage backends itself.
export function useProfileData() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfileState] = useState<Profile | null | undefined>(undefined);

  const reload = useCallback(async () => {
    if (user) {
      setProfileState(await getProfileCloud(user.uid));
    } else {
      setProfileState(getProfileLocal());
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setProfileState(undefined);
    reload();
  }, [authLoading, reload]);

  const saveProfile = useCallback(
    async (p: Profile) => {
      if (user) {
        await saveProfileCloud(user.uid, p);
      } else {
        saveProfileLocal(p);
      }
      setProfileState(p);
    },
    [user]
  );

  return {
    profile,
    saveProfile,
    loading: authLoading || profile === undefined,
    isCloud: !!user,
  };
}

// Same idea for the food log: one array of entries, sourced from Firestore
// when logged in or localStorage when not, with add/delete that write to
// whichever backend is active.
export function useFoodLogData() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    if (user) {
      setEntries(await getFoodLogCloud(user.uid));
    } else {
      setEntries(getFoodLogLocal());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    reload();
  }, [authLoading, reload]);

  const addEntry = useCallback(
    async (entry: FoodEntry) => {
      if (user) {
        await addFoodEntryCloud(user.uid, entry);
      } else {
        addFoodEntryLocal(entry);
      }
      await reload();
    },
    [user, reload]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (user) {
        await deleteFoodEntryCloud(user.uid, id);
      } else {
        deleteFoodEntryLocal(id);
      }
      await reload();
    },
    [user, reload]
  );

  return { entries, addEntry, deleteEntry, loading, isCloud: !!user, refresh: reload };
}
