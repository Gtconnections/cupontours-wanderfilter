// hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string | number;
  username: string;
  email?: string;
  position: string;
  fullName?: string;
  profile_id?: string | number;
  user_id?: string | number;
  [key: string]: unknown;
}

interface UseAuthReturn {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isChecking: boolean;
  login: (userData: UserData, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => void;
  checkAuth: () => boolean;
  getProfileId: () => number | null;
  getUserId: () => number | null;
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  const AUTH_KEYS = [
    'accessToken', 'isUserLoggedIn', 'userData', 'user_id',
    'username', 'position', 'userEmail', 'fullName', 'profile_id'
  ];

  // 🔥 FUNCIÓN PARA OBTENER PROFILE_ID
  const getProfileId = useCallback((): number | null => {
    if (typeof window === 'undefined') return null;
    
    // 1. Intentar desde localStorage
    const storedProfileId = localStorage.getItem('profile_id');
    if (storedProfileId) {
      const id = Number(storedProfileId);
      if (!isNaN(id) && id > 0) {
        console.log('📦 getProfileId desde localStorage:', id);
        return id;
      }
    }
    
    // 2. Intentar desde sessionStorage
    const sessionProfileId = sessionStorage.getItem('profile_id');
    if (sessionProfileId) {
      const id = Number(sessionProfileId);
      if (!isNaN(id) && id > 0) {
        console.log('📦 getProfileId desde sessionStorage:', id);
        return id;
      }
    }
    
    // 3. Intentar desde user
    if (user?.profile_id) {
      const id = Number(user.profile_id);
      if (!isNaN(id) && id > 0) {
        console.log('📦 getProfileId desde user:', id);
        return id;
      }
    }
    
    console.warn('⚠️ No se encontró profile_id');
    return null;
  }, [user]);

  // 🔥 FUNCIÓN PARA OBTENER USER_ID
  const getUserId = useCallback((): number | null => {
    if (typeof window === 'undefined') return null;
    
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      const id = Number(storedUserId);
      if (!isNaN(id) && id > 0) return id;
    }
    
    if (user?.user_id) {
      return Number(user.user_id);
    }
    
    return null;
  }, [user]);

  const checkAuth = useCallback((): boolean => {
    try {
      if (typeof window === 'undefined') return false;

      const cookieToken = getCookie('accessToken');
      const cookieUserId = getCookie('user_id');
      const cookieUsername = getCookie('username');
      const cookiePosition = getCookie('position');
      const cookieProfileId = getCookie('profile_id');

      if (cookieToken && cookieUserId) {
        const userData: UserData = {
          id: cookieProfileId || cookieUserId,
          user_id: cookieUserId,
          username: cookieUsername || 'usuario',
          position: cookiePosition || 'customer',
          profile_id: cookieProfileId || cookieUserId,
        };
        
        setToken(cookieToken);
        setUser(userData);
        return true;
      }

      const storedToken = localStorage.getItem('accessToken');
      const storedUserData = localStorage.getItem('userData');

      if (storedToken && storedUserData) {
        const userData = JSON.parse(storedUserData);
        // 🔥 Asegurar que todos los campos existan
        const profileId = userData.profile_id || localStorage.getItem('profile_id') || userData.id;
        userData.id = profileId;
        userData.user_id = userData.user_id || userData.id;
        userData.profile_id = profileId;
        
        setToken(storedToken);
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }, []);

  const loadUserData = useCallback((): boolean => {
    try {
      if (typeof window === 'undefined') return false;

      const cookieToken = getCookie('accessToken');
      const cookieUserId = getCookie('user_id');
      const cookieUsername = getCookie('username');
      const cookiePosition = getCookie('position');
      const cookieProfileId = getCookie('profile_id');

      if (cookieToken && cookieUserId) {
        const userData: UserData = {
          id: cookieProfileId || cookieUserId,
          user_id: cookieUserId,
          username: cookieUsername || 'usuario',
          position: cookiePosition || 'customer',
          profile_id: cookieProfileId || cookieUserId,
        };
        
        setToken(cookieToken);
        setUser(userData);
        return true;
      }

      const storedToken = localStorage.getItem('accessToken');
      const storedUserData = localStorage.getItem('userData');

      if (storedToken && storedUserData) {
        const userData = JSON.parse(storedUserData);
        // 🔥 Asegurar que todos los campos existan
        const profileId = userData.profile_id || localStorage.getItem('profile_id') || userData.id;
        userData.id = profileId;
        userData.user_id = userData.user_id || userData.id;
        userData.profile_id = profileId;
        
        setToken(storedToken);
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Reading localStorage/cookies must happen after mount to avoid an SSR hydration
    // mismatch, so the resulting setState calls are intentionally synchronous here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const hasData = loadUserData();
    setIsLoading(false);
    setIsChecking(false);
    
    if (!hasData && typeof window !== 'undefined') {
      AUTH_KEYS.forEach(key => {
        localStorage.removeItem(key);
        deleteCookie(key);
      });
    }
  }, [loadUserData]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🔒 Iniciando logout...');

      AUTH_KEYS.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        deleteCookie(key);
      });

      setUser(null);
      setToken(null);

      console.log('✅ Logout exitoso');
      
      router.push('/login?logout=success');
      
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?logout=success';
        }
      }, 300);

    } catch (error) {
      console.error('❌ Error en logout:', error);
      window.location.href = '/login';
    }
  }, [router]);

  const login = useCallback((userData: UserData, newToken: string) => {
    try {
      const profileId = userData.profile_id || userData.id;
      const userId = userData.user_id || userData.id;
      
      const userInfo = {
        id: profileId,
        user_id: userId,
        username: userData.username,
        email: userData.email || '',
        position: userData.position || 'customer',
        fullName: userData.fullName || userData.username,
        profile_id: profileId,
      };

      localStorage.setItem('accessToken', newToken);
      localStorage.setItem('isUserLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userInfo));
      localStorage.setItem('user_id', userId.toString());
      localStorage.setItem('username', userData.username);
      localStorage.setItem('profile_id', profileId.toString());

      const setCookie = (name: string, value: string) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      };

      setCookie('accessToken', newToken);
      setCookie('isUserLoggedIn', 'true');
      setCookie('user_id', userId.toString());
      setCookie('username', userData.username);
      setCookie('profile_id', profileId.toString());

      const positionMap: Record<string, string> = {
        'admin': '1', 'administrator': '1', 'superadmin': '1',
        'owner': '2', 'proprietor': '2',
        'customer': '3', 'client': '3', 'user': '3'
      };
      setCookie('position', positionMap[userData.position?.toLowerCase()] || '3');

      setUser(userInfo);
      setToken(newToken);
      
      console.log('✅ Login exitoso en useAuth');
      console.log('  - User ID:', userId);
      console.log('  - Profile ID:', profileId);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback((data: Partial<UserData>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  }, [user]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isChecking,
    login,
    logout,
    updateUser,
    checkAuth,
    getProfileId,
    getUserId,
  };
}