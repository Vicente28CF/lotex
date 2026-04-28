"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  type AuthRequestOptions,
  logoutAuthSession,
  refreshAuthSession,
} from "@/lib/api";
import type { AuthSession } from "@/lib/types";

type AuthContextValue = {
  session: AuthSession | null;
  auth: AuthRequestOptions | null;
  isReady: boolean;
  isAuthenticated: boolean;
  isRestoring: boolean;
  isRefreshing: boolean;
  sessionNotice: { type: "info" | "success" | "error"; message: string } | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  refreshSession: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function restoreSession() {
      const stored = window.sessionStorage.getItem("terrify-auth");

      if (!stored) {
        if (!isCancelled) {
          setIsRestoring(false);
          setIsReady(true);
        }
        return;
      }

      try {
        const parsed = JSON.parse(stored) as AuthSession;
        const refreshedSession = await refreshAuthSession(parsed.refreshToken);

        if (isCancelled) {
          return;
        }

        if (refreshedSession) {
          setSession(refreshedSession);
          setSessionNotice({
            type: "success",
            message: "Sesion restaurada correctamente.",
          });
        } else {
          window.sessionStorage.removeItem("terrify-auth");
          setSession(null);
          setSessionNotice({
            type: "error",
            message: "Tu sesion anterior expiro. Vuelve a iniciar sesion.",
          });
        }
      } catch {
        window.sessionStorage.removeItem("terrify-auth");
        if (!isCancelled) {
          setSession(null);
          setSessionNotice({
            type: "error",
            message: "No se pudo restaurar la sesion guardada.",
          });
        }
      } finally {
        if (!isCancelled) {
          setIsRestoring(false);
          setIsReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionNotice || sessionNotice.type === "error") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSessionNotice(null);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [sessionNotice]);

  useEffect(() => {
    if (!isReady) return;

    if (session) {
      window.sessionStorage.setItem("terrify-auth", JSON.stringify(session));
      return;
    }

    window.sessionStorage.removeItem("terrify-auth");
  }, [isReady, session]);

  async function handleRefreshSession() {
    if (!session?.refreshToken) {
      setSession(null);
      setSessionNotice({
        type: "error",
        message: "Tu sesion expiro. Vuelve a iniciar sesion.",
      });
      return null;
    }

    setIsRefreshing(true);
    const refreshedSession = await refreshAuthSession(session.refreshToken);

    if (!refreshedSession) {
      setSession(null);
      setIsRefreshing(false);
      setSessionNotice({
        type: "error",
        message: "Tu sesion expiro. Vuelve a iniciar sesion.",
      });
      return null;
    }

    setSession(refreshedSession);
    setIsRefreshing(false);
    setSessionNotice({
      type: "success",
      message: "Sesion renovada correctamente.",
    });
    return refreshedSession;
  }

  function handleLogin(nextSession: AuthSession) {
    setSession(nextSession);
    setIsRefreshing(false);
    setSessionNotice(null);
  }

  function handleLogout() {
    const currentSession = session;
    setSession(null);
    setIsRefreshing(false);
    setSessionNotice(null);

    if (currentSession) {
      void logoutAuthSession(currentSession);
    }
  }

  const auth = useMemo(
    () =>
      session
        ? {
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            onSessionUpdate: setSession,
            onUnauthorized: () => {
              setSession(null);
              setIsRefreshing(false);
              setSessionNotice({
                type: "error",
                message: "Tu sesion expiro. Vuelve a iniciar sesion.",
              });
            },
            onRefreshStart: () => {
              setIsRefreshing(true);
              setSessionNotice({
                type: "info",
                message: "Renovando tu sesion...",
              });
            },
            onRefreshSuccess: () => {
              setIsRefreshing(false);
              setSessionNotice({
                type: "success",
                message: "Sesion renovada correctamente.",
              });
            },
            onRefreshFailure: () => {
              setIsRefreshing(false);
              setSessionNotice({
                type: "error",
                message: "Tu sesion expiro. Vuelve a iniciar sesion.",
              });
            },
          }
        : null,
    [session],
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        auth,
        isReady,
        isAuthenticated: Boolean(session?.accessToken),
        isRestoring,
        isRefreshing,
        sessionNotice,
        login: handleLogin,
        logout: handleLogout,
        refreshSession: handleRefreshSession,
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
