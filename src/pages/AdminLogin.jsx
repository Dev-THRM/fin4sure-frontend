import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.jpeg";

export default function AdminLogin() {
  const { user, role, isAuthenticated, login, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && (role === "admin" || user?.role === "admin" || user?.email === "admin@finn4sure.com")) {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [isAuthenticated, role, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin master password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
        setSuccess(true);
        login(data.user);
        await fetchProfile();
        setTimeout(() => {
          navigate("/admin-dashboard", { replace: true });
        }, 600);
      } else {
        setError(data.message || "Invalid admin credentials.");
      }
    } catch (_err) {
      setError("Unable to connect to auth server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "88vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      background: "linear-gradient(135deg, #091E3A 0%, #0F2F57 50%, #1A365D 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background ambient glowing shapes */}
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, rgba(0,0,0,0) 70%)",
        top: "-100px",
        right: "-50px",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(0,0,0,0) 70%)",
        bottom: "-80px",
        left: "-50px",
        pointerEvents: "none"
      }} />

      <div style={{
        maxWidth: "420px",
        width: "100%",
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        padding: "36px 28px",
        position: "relative",
        zIndex: 1
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(13, 148, 136, 0.2) 0%, rgba(15, 118, 110, 0.4) 100%)",
            border: "1px solid rgba(45, 212, 191, 0.3)",
            marginBottom: "16px",
            boxShadow: "0 8px 16px -4px rgba(13, 148, 136, 0.3)"
          }}>
            <ShieldCheck size={32} color="#2DD4BF" strokeWidth={2.2} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
            <img src={logo} alt="Finn4sure" style={{ height: "24px", borderRadius: "4px" }} />
            <span style={{ color: "#F8FAFC", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.5px" }}>
              Finn4sure <span style={{ color: "#2DD4BF" }}>Admin</span>
            </span>
          </div>

          <p style={{
            margin: 0,
            fontSize: ".82rem",
            color: "#94A3B8",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            fontWeight: 600
          }}>
            Restricted Control Panel Access
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div style={{
            padding: "14px",
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#4ADE80",
            fontSize: ".88rem",
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} />
            <span>Authentication verified. Redirecting...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: "12px 14px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#F87171",
            fontSize: ".85rem",
            fontWeight: 500
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: ".78rem",
              fontWeight: 700,
              color: "#CBD5E1",
              marginBottom: "6px",
              letterSpacing: "0.4px"
            }}>
              MASTER SECURITY KEY
            </label>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{
                position: "absolute",
                left: "14px",
                color: "#64748B",
                display: "flex",
                alignItems: "center"
              }}>
                <Lock size={16} />
              </span>
              <input
                id="admin-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 44px 0 40px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: error ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "12px",
                  color: "#F8FAFC",
                  fontSize: ".92rem",
                  outline: "none",
                  transition: "border-color .2s, box-shadow .2s",
                  boxSizing: "border-box"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading || success}
            style={{
              height: "46px",
              marginTop: "6px",
              background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#FFFFFF",
              fontSize: ".9rem",
              fontWeight: 700,
              cursor: (loading || success) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 14px 0 rgba(13, 148, 136, 0.4)",
              transition: "transform .15s, box-shadow .15s",
              opacity: (loading || success) ? 0.8 : 1
            }}
          >
            {loading ? "Authenticating..." : success ? "Access Granted" : (
              <>
                <span>Access Control Panel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Return to Home link */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            to="/"
            style={{
              color: "#64748B",
              fontSize: ".8rem",
              textDecoration: "none",
              transition: "color .2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#94A3B8"}
            onMouseOut={(e) => e.currentTarget.style.color = "#64748B"}
          >
            ← Return to Finn4sure Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
