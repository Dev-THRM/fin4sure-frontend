import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
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
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
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
