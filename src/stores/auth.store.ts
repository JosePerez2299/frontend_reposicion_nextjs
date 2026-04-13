import { create } from "zustand";
import Cookies from "js-cookie";
import type { User } from "@/types/auth.types";

const AUTH_TOKEN_COOKIE = "auth_token";
const AUTH_USER_COOKIE = "auth_user";
const COOKIE_EXPIRY_DAYS = 7;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

function getCookieUser(): User | null {
  try {
    const raw = Cookies.get(AUTH_USER_COOKIE);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function getCookieToken(): string | null {
  return Cookies.get(AUTH_TOKEN_COOKIE) ?? null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getCookieUser(),
  token: getCookieToken(),
  isAuthenticated: !!getCookieToken(),
  isLoading: false,

  setSession: (user: User, token: string) => {
    Cookies.set(AUTH_TOKEN_COOKIE, token, { expires: COOKIE_EXPIRY_DAYS });
    Cookies.set(AUTH_USER_COOKIE, JSON.stringify(user), {
      expires: COOKIE_EXPIRY_DAYS,
    });
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove(AUTH_TOKEN_COOKIE);
    Cookies.remove(AUTH_USER_COOKIE);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    Cookies.set(AUTH_USER_COOKIE, JSON.stringify(user), {
      expires: COOKIE_EXPIRY_DAYS,
    });
    set({ user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
