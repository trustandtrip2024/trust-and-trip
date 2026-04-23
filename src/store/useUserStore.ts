import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

interface UserStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (v: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
