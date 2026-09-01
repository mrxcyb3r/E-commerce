import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  changeCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => boolean;
}

const AUTH_STORAGE_KEY = 'store_admin_auth_user';
const CREDENTIALS_STORAGE_KEY = 'store_admin_custom_credentials';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = '12345678';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const getSavedCredentials = () => {
    try {
      const stored = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
  };

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    // Artificial slight delay for realistic auth feedback
    await new Promise((resolve) => setTimeout(resolve, 350));

    const creds = getSavedCredentials();
    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    if (cleanUser === creds.username && cleanPass === creds.password) {
      const adminUser: AdminUser = {
        username: creds.username,
        role: 'admin',
        name: 'Do\'kon Administratori',
      };
      setUser(adminUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    return { success: false, error: "Login yoki parol noto'g'ri." };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateCredentials = (newUsername: string, newPassword: string) => {
    const creds = { username: newUsername.trim(), password: newPassword.trim() };
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(creds));
    if (user) {
      const updatedUser = { ...user, username: creds.username };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const changeCredentials = (currentPassword: string, newUsername?: string, newPassword?: string): boolean => {
    const creds = getSavedCredentials();
    if (currentPassword.trim() !== creds.password) {
      return false;
    }
    const updated = {
      username: newUsername ? newUsername.trim() : creds.username,
      password: newPassword ? newPassword.trim() : creds.password,
    };
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(updated));
    if (user) {
      const updatedUser = { ...user, username: updated.username };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
    return true;
  };

  const currentUsername = user?.username || getSavedCredentials().username;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        adminUsername: currentUsername,
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
