import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (isAdmin) {
      return { role: "admin", email: "admin@finn4sure.com", name: "Admin" };
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // 🔥 Sync frontend auth with backend session
  const fetchProfile = async () => {
    if (localStorage.getItem("admin_logged_in") === "true") {
      setUser({ role: "admin", email: "admin@finn4sure.com", name: "Admin" });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("https://palevioletred-ape-449755.hostingersite.com/api/auth/profile", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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

  // Called on admin login
  function adminLogin() {
    localStorage.setItem("admin_logged_in", "true");
    setUser({ role: "admin", email: "admin@finn4sure.com", name: "Admin" });
  }

  // Called on logout
  async function logout() {
    localStorage.removeItem("admin_logged_in");
    await fetch("https://palevioletred-ape-449755.hostingersite.com/api/auth/logout", {
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
        adminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}