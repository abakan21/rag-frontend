import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import keycloak from '../keycloak';

interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading] = useState(false);

  const extractUser = useCallback(() => {
    if (keycloak.authenticated && keycloak.tokenParsed) {
      const roles: string[] = keycloak.tokenParsed.realm_access?.roles || [];
      setUser({
        id: keycloak.tokenParsed.sub || '',
        username: keycloak.tokenParsed.preferred_username || '',
        role: roles.includes('admin') ? 'admin' : 'user',
      });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'check-sso', checkLoginIframe: false })
      .then(() => {
        extractUser();
      })
      .catch((err) => {
        console.error('[Keycloak] Init failed', err);
      });

    // Refresh token before it expires
    const interval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(30).catch(() => {
          console.warn('[Keycloak] Token refresh failed');
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [extractUser]);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin + '/search' });
  };

  const token = keycloak.token || null;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}
