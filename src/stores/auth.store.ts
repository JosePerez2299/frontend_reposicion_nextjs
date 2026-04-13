import { create } from "zustand";
import Cookies from "js-cookie";
import type { User } from "@/types/auth.types";

const ACCESS_TOKEN_COOKIE = "auth_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const AUTH_USER_COOKIE = "auth_user";
const COOKIE_EXPIRY_DAYS = 7;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
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
  return Cookies.get(ACCESS_TOKEN_COOKIE) ?? null;
}

function getRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_COOKIE) ?? null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getCookieUser(),
  accessToken: getCookieToken(),
  refreshToken: getRefreshToken(),
  isAuthenticated: !!getCookieToken(),
  isLoading: false,

  setSession: (user: User, accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { expires: COOKIE_EXPIRY_DAYS });
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { expires: COOKIE_EXPIRY_DAYS });
    Cookies.set(AUTH_USER_COOKIE, JSON.stringify(user), { expires: COOKIE_EXPIRY_DAYS });
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { expires: COOKIE_EXPIRY_DAYS });
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { expires: COOKIE_EXPIRY_DAYS });
    set({ accessToken, refreshToken });
  },

  logout: () => {
    Cookies.remove(ACCESS_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
    Cookies.remove(AUTH_USER_COOKIE);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    Cookies.set(AUTH_USER_COOKIE, JSON.stringify(user), { expires: COOKIE_EXPIRY_DAYS });
    set({ user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
