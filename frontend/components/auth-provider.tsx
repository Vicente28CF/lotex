"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { AuthSession } from "@/lib/types";

type AuthContextValue = {
  session: AuthSession | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("lotex-auth");
    if (stored) {
      setSession(JSON.parse(stored) as AuthSession);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (session) {
      window.sessionStorage.setItem("lotex-auth", JSON.stringify(session));
      return;
    }
    window.sessionStorage.removeItem("lotex-auth");
  }, [isReady, session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isReady,
        isAuthenticated: Boolean(session?.accessToken),
        login: setSession,
        logout: () => setSession(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
