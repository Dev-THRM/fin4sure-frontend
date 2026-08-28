import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building,
  Smartphone,
  Mail,
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  Check,
  Handshake
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../../pages/styles/stepper.css";

const DEFAULT_CITIES = [
    "Mumbai", "Delhi", "Bengaluru", "Kolkata", "Chennai", "Hyderabad",
    "Pune", "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur",
    "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna",
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
    "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
    "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai",
    "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
    "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota"
];

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
    const [cityList, setCityList] = useState(DEFAULT_CITIES.slice().sort());
    const [isCityOpen, setIsCityOpen] = useState(false);
    const cityDropdownRef = useRef(null);
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    // Close city dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
                setIsCityOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch dynamic cities from backend DB
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch("/api/locations/all-cities");
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                        const merged = Array.from(new Set([...DEFAULT_CITIES, ...json.data])).sort();
                        setCityList(merged);
                    }
                }
            } catch (err) {
                console.warn("Cities fetch notice:", err.message);
            }
        };
        fetchCities();
    }, []);

    // Save custom city to backend if not already existing
    const saveNewCityIfCustom = async (cityName) => {
        if (!cityName || !cityName.trim()) return;
        const clean = cityName.trim();
        try {
            const res = await fetch("/api/locations/create-city", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: clean })
            });
            if (res.ok) {
                setCityList(prev => Array.from(new Set([...prev, clean])).sort());
            }
        } catch (_) {}
    };

    // --- Email OTP state ---
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [enteredOtp, setEnteredOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);

    // Send real Email OTP via backend
    const handleSendOtp = async () => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (city.trim()) {
            saveNewCityIfCustom(city.trim());
        }
        setError("");
        setOtpSending(true);
        try {
            const res = await fetch("/api/auth/send-email-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send OTP.");
            setStep(2);
            setEnteredOtp("");
        } catch (err) {
            setError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setOtpSending(false);
        }
    };

    // Verify real Email OTP via backend
    const handleVerifyOtp = async () => {
        if (enteredOtp.length < 4) {
            setError("Please enter the 4-digit OTP.");
            return;
        }
        setError("");
        setOtpVerifying(true);
        try {
            const res = await fetch("/api/auth/verify-email-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), otp: enteredOtp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Invalid OTP.");
            setOtpVerified(true);
            setError("");
            setTimeout(() => { setStep(3); }, 600);
        } catch (err) {
            setError(err.message || "OTP verification failed. Please try again.");
        } finally {
            setOtpVerifying(false);
        }
    };

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

            const res = await fetch("/api/auth/signup", {
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
                }, 1200);
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
                <div className="mode-badge partner" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Handshake size={15} /> Partner Onboarding
                </div>
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
                    <div className="login-loan-banner" style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B", padding: "10px 14px", borderRadius: "8px", fontSize: ".76rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{error}</span>
                        {error.toLowerCase().includes("already exists") && (
                            <span>
                                {" "}—{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    style={{ background: "none", border: "none", color: "#1D4ED8", fontWeight: 700, cursor: "pointer", fontSize: ".76rem", textDecoration: "underline", padding: 0 }}
                                >
                                    Sign in instead →
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Step 1: Details */}
                {step === 1 && (
                    <div>
                        <div className="form-title">Partner Registration</div>
                        <div className="form-subtitle">Fill in your basic registration details to get started</div>

                        <div className="form-grid">
                            <div className="field">
                                <label>Full Name <span style={{ color: "#DC2626" }}>*</span></label>
                                <div className="input-wrap">
                                    <span className="icon"><User size={16} /></span>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field" ref={cityDropdownRef} style={{ position: "relative" }}>
                                <label>City <span style={{ color: "#DC2626" }}>*</span></label>
                                <div 
                                    className="input-wrap" 
                                    style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        cursor: "pointer", 
                                        position: "relative",
                                        borderColor: isCityOpen ? "var(--teal, #0f766e)" : undefined,
                                        boxShadow: isCityOpen ? "0 0 0 3px rgba(15, 118, 110, 0.12)" : undefined
                                    }}
                                    onClick={() => setIsCityOpen(true)}
                                >
                                    <span className="icon"><Building size={16} /></span>
                                    <input
                                        type="text"
                                        placeholder="Select or type your city"
                                        value={city}
                                        onChange={(e) => {
                                            setCity(e.target.value);
                                            setIsCityOpen(true);
                                        }}
                                        onFocus={() => setIsCityOpen(true)}
                                        required
                                        autoComplete="off"
                                        style={{ 
                                            border: "none", 
                                            outline: "none", 
                                            background: "transparent", 
                                            width: "100%", 
                                            fontSize: ".88rem", 
                                            fontWeight: 600, 
                                            color: "var(--navy)",
                                            paddingRight: "28px"
                                        }}
                                    />
                                    {city ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCity("");
                                                setIsCityOpen(true);
                                            }}
                                            style={{
                                                position: "absolute",
                                                right: "26px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "#E2E8F0",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "18px",
                                                height: "18px",
                                                fontSize: "10px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                color: "#64748B"
                                            }}
                                            title="Clear city"
                                        >
                                            ✕
                                        </button>
                                    ) : null}
                                    <span 
                                        style={{ 
                                            position: "absolute", 
                                            right: "10px", 
                                            top: "50%", 
                                            transform: `translateY(-50%) rotate(${isCityOpen ? "180deg" : "0deg"})`, 
                                            transition: "transform 0.2s ease",
                                            fontSize: "10px",
                                            color: "#64748B",
                                            pointerEvents: "none"
                                        }}
                                    >
                                        ▼
                                    </span>
                                </div>

                                {/* Custom Dropdown Menu */}
                                {isCityOpen && (
                                    <div 
                                        style={{
                                            position: "absolute",
                                            top: "calc(100% + 4px)",
                                            left: 0,
                                            right: 0,
                                            background: "#FFFFFF",
                                            borderRadius: "12px",
                                            border: "1px solid #E2E8F0",
                                            boxShadow: "0 14px 34px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.08)",
                                            zIndex: 9999,
                                            maxHeight: "230px",
                                            overflowY: "auto",
                                            padding: "6px"
                                        }}
                                    >
                                        {(() => {
                                            const searchLower = (city || "").toLowerCase().trim();
                                            const filtered = cityList.filter(c => c.toLowerCase().includes(searchLower));
                                            const exactMatch = cityList.some(c => c.toLowerCase() === searchLower);

                                            return (
                                                <>
                                                    {searchLower && !exactMatch && (
                                                        <div
                                                            onClick={() => {
                                                                const customName = city.trim();
                                                                saveNewCityIfCustom(customName);
                                                                setIsCityOpen(false);
                                                            }}
                                                            style={{
                                                                padding: "9px 12px",
                                                                borderRadius: "8px",
                                                                background: "#F0FDF4",
                                                                border: "1px dashed #86EFAC",
                                                                color: "#166534",
                                                                fontSize: "0.82rem",
                                                                fontWeight: 700,
                                                                cursor: "pointer",
                                                                marginBottom: "4px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px",
                                                                transition: "all 0.15s ease"
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = "#DCFCE7"}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = "#F0FDF4"}
                                                        >
                                                            <Sparkles size={14} />
                                                            <span>Add custom city: <strong style={{ textDecoration: "underline" }}>"{city.trim()}"</strong></span>
                                                        </div>
                                                    )}

                                                    {filtered.length === 0 && !searchLower && (
                                                        <div style={{ padding: "12px", textAlign: "center", color: "#94A3B8", fontSize: "0.82rem" }}>
                                                            Start typing to search cities...
                                                        </div>
                                                    )}

                                                    {filtered.map((c) => {
                                                        const isSelected = city.toLowerCase().trim() === c.toLowerCase();
                                                        return (
                                                            <div
                                                                key={c}
                                                                onClick={() => {
                                                                    setCity(c);
                                                                    saveNewCityIfCustom(c);
                                                                    setIsCityOpen(false);
                                                                }}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    borderRadius: "8px",
                                                                    fontSize: "0.84rem",
                                                                    fontWeight: isSelected ? 700 : 500,
                                                                    color: isSelected ? "#0F766E" : "#1E293B",
                                                                    background: isSelected ? "#F0FDFA" : "transparent",
                                                                    cursor: "pointer",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "space-between",
                                                                    transition: "background 0.12s ease"
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (!isSelected) e.currentTarget.style.background = "#F8FAFC";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                                                }}
                                                            >
                                                                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                    <MapPin size={13} className="text-slate-400" />
                                                                    {c}
                                                                </span>
                                                                {isSelected && <Check size={14} color="#0F766E" strokeWidth={3} />}
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="field">
                                <label>Mobile Number <span style={{ color: "#DC2626" }}>*</span></label>
                                <div className="input-wrap">
                                    <span className="icon"><Smartphone size={16} /></span>
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
                                <label>Email Address <span style={{ color: "#DC2626" }}>*</span></label>
                                <div className="input-wrap">
                                    <span className="icon"><Mail size={16} /></span>
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
                            disabled={!fullName || !city || mobileNumber.length !== 10 || !email || otpSending}
                            onClick={handleSendOtp}
                            style={{ width: "100%", padding: "14px", borderRadius: "12px", marginTop: "8px", opacity: (!fullName || !city || mobileNumber.length !== 10 || !email || otpSending) ? 0.5 : 1 }}
                        >
                            {otpSending ? "Sending OTP…" : "Send Email OTP →"}
                        </button>
                    </div>
                )}

                {/* Step 2: Email OTP Verification */}
                {step === 2 && (
                    <div>
                        <div className="form-title">Email Verification</div>
                        <div className="form-subtitle">A 4-digit OTP has been sent to <strong>{email}</strong></div>

                        <div style={{ padding: "16px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", marginBottom: "16px", marginTop: "16px" }}>
                            <div style={{ color: "#1E40AF", fontSize: ".76rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Mail size={14} /> Check your inbox for the OTP
                            </div>

                            <div className="field">
                                <label>Enter OTP <span style={{ color: "#DC2626" }}>*</span></label>
                                <div className="input-wrap">
                                    <span className="icon"><Key size={16} /></span>
                                    <input
                                        type="text"
                                        placeholder="Enter 4-digit OTP"
                                        maxLength={4}
                                        value={enteredOtp}
                                        disabled={otpVerified}
                                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleVerifyOtp}
                                disabled={otpVerified || enteredOtp.length < 4 || otpVerifying}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", background: otpVerified ? "#059669" : "var(--navy)", border: "none", color: "#fff", marginTop: "10px", opacity: (otpVerified || enteredOtp.length < 4 || otpVerifying) ? 0.5 : 1 }}
                            >
                                {otpVerified ? "Verified" : otpVerifying ? "Verifying…" : "Verify OTP"}
                            </button>
                        </div>

                        {!otpVerified && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpSending}
                                    style={{ background: "none", border: "none", color: "var(--teal, #0f766e)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: ".76rem" }}
                                >
                                    {otpSending ? "Sending…" : "Resend OTP"}
                                </button>
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
                                <label>Password <span style={{ color: "#DC2626" }}>*</span></label>
                                <div className="input-wrap">
                                    <span className="icon"><Lock size={16} /></span>
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
                                <label>Confirm Password <span style={{ color: "#DC2626" }}>*</span></label>
                                <div className="input-wrap">
                                    <span className="icon"><Lock size={16} /></span>
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
                                        {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
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
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                            <CheckCircle2 size={54} color="#059669" />
                        </div>
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
