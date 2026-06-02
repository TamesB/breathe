import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthRedirectUrl } from "../lib/authRedirect";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type AuthStatus = "loading" | "guest" | "authenticated";

interface AuthState {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  initialized: boolean;
  init: () => () => void;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  status: "loading",
  initialized: false,

  init: () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ status: "guest", initialized: true });
      return () => {};
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? "authenticated" : "guest",
        initialized: true,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? "authenticated" : "guest",
      });
    });

    return () => subscription.unsubscribe();
  },

  signInWithEmail: async (email) => {
    if (!supabase) throw new Error("Supabase is not configured");
    const redirectTo = getAuthRedirectUrl();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
  },

  signInWithGoogle: async () => {
    if (!supabase) throw new Error("Supabase is not configured");
    const redirectTo = getAuthRedirectUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  },

  signOut: async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
}));
