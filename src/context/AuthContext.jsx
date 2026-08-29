import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/auth/profile", {
        credentials: "include",
        cache: "no-store",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 401) {
        setUser(null);
      }
    } catch (e) {
      console.warn("Profile fetch network warning:", e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run once on app load / refresh
  useEffect(() => {
    fetchProfile();
  }, []);

  // Called after login
  function login(userData) {
    setUser(userData);
  }

  // Admin login is now handled directly by the /admin-login backend endpoint
  // and syncs normally via login(userData) and fetchProfile()

  // Called on logout
  async function logout() {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers,
      });
    } catch (_) {}
    localStorage.removeItem("accessToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "",
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
