import { createContext, useState, useEffect, useContext } from "react";
import { AuthService } from "../services/AuthService";
import { useDataCache } from "./DataCacheContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [loadingInitial, setLoadingInitial] = useState(true);
  const { user, loadUser, clearUser } = useDataCache();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Consultar /auth/session para validar la cookie HttpOnly
        const session = await AuthService.getSession();
        if (!isMounted) return;

        if (session && session.authenticated) {
          setIsAuthenticated(true);
          try {
            await loadUser();
          } catch {
            // Usuario en sesión pero falló carga de datos
          }
        } else if (AuthService.isAuthenticated()) {
          // Fallback legacy (token en localStorage)
          setIsAuthenticated(true);
          try {
            await loadUser();
          } catch {
            clearUser();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
          clearUser();
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          clearUser();
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", checkAuth);
    };
  }, [loadUser, clearUser]);

  // Renovación proactiva y silenciosa del token en segundo plano cada 9 minutos mientras la sesión esté activa
  useEffect(() => {
    if (!isAuthenticated) return;

    const REFRESH_INTERVAL_MS = 9 * 60 * 1000; // 9 minutos (access token dura 15m)
    const interval = setInterval(async () => {
      try {
        await AuthService.refreshTokens();
      } catch {
        // Silencioso: si falla, el interceptor 401 manejará la renovación reactiva
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (mail, password, options = {}) => {
    const rememberMe = options.rememberMe !== undefined ? options.rememberMe : true;
    const res = await AuthService.login(mail, password, { rememberMe });
    if (res && res.requires2FA) {
      return res;
    }
    setIsAuthenticated(true);
    await loadUser(true);
    return res;
  };

  const verify2FA = async ({ tempToken, code, isRecoveryCode, trustDevice, rememberMe = true }) => {
    const res = await AuthService.verify2FA({
      tempToken,
      code,
      isRecoveryCode,
      trustDevice,
      rememberMe,
    });
    setIsAuthenticated(true);
    await loadUser(true);
    return res;
  };

  const resend2FA = async ({ tempToken }) => {
    return await AuthService.resend2FA({ tempToken });
  };

  const register = async ({ mail, password, person }) => {
    await AuthService.register({ mail, password, person });
    setIsAuthenticated(true);
    await loadUser(true);
  };

  const logout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    clearUser();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loadingInitial,
        user,
        login,
        verify2FA,
        resend2FA,
        register,
        logout,
        refreshUser: () => loadUser(true),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
