import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase/client';
import { BUSINESS_CONFIG } from '../config/business';
import { useStore } from './StoreContext';

export interface AdminUser {
  username: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  name: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  adminUsername: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCredentials: (newUsername: string, newPassword: string) => void;
  changeCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toAdminUser = (email: string | undefined, adminName: string, role: 'owner' | 'admin' | 'editor' | 'viewer' = 'viewer'): AdminUser => ({
  username: email ? email.split('@')[0] : 'admin',
  role,
  name: adminName,
});

export const I18nContext = createContext({});

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
  const [role, setRole] = useState<'owner' | 'admin' | 'editor' | 'viewer' | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    setSessionChecked(false);
    setUser(null);
    setRole(null);
  }, []);

  const fetchProfileRole = useCallback(async (userId: string) => {
    const { data: profileData } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    return profileData?.role || 'viewer';
  }, []);

  useEffect(() => {
    if (!adminEmail) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email === adminEmail) {
        // Fetch profile role from profiles table using user ID (UUID)
        const userId = data.session.user.id;
        fetchProfileRole(userId).then((profileRole) => {
          setRole(profileRole);
          setUser(toAdminUser(adminEmail, adminName, profileRole));
        });
      } else {
        setUser(null);
        setRole(null);
      }
      setSessionChecked(true);
    });
  }, [adminEmail, fetchProfileRole]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!adminEmail) return;
      if (session?.user?.email === adminEmail) {
        const userId = session.user.id;
        fetchProfileRole(userId).then((profileRole) => {
          setRole(profileRole);
          setUser(toAdminUser(adminEmail, adminName, profileRole));
        });
      } else {
        setUser(null);
        setRole(null);
      }
      setSessionChecked(true);
    });

    return () => {
      // subscription cleanup handled by supabase
    };
  }, [adminEmail, fetchProfileRole]);

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const cleanUser = username.trim();
      const target = cleanUser.includes('@') ? cleanUser : adminEmail;

      const { data, error } = await supabase.auth.signInWithPassword({ email: target, password: password.trim() });
      if (error) {
        return { success: false, error: "Login yoki parol noto'g'ri." };
      }
      // Fetch profile role after successful login using user ID
      if (data.user) {
        const profileRole = await fetchProfileRole(data.user.id);
        setRole(profileRole);
        setUser(toAdminUser(target, adminName, profileRole));
      }
      return { success: true };
    },
    [adminEmail, adminName, fetchProfileRole],
  );

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }, []);

  const updateCredentials = useCallback((_newUsername: string, _newPassword: string) => {
    // Supabase Auth uses email managed in the dashboard; username is no longer stored locally.
    // Kept for interface compatibility.
  }, []);

  const changeCredentials = useCallback(async (currentPassword: string, _newUsername?: string, newPassword?: string): Promise<boolean> => {
    if (!newPassword) return false;

    // Verify current password is valid for the admin account
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: currentPassword.trim(),
    });
    if (verifyError) return false;

    const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
    if (error) return false;
    return true;
  }, [adminEmail]);

  const adminUsername = user?.username || 'admin';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: sessionChecked && !!user,
        user,
        role,
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