import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/login.css";

const API_BASE = "/api/auth";

// Helper to redirect based on role
function roleRedirect(userPayload, navigate, redirectTarget) {
  const role = userPayload.role;
  if (role === "admin") { navigate("/admin-dashboard"); return; }
  if (role === "broker" || role === "partner") { navigate("/broker-dashboard"); return; }
  if (redirectTarget) {
    const draftStr = sessionStorage.getItem("pendingLoanApp");
    const draftState = draftStr ? JSON.parse(draftStr) : {};
    navigate(redirectTarget, { state: { ...draftState, step: 3 } });
  } else {
    navigate("/client-dashboard");
  }
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  // ── Tab state: "borrower" | "partner"
  const [activeTab, setActiveTab] = useState("borrower");

  // ── Login mode: "password" | "otp"
  const [loginMode, setLoginMode] = useState("password");

  // ── Password login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ── OTP login state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpStep, setOtpStep] = useState("email"); // "email" | "verify"
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSending, setOtpSending] = useState(false);

  // ── Forgot Password state
  const [forgotStep, setForgotStep] = useState("email"); // "email" | "verify" | "reset"
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Shared state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setError("");
    setOtpStep("email");
    setForgotStep("email");
    setOtp(["", "", "", ""]);
    setOtpTimer(0);
    setNewPassword("");
    setConfirmPassword("");
  };

  // ── PASSWORD LOGIN ──────────────────────────────────────────────────────────
  async function handlePasswordSubmit(e) {
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword, expectedRole: activeTab }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Too many login attempts. Please wait 1 minute and try again.");
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed (${res.status})`);
      }
      const data = await res.json();
      if (data.accessToken || data.token) {
        localStorage.setItem("accessToken", data.accessToken || data.token);
      }
      const userPayload = data.user || data;
      if (cleanEmail.includes("admin") || userPayload.role === "admin") userPayload.role = "admin";
      login(userPayload);
      roleRedirect(userPayload, navigate, redirectTarget);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP STEP 1: SEND OTP ───────────────────────────────────────────────────
  async function handleSendOTP(e) {
    e.preventDefault();
    if (otpSending) return;
    const cleanEmail = otpEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setOtpSending(true);
    try {
      const res = await fetch(`${API_BASE}/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, purpose: 'login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");
      setOtpStep("verify");
      setOtpTimer(60);
      setOtp(["", "", "", ""]);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setOtpSending(false);
    }
  }

  // ── OTP INPUT HANDLING ─────────────────────────────────────────────────────
  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      otpRefs[3].current?.focus();
      e.preventDefault();
    }
  }

  // ── OTP STEP 2: VERIFY + LOGIN ─────────────────────────────────────────────
  async function handleOTPLogin(e) {
    e.preventDefault();
    if (loading) return;
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/otp-login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim().toLowerCase(), otp: otpCode, expectedRole: activeTab }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed.");
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      const userPayload = data.user || data;
      login(userPayload);
      roleRedirect(userPayload, navigate, redirectTarget);
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    if (otpTimer > 0 || otpSending) return;
    setOtp(["", "", "", ""]);
    setError("");
    setOtpSending(true);
    try {
      const res = await fetch(`${API_BASE}/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim().toLowerCase(), purpose: 'login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP.");
      setOtpTimer(60);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpSending(false);
    }
  }

  return (
    <div className="login-page-wrap">
      <div className="login-page-content animate-fade-up">
        <div className="login-form-card">

          {/* Redirect banner */}
          {redirectTarget && (
            <div style={{ marginBottom: "20px", padding: "12px 16px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", color: "#1E40AF", fontSize: ".85rem", textAlign: "center", fontWeight: 600 }}>
              🔒 Please sign in to review and submit your loan application.
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

          {/* Role Tabs */}
          <div className="login-tabs">
            <button className={`login-tab ${activeTab === "borrower" ? "active" : ""}`} onClick={() => handleTabChange("borrower")}>
              🏠 Borrower
            </button>
            <button className={`login-tab ${activeTab === "partner" ? "active" : ""}`} onClick={() => handleTabChange("partner")}>
              🤝 Partner
            </button>
          </div>

          {/* Login Mode Toggle */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <button
              onClick={() => switchMode("password")}
              style={{
                flex: 1, padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer",
                fontSize: ".8rem", fontWeight: 600, transition: "all .2s",
                background: loginMode === "password" ? "var(--navy)" : "#f1f5f9",
                color: loginMode === "password" ? "#fff" : "var(--slate)",
              }}
            >
              🔒 Password
            </button>
            <button
              onClick={() => switchMode("otp")}
              style={{
                flex: 1, padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer",
                fontSize: ".8rem", fontWeight: 600, transition: "all .2s",
                background: loginMode === "otp" ? "var(--teal)" : "#f1f5f9",
                color: loginMode === "otp" ? "#fff" : "var(--slate)",
              }}
            >
              ✉️ Email OTP
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", color: "#DC2626", fontSize: ".83rem" }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── PASSWORD LOGIN FORM ── */}
          {loginMode === "password" && (
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="input-wrap">
                <span className="icon">📧</span>
                <input
                  id="login-email"
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
                  id="login-password"
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
                {loading ? "Signing In…" : activeTab === "borrower" ? "Sign In" : "Sign In to Partner Portal"}
              </button>

              <div style={{ textAlign: "right", marginTop: "-4px" }}>
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  style={{ background: "none", border: "none", color: "var(--teal)", fontSize: ".78rem", cursor: "pointer", padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: "8px", fontSize: ".8rem", color: "var(--text2)" }}>
                {activeTab === "borrower" ? (
                  <>Don't have an account?{" "}<Link to="/?view=borrower" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>Register here</Link></>
                ) : (
                  <>New partner?{" "}<Link to="/?view=partner" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>Apply here</Link></>
                )}
              </div>
            </form>
          )}

          {/* ── OTP LOGIN FORM ── */}
          {loginMode === "otp" && (
            <>
              {/* STEP 1: Enter email */}
              {otpStep === "email" && (
                <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: ".83rem", color: "var(--text2)", lineHeight: 1.6 }}>
                    We'll send a <strong>4-digit OTP</strong> to your registered email address. No password needed.
                  </p>
                  <div className="input-wrap">
                    <span className="icon">📧</span>
                    <input
                      id="otp-email-input"
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                    />
                  </div>
                  <button
                    id="send-otp-btn"
                    type="submit"
                    disabled={otpSending}
                    className="btn-primary"
                    style={{ height: "44px", marginTop: "4px" }}
                  >
                    {otpSending ? "Sending OTP…" : "Send OTP to Email →"}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter OTP */}
              {otpStep === "verify" && (
                <form onSubmit={handleOTPLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 4px", fontSize: ".83rem", color: "var(--text2)" }}>
                      OTP sent to <strong style={{ color: "var(--navy)" }}>{otpEmail}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setOtpStep("email"); setError(""); setOtp(["", "", "", ""]); }}
                      style={{ background: "none", border: "none", color: "var(--teal)", fontSize: ".75rem", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Change email
                    </button>
                  </div>

                  {/* 4-box OTP input */}
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }} onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-box-${i}`}
                        ref={otpRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        style={{
                          width: "58px", height: "64px", textAlign: "center",
                          fontSize: "1.8rem", fontWeight: 700, fontFamily: "monospace",
                          border: `2px solid ${digit ? "var(--teal)" : "#C8DCF5"}`,
                          borderRadius: "12px", background: digit ? "#f0fdf4" : "#F0F7FF",
                          color: "var(--navy)", outline: "none", transition: "border-color .2s, background .2s",
                          caretColor: "transparent",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    id="verify-otp-btn"
                    type="submit"
                    disabled={loading || otp.join("").length !== 4}
                    className="btn-primary"
                    style={{ height: "44px" }}
                  >
                    {loading ? "Verifying…" : "Verify & Sign In"}
                  </button>

                  {/* Resend */}
                  <div style={{ textAlign: "center", fontSize: ".78rem", color: "var(--text2)" }}>
                    {otpTimer > 0 ? (
                      <>Resend OTP in <strong style={{ color: "var(--navy)" }}>{otpTimer}s</strong></>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpSending}
                        style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontSize: ".78rem" }}
                      >
                        {otpSending ? "Sending…" : "Resend OTP"}
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div style={{ textAlign: "center", marginTop: "16px", fontSize: ".8rem", color: "var(--text2)" }}>
                {activeTab === "borrower" ? (
                  <>Don't have an account?{" "}<Link to="/?view=borrower" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>Register here</Link></>
                ) : (
                  <>New partner?{" "}<Link to="/?view=partner" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>Apply here</Link></>
                )}
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {loginMode === "forgot" && (
            <>
              {forgotStep === "email" && (
                <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: ".83rem", color: "var(--text2)", lineHeight: 1.6 }}>
                    Enter your registered email address and we'll send you an OTP to reset your password.
                  </p>
                  <div className="input-wrap">
                    <span className="icon">📧</span>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={otpSending} className="btn-primary" style={{ height: "44px", marginTop: "4px" }}>
                    {otpSending ? "Sending OTP…" : "Send Reset OTP →"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: "8px" }}>
                    <button type="button" onClick={() => switchMode("password")} style={{ background: "none", border: "none", color: "var(--teal)", fontSize: ".8rem", cursor: "pointer", textDecoration: "underline" }}>
                      Back to Login
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === "verify" && (
                <form onSubmit={(e) => { e.preventDefault(); if (otp.join("").length === 4) setForgotStep("reset"); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 4px", fontSize: ".83rem", color: "var(--text2)" }}>
                      OTP sent to <strong style={{ color: "var(--navy)" }}>{otpEmail}</strong>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }} onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        style={{
                          width: "58px", height: "64px", textAlign: "center", fontSize: "1.8rem", fontWeight: 700, fontFamily: "monospace",
                          border: `2px solid ${digit ? "var(--teal)" : "#C8DCF5"}`, borderRadius: "12px", background: digit ? "#f0fdf4" : "#F0F7FF",
                          color: "var(--navy)", outline: "none", transition: "border-color .2s, background .2s",
                        }}
                      />
                    ))}
                  </div>
                  <button type="submit" disabled={otp.join("").length !== 4} className="btn-primary" style={{ height: "44px" }}>
                    Verify OTP →
                  </button>
                </form>
              )}

              {forgotStep === "reset" && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
                  if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
                  setError(""); setLoading(true);
                  try {
                    const res = await fetch(`${API_BASE}/reset-password`, {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: otpEmail, otp: otp.join(""), newPassword })
                    });
                    if (!res.ok) throw new Error((await res.json()).message || "Failed to reset password");
                    switchMode("password"); // Back to normal login
                    setOtpEmail(""); // Reset
                    alert("Password reset successfully! Please log in with your new password.");
                  } catch (err) { setError(err.message); } finally { setLoading(false); }
                }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: ".83rem", color: "var(--text2)", lineHeight: 1.6 }}>
                    Create a new secure password.
                  </p>
                  <div className="input-wrap">
                    <span className="icon">🔒</span>
                    <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="input-wrap">
                    <span className="icon">🔒</span>
                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ height: "44px", marginTop: "4px" }}>
                    {loading ? "Resetting…" : "Reset Password"}
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export { Login };
