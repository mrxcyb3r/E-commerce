import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase/client';
import { BUSINESS_CONFIG } from '../config/business';
import { useStore } from './StoreContext';

const toAdminUser = (email: string | undefined, adminName: string): AdminUser => ({
  username: email ? email.split('@')[0] : 'admin',
  role: 'admin',
  name: adminName,
});

export interface AdminUser {
  username: string;
  role: 'admin';
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  adminUsername: string;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCredentials: (newUsername: string, newPassword: string) => void;
  changeCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { storeInfo } = useStore();
  const adminEmail = useMemo(
    () => storeInfo.adminEmail || BUSINESS_CONFIG.adminEmail || 'admin@dokon.uz',
    [storeInfo.adminEmail],
  );
  const adminName = useMemo(
    () => storeInfo.adminName || BUSINESS_CONFIG.adminName || "Do'kon Administratori",
    [storeInfo.adminName],
  );

  const [user, setUser] = useState<AdminUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [email, setEmail] = useState(adminEmail);

  useEffect(() => {
    setSessionChecked(false);
    setUser(null);
    setEmail(adminEmail);
  }, [adminEmail]);

  useEffect(() => {
    if (!email) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email === email) {
        setUser(toAdminUser(data.session.user.email, adminName));
      } else {
        setUser(null);
      }
      setSessionChecked(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === email) {
        setUser(toAdminUser(session.user.email, adminName));
      } else {
        setUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [email, adminName]);

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const cleanUser = username.trim();
      const target = cleanUser.includes('@') ? cleanUser : email;

      const { error } = await supabase.auth.signInWithPassword({ email: target, password: password.trim() });
      if (error) {
        return { success: false, error: "Login yoki parol noto'g'ri." };
      }
      setUser(toAdminUser(target, adminName));
      return { success: true };
    },
    [email, adminName],
  );

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateCredentials = useCallback((_newUsername: string, _newPassword: string) => {
    // Supabase Auth uses email managed in the dashboard; username is no longer stored locally.
    // Kept for interface compatibility.
  }, []);

  const changeCredentials = useCallback(async (currentPassword: string, _newUsername?: string, newPassword?: string): Promise<boolean> => {
    if (!newPassword) return false;

    // Verify current password is valid for the admin account
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword.trim(),
    });
    if (verifyError) return false;

    const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
    if (error) return false;
    return true;
  }, [email]);

  const adminUsername = user?.username || 'admin';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: sessionChecked && !!user,
        user,
        adminUsername,
        login,
        logout,
        updateCredentials,
        changeCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
