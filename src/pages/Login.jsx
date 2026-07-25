import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/login.css";

export default function Login() {
  const { login, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  // Active view tab state: "borrower" (Client) vs "partner" (Broker)
  const [activeTab, setActiveTab] = useState("borrower");

  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "/api/auth";

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const endpoint = cleanEmail === "admin@finn4sure.com" ? "/admin-login" : "/login";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        credentials: "include", // Required for session/cookie auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Too many login attempts. The server rate limit was reached — please wait 1 minute and try again.");
        }
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (_) {}
        throw new Error(errorData.message || `Login failed (Status ${res.status})`);
      }

      const data = await res.json();

      // Store user session state
      login(data);

      // Re-sync profile from backend for data consistency
      await fetchProfile();

      // Role-based redirect
      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.role === "broker" || data.role === "partner") {
        navigate("/broker-dashboard");
      } else {
        if (redirectTarget) {
          const draftStr = sessionStorage.getItem("pendingLoanApp");
          const draftState = draftStr ? JSON.parse(draftStr) : {};
          navigate(redirectTarget, { state: { ...draftState, step: 3 } });
        } else {
          navigate("/client-dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  return (
    <div className="login-page-wrap">
      <div className="login-page-content animate-fade-up">
        <div className="login-form-card">
          {redirectTarget && (
            <div style={{ marginBottom: "20px", padding: "12px 16px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", color: "#1E40AF", fontSize: ".85rem", textAlign: "center", fontWeight: 600 }}>
              🔒 Please sign in to your Borrower account to review and submit your loan application.
            </div>
          )}

          {/* Form Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--navy)", fontWeight: 700, marginBottom: "6px" }}>
              Sign In
            </div>
            <div style={{ fontSize: ".85rem", color: "var(--text2)" }}>
              {activeTab === "borrower" ? "Access your loan dashboard" : "Access partner portal"}
            </div>
          </div>

          {/* Login Tabs */}
          <div className="login-tabs">
            <button
              className={`login-tab ${activeTab === "borrower" ? "active" : ""}`}
              onClick={() => handleTabChange("borrower")}
            >
              🏠 Borrower
            </button>
            <button
              className={`login-tab ${activeTab === "partner" ? "active" : ""}`}
              onClick={() => handleTabChange("partner")}
            >
              🤝 Partner
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm" style={{ marginBottom: "6px" }}>
                ⚠️ {error}
              </div>
            )}

            <div className="input-wrap">
              <span className="icon">📧</span>
              <input
                type="email"
                placeholder={activeTab === "borrower" ? "Email Address" : "Registered Partner Email"}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-wrap">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary ${activeTab === "partner" ? "partner-btn" : ""}`}
              style={{ height: "44px", marginTop: "8px" }}
            >
              {loading ? "Signing In..." : activeTab === "borrower" ? "Sign In" : "Sign In to Partner Portal"}
            </button>

            {/* Account Redirection link */}
            <div style={{ textAlign: "center", marginTop: "14px", fontSize: ".8rem", color: "var(--text2)" }}>
              {activeTab === "borrower" ? (
                <>
                  Don't have an account?{" "}
                  <Link to="/?view=borrower" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>
                    Register here
                  </Link>
                </>
              ) : (
                <>
                  New partner?{" "}
                  <Link to="/?view=partner" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>
                    Apply here
                  </Link>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export { Login };
