import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import validator from "validator";
import "./styles/login.css";

export default function Signup() {
  const navigate = useNavigate();
  const { login, fetchProfile } = useAuth();

  // ---------------- FORM STATES ----------------
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [receivedOtp, setReceivedOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refBy, setRefBy] = useState("self"); // referral default
  const [brokerId, setBrokerId] = useState(""); // if refBy is broker

  // ---------------- UI STATES ----------------
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // form-wide error
  const [validateemail, setvalidateemail] = useState("");
  const [otpError, setOtpError] = useState(""); // OTP-specific error
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ---------------- OTP TIMER ----------------
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const API_BASE = "/api/auth";

  // ---------------- RESEND TIMER LOGIC ----------------
  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  // ---------------- PASSWORD VALIDATION ----------------
  const passwordCriteria = [
    { test: (pw) => pw.length >= 8, message: "At least 8 characters" },
    { test: (pw) => /[A-Z]/.test(pw), message: "At least 1 uppercase letter" },
    { test: (pw) => /[0-9]/.test(pw), message: "At least 1 number" },
    { test: (pw) => /[!@#$%^&*(),.?\":{}|<>]/.test(pw), message: "At least 1 special character" },
    { test: (pw) => /[a-zA-Z]/.test(pw), message: "At least 1 letter" },
  ];

  const validatePassword = (pw) => passwordCriteria.map((c) => ({
    message: c.message,
    valid: c.test(pw),
  }));

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (validator.isEmail(val)) {
      setvalidateemail("Email is valid");
    } else {
      setvalidateemail("Email is invalid");
    }
  };

  const isPasswordStrong = () => validatePassword(password).every((c) => c.valid);

  // ---------------- SEND OTP ----------------
  const sendOTP = async () => {
    if (number.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setError("");
      setLoading(true);
      setOtpError("");

      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setOtpSent(true);
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const verifyOTP = async () => {
    if (receivedOtp.length !== 4 && receivedOtp.length !== 6) {
      setOtpError("OTP must be 4 or 6 digits");
      return;
    }

    try {
      setOtpError("");
      setLoading(true);

      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, otp: receivedOtp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "OTP verification failed");
        return;
      }

      setOtpVerified(true);
    } catch (err) {
      setOtpError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const submitForm = async () => {
    if (!otpVerified) {
      setError("Please verify OTP before signup");
      return;
    }
    if (!isPasswordStrong()) {
      setError("Please enter a strong password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const payload = {
        name: fullName,
        email,
        number,
        password,
        role: "client",
        broker_id: refBy === "self" || !brokerId.trim() ? "self" : brokerId.trim(),
      };

      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Auto-login after successful signup
      login(data);
      await fetchProfile();
      navigate("/client-dashboard");
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrap">
      <div className="login-page-content">
        <div className="login-form-card">
          <h2 style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, color: "var(--navy)", fontSize: "1.45rem", marginBottom: "8px" }}>
            Create Borrower Account
          </h2>
          <p style={{ fontSize: ".78rem", color: "var(--text2)", marginBottom: "22px", lineHeight: "1.4" }}>
            Start your digital loan verification. Verification codes are submitted to your WhatsApp.
          </p>

          {error && (
            <div className="login-loan-banner" style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* FULL NAME */}
            <div className="input-wrap">
              <span className="icon">👤</span>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <div className="input-wrap">
                <span className="icon">📧</span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              {email && (
                <div style={{ fontSize: ".7rem", marginTop: "3px", color: validator.isEmail(email) ? "green" : "red", fontWeight: 700 }}>
                  {validateemail}
                </div>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="input-wrap">
                <span className="icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", fontSize: ".76rem", fontWeight: 700 }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {password && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {validatePassword(password).map((rule, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: ".64rem",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        border: "1px solid",
                        borderColor: rule.valid ? "#A7F3D0" : "#FCA5A5",
                        backgroundColor: rule.valid ? "#ECFDF5" : "#FEF2F2",
                        color: rule.valid ? "#065F46" : "#991B1B",
                      }}
                    >
                      {rule.message}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <div className="input-wrap">
                <span className="icon">🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", fontSize: ".76rem", fontWeight: 700 }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {confirmPassword && (
                <div style={{ fontSize: ".74rem", marginTop: "3px", color: password === confirmPassword ? "green" : "red", fontWeight: 700 }}>
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}
            </div>

            {/* PHONE NUMBER */}
            <div className="input-wrap">
              <span className="icon">📱</span>
              <input
                type="tel"
                placeholder="WhatsApp Number"
                value={number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (!otpVerified && val.length <= 10) setNumber(val);
                }}
                disabled={otpVerified}
                required
              />
            </div>

            {/* REF BY */}
            <div className="input-wrap" style={{ padding: "0 10px" }}>
              <span className="icon">🔗</span>
              <select
                value={refBy}
                onChange={(e) => setRefBy(e.target.value)}
                disabled={otpVerified}
                style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".88rem", fontWeight: 600, color: "var(--navy)" }}
              >
                <option value="self">Applying Directly</option>
                <option value="broker">Applying Through Broker</option>
              </select>
            </div>

            {/* BROKER ID */}
            {refBy === "broker" && (
              <div className="input-wrap animate-fade-up">
                <span className="icon">🆔</span>
                <input
                  type="text"
                  placeholder="Enter Broker ID"
                  value={brokerId}
                  onChange={(e) => setBrokerId(e.target.value)}
                  disabled={otpVerified}
                  required
                />
              </div>
            )}

            {/* SEND OTP TRIGGER */}
            <button
              type="button"
              className="btn-primary"
              onClick={sendOTP}
              disabled={loading || otpSent}
              style={{ height: "44px" }}
            >
              {otpSent ? "OTP Sent Successfully" : "Send WhatsApp OTP"}
            </button>

            {/* OTP VERIFY SECTION */}
            {otpSent && (
              <div className="apply-autofill-banner" style={{ background: "#F0FDF4", borderColor: "#A7F3D0", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".76rem" }}>
                  <span style={{ color: "#065F46", fontWeight: 700 }}>Enter WhatsApp code</span>
                  {!canResend ? (
                    <span style={{ color: "var(--text2)" }}>Resend in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={sendOTP} style={{ background: "none", border: "none", color: "#0F766E", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="input-wrap">
                  <span className="icon">🔑</span>
                  <input
                    type="text"
                    placeholder="Enter OTP (e.g. 123456)"
                    maxLength={6}
                    value={receivedOtp}
                    onChange={(e) => setReceivedOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={otpVerified}
                  />
                </div>

                {otpError && (
                  <div style={{ color: "#B91C1C", fontSize: ".76rem", fontWeight: 700 }}>
                    {otpError}
                  </div>
                )}

                <button
                  type="button"
                  className="btn-primary"
                  onClick={verifyOTP}
                  disabled={loading || otpVerified}
                  style={{ background: otpVerified ? "#059669" : "var(--navy)", height: "38px" }}
                >
                  {otpVerified ? "✓ Verified" : "Verify OTP"}
                </button>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="button"
              className="btn-primary"
              onClick={submitForm}
              disabled={loading || !otpVerified || !isPasswordStrong() || password !== confirmPassword}
              style={{ marginTop: "8px", height: "46px" }}
            >
              Submit &amp; Register Account
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-600 text-center" style={{ marginTop: "20px", fontSize: ".82rem", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--teal2)", fontWeight: 700, textDecoration: "underline" }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export { Signup };
