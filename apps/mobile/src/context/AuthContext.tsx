import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  apiFetch,
  getStoredToken,
  setStoredToken,
  setOnboardingComplete,
  isOnboardingComplete,
} from "../api/client";

type User = { id: string; email: string; phoneE164: string; kycStatus: string };

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  onboardingDone: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (phoneE164: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
  markOnboardingFinished: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const refreshMe = useCallback(async () => {
    const t = await getStoredToken();
    setToken(t);
    if (!t) {
      setUser(null);
      setOnboardingDone(false);
      return;
    }
    const res = await apiFetch("/users/me", { token: t });
    if (!res.ok) {
      await setStoredToken(null);
      setToken(null);
      setUser(null);
      setOnboardingDone(false);
      return;
    }
    const me = await res.json();
    setUser({
      id: me.id,
      email: me.email,
      phoneE164: me.phoneE164,
      kycStatus: me.kycStatus,
    });
    setOnboardingDone(await isOnboardingComplete());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const signIn = async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      token: null,
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    await setStoredToken(data.accessToken);
    await setOnboardingComplete(true);
    setToken(data.accessToken);
    setUser(data.user);
    setOnboardingDone(true);
  };

  const signUp = async (phoneE164: string, email: string, password: string) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      token: null,
      body: JSON.stringify({ phoneE164, email, password }),
    });
    if (!res.ok) throw new Error("Registration failed");
    const data = await res.json();
    await setStoredToken(data.accessToken);
    await setOnboardingComplete(false);
    setToken(data.accessToken);
    setUser(data.user);
    setOnboardingDone(false);
  };

  const signOut = async () => {
    await setStoredToken(null);
    setToken(null);
    setUser(null);
    setOnboardingDone(false);
  };

  const markOnboardingFinished = async () => {
    await setOnboardingComplete(true);
    setOnboardingDone(true);
  };

  return (
    <Ctx.Provider
      value={{
        token,
        user,
        loading,
        onboardingDone,
        signIn,
        signUp,
        signOut,
        refreshMe,
        markOnboardingFinished,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth inside AuthProvider");
  return v;
}
