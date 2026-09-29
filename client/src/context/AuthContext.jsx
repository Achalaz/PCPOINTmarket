import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('pcpoint_jwt_token') || null);
  const [loading, setLoading] = useState(true);

  // Helper to make API requests with credentials (cookies) and Authorization header
  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // sends HTTP-only cookies
      });

      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    },
    [token]
  );

  // Refresh profile details
  const fetchProfile = useCallback(async () => {
    try {
      const res = await authFetch('/api/profile');
      if (res.ok && res.data.success) {
        setProfile(res.data.profile);
        if (res.data.user) {
          setUser((prev) => ({ ...prev, ...res.data.user }));
        }
        return res.data;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  }, [authFetch]);

  // Initial session check on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await authFetch('/api/auth/me');
        if (res.ok && res.data.success) {
          setUser(res.data.user);
          await fetchProfile();
        } else {
          // Clear stale token if unauthorized
          if (token && res.status === 401) {
            localStorage.removeItem('pcpoint_jwt_token');
            setToken(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.warn('Session verification error:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [token, authFetch, fetchProfile]);

  // Register
  const register = async ({ full_name, email, password, confirmPassword }) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }
    return data;
  };

  // Login
  const login = async (email, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    if (data.token) {
      localStorage.setItem('pcpoint_jwt_token', data.token);
      setToken(data.token);
    }
    setUser(data.user);

    // Fetch initial profile
    const profRes = await fetch('/api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      credentials: 'include',
    });
    const profData = await profRes.json().catch(() => null);
    if (profData?.profile) {
      setProfile(profData.profile);
    }

    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('pcpoint_jwt_token');
      setToken(null);
      setUser(null);
      setProfile(null);
      window.location.hash = '#home';
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const res = await authFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (!res.ok || !res.data.success) {
      throw new Error(res.data.message || 'Failed to update profile details.');
    }
    if (res.data.user) setUser((prev) => ({ ...prev, ...res.data.user }));
    if (res.data.profile) setProfile(res.data.profile);
    return res.data;
  };

  // Change password
  const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    const res = await authFetch('/api/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    if (!res.ok || !res.data.success) {
      throw new Error(res.data.message || 'Failed to change password.');
    }
    return res.data;
  };

  // Sync Guest Cart items
  const syncGuestCart = async (guestItems = []) => {
    if (!token && !user) return null;
    try {
      const res = await authFetch('/api/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ guestItems }),
      });
      if (res.ok && res.data.success) {
        setProfile((prev) => (prev ? { ...prev, cart_items: res.data.cart, merged_guest_items_count: res.data.mergedCount } : prev));
        return res.data;
      }
    } catch (err) {
      console.error('Cart sync error:', err);
    }
    return null;
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    if (!token) throw new Error('Not authenticated.');
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch('/api/upload/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to upload avatar.');
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
        changePassword,
        syncGuestCart,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
