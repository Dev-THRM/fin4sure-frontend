import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../pages/styles/stepper.css";

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Kolkata", "Chennai", "Hyderabad",
  "Pune", "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna",
  "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
  "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
  "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai",
  "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
  "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota"
].sort();

export default function PartnerStepper({ onBack }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Stepper state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  
  // OTP logic
  const [otpSent, setOtpSent] = useState(false);
  const [dummyOtp, setDummyOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Password logic
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordCriteria = [
    { test: (pw) => pw.length >= 8, message: "At least 8 characters" },
    { test: (pw) => /[A-Z]/.test(pw), message: "At least 1 uppercase letter" },
    { test: (pw) => /[0-9]/.test(pw), message: "At least 1 number" },
    { test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw), message: "At least 1 special character" },
  ];

  const validatePassword = (pw) =>
    passwordCriteria.map((c) => ({
      message: c.message,
      valid: c.test(pw),
    }));

  const isPasswordStrong = () => validatePassword(password).every((c) => c.valid);

  // Send WhatsApp dummy OTP
  const handleSendOtp = () => {
    if (mobileNumber.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setDummyOtp(randomOtp);
    setOtpSent(true);
    
    // Log to console as requested
    console.log(`\n==========================================`);
    console.log(`🔑 [DEBUG] DUMMY OTP FOR ${mobileNumber}: ${randomOtp} 🔑`);
    console.log(`==========================================\n`);

    // Go to verify step
    setStep(2);
  };

  // Verify WhatsApp dummy OTP
  const handleVerifyOtp = () => {
    if (enteredOtp.length !== 4) {
      setError("OTP must be 4 digits");
      return;
    }
    if (enteredOtp === dummyOtp) {
      setOtpVerified(true);
      setError("");
      // Advance to Password step
      setTimeout(() => {
        setStep(3);
      }, 600);
    } else {
      setError("Invalid OTP code. Please check your browser console log.");
    }
  };

  // Register & Auto-login
  const handleRegister = async () => {
    if (!isPasswordStrong()) {
      setError("Please enter a strong password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Map single 'city' input to default address components to satisfy backend constraints
      const payload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        number: mobileNumber,
        password: password.trim(),
        role: "partner", // maps to role_id = 2 on backend
        dob: "1990-01-01",
        address: city,
        city: city,
        state: "India",
        district: city,
        pincode: "000000"
      };

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register partner");

      if (data.success && data.user) {
        login(data.user);
        setStep(4);
        setTimeout(() => {
          navigate("/broker-dashboard");
        }, 1500);
      } else {
        throw new Error("Registration succeeded, but auto-login is not supported");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", width: "100%", animation: "fadeUp 0.35s ease" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <button className="btn-back" onClick={onBack} style={{ marginRight: "16px" }}>← Back</button>
        <div className="mode-badge partner" style={{ margin: 0 }}>🤝 Partner Onboarding</div>
      </div>

      <div className="form-card">
        {/* Step Progress Bar */}
        <div className="steps-bar">
          <div className="step-item">
            <div className={`step-circle partner-step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>1</div>
            <div className={`step-label partner-step ${step >= 1 ? "active" : ""}`}>Details</div>
          </div>
          <div className="step-connector">
            <div className="fill" style={{ width: step > 1 ? "100%" : "0%" }}></div>
          </div>

          <div className="step-item">
            <div className={`step-circle partner-step ${step >= 2 ? "active" : ""} ${step > 2 ? "done" : ""}`}>2</div>
            <div className={`step-label partner-step ${step >= 2 ? "active" : ""}`}>Verify</div>
          </div>
          <div className="step-connector">
            <div className="fill" style={{ width: step > 2 ? "100%" : "0%" }}></div>
          </div>

          <div className="step-item">
            <div className={`step-circle partner-step ${step >= 3 ? "active" : ""} ${step > 3 ? "done" : ""}`}>3</div>
            <div className={`step-label partner-step ${step >= 3 ? "active" : ""}`}>Password</div>
          </div>
        </div>

        {error && (
          <div className="login-loan-banner" style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B", padding: "10px", borderRadius: "8px", fontSize: ".76rem", marginBottom: "16px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div>
            <div className="form-title">Partner Registration</div>
            <div className="form-subtitle">Fill in your basic registration details to get started</div>

            <div className="form-grid">
              <div className="field">
                <label>Full Name</label>
                <div className="input-wrap">
                  <span className="icon">👤</span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>City</label>
                <div className="input-wrap" style={{ padding: "0 10px" }}>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".88rem", fontWeight: 600, color: "var(--navy)" }}
                  >
                    <option value="">Select City</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>WhatsApp Number</label>
                <div className="input-wrap">
                  <span className="icon">📱</span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <span className="icon">📧</span>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              disabled={!fullName || !city || mobileNumber.length !== 10 || !email}
              onClick={handleSendOtp}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", marginTop: "8px" }}
            >
              Send WhatsApp OTP →
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div>
            <div className="form-title">WhatsApp Verification</div>
            <div className="form-subtitle">Verify your WhatsApp mobile number {mobileNumber}</div>

            <div style={{ padding: "16px", background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ color: "#065F46", fontSize: ".76rem", fontWeight: 700, marginBottom: "8px" }}>
                🔑 Dummy OTP is printed in browser console!
              </div>

              <div className="field">
                <label>Enter 4-Digit OTP</label>
                <div className="input-wrap">
                  <span className="icon">🔑</span>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    maxLength={4}
                    value={enteredOtp}
                    disabled={otpVerified}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleVerifyOtp}
                disabled={otpVerified || enteredOtp.length !== 4}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", background: otpVerified ? "#059669" : "var(--navy)", border: "none", color: "#fff", marginTop: "10px" }}
              >
                {otpVerified ? "✓ Verified" : "Verify OTP"}
              </button>
            </div>

            {!otpVerified && (
              <div style={{ textAlign: "center" }}>
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Password Creation */}
        {step === 3 && (
          <div>
            <div className="form-title">Create Password</div>
            <div className="form-subtitle">Choose a secure password for your partner account</div>

            <div className="form-grid">
              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: ".76rem", fontWeight: 700 }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {password && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                    {validatePassword(password).map((rule, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: ".62rem",
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

              <div className="field">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <span className="icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: ".76rem", fontWeight: 700 }}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {confirmPassword && (
                  <div style={{ fontSize: ".74rem", marginTop: "6px", color: password === confirmPassword ? "green" : "red", fontWeight: 700 }}>
                    {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn-primary"
              disabled={loading || !isPasswordStrong() || password !== confirmPassword}
              onClick={handleRegister}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", marginTop: "12px" }}
            >
              {loading ? "Registering..." : "Submit & Register Partner"}
            </button>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
            <div className="form-title">Registration Successful!</div>
            <div className="form-subtitle">
              Your partner account is active. Redirecting to your dashboard...
            </div>
            <div style={{ marginTop: "24px" }} className="bl-redirect-note">
              Loading dashboard...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
