import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import api, {User, Tokens} from '../lib/api';

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{user: User; otpSent: boolean}>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        setUser(me);
      } catch {
        await api.clearTokens();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login({email, password});
    await api.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const data = await api.register(body);
      await api.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      return {user: data.user, otpSent: data.otpSent};
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {}
    await api.clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({user, loading, login, register, logout, refreshUser, setUser}),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
