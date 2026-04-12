import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { localDb, type LawyerProfile } from '../lib/localDb';

type LocalUser = { id: string; email: string };
type LocalSession = { user: LocalUser; createdAt: string };

interface AuthContextType {
  user: LocalUser | null;
  session: LocalSession | null;
  lawyerProfile: LawyerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const storageKey = 'lc_local_auth_user';

  const refreshProfile = async () => {
    if (user) {
      const profile = await localDb.getLawyerProfile(user.id);
      setLawyerProfile(profile);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(storageKey);
        const parsed = raw ? (JSON.parse(raw) as LocalUser) : null;
        if (parsed?.id && parsed?.email) {
          setUser(parsed);
          setSession({ user: parsed, createdAt: new Date().toISOString() });
          const profile = await localDb.getLawyerProfile(parsed.id);
          setLawyerProfile(profile);
          return;
        }

        // Local-mode auto-login (bypasses hosted auth).
        // If no user is stored yet, we create/use a default local account.
        const email = 'test123@gmail.com';
        const password = 'test123';
        let localUser: LocalUser;
        try {
          localUser = await localDb.signIn(email, password);
        } catch {
          localUser = await localDb.signUp(email, password);
        }
        setUser(localUser);
        setSession({ user: localUser, createdAt: new Date().toISOString() });
        localStorage.setItem(storageKey, JSON.stringify(localUser));
        const profile = await localDb.getLawyerProfile(localUser.id);
        setLawyerProfile(profile);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const signedIn = await localDb.signIn(email, password);
      setUser(signedIn);
      setSession({ user: signedIn, createdAt: new Date().toISOString() });
      localStorage.setItem(storageKey, JSON.stringify(signedIn));
      const profile = await localDb.getLawyerProfile(signedIn.id);
      setLawyerProfile(profile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const signedUp = await localDb.signUp(email, password);
      setUser(signedUp);
      setSession({ user: signedUp, createdAt: new Date().toISOString() });
      localStorage.setItem(storageKey, JSON.stringify(signedUp));
      const profile = await localDb.getLawyerProfile(signedUp.id);
      setLawyerProfile(profile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(storageKey);
    setUser(null);
    setSession(null);
    setLawyerProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      lawyerProfile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, session, lawyerProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
