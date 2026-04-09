"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { oauthAvatarUrlFromUser } from "@/lib/account-display";
import type { Profile } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  initialSession: Session | null;
  initialProfile: Profile | null;
};

export function AuthProvider({ children, initialSession, initialProfile }: AuthProviderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    const uid = user?.id;
    if (!uid || !user) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error || !data) {
      if (!error) setProfile(null);
      return;
    }
    let row = data as Profile;
    const oauthUrl = oauthAvatarUrlFromUser(user);
    if (oauthUrl && !row.avatar_url?.trim()) {
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ avatar_url: oauthUrl })
        .eq("id", uid);
      if (!upErr) row = { ...row, avatar_url: oauthUrl };
    }
    setProfile(row);
  }, [supabase, user]);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    void supabase.auth.getSession().then(({ data: { session: latest } }) => {
      setSession(latest);
      setUser(latest?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    void refreshProfile();
  }, [user?.id, refreshProfile]);

  const signOut = useCallback(async () => {
    setProfile(null);
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      signOut,
      refreshProfile
    }),
    [user, session, profile, loading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
