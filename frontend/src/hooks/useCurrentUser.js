/** @format */

import { useEffect, useState } from 'react';
import { authService } from '../services/api';

const clearStoredAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_id');
};

const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() =>
    Boolean(localStorage.getItem('access_token')),
  );

  useEffect(() => {
    if (!localStorage.getItem('access_token')) return undefined;

    let cancelled = false;

    const loadCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (!cancelled) setUser(response.data);
      } catch (error) {
        if (error.response?.status === 401) clearStoredAuth();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    authLoading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user?.is_staff),
  };
};

export default useCurrentUser;
