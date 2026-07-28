import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEmiCalculator } from "../hooks/useEmiCalculator";
import { useSliderPaint } from "../hooks/useSliderPaint";
import { fmtINR, fmtINRFull } from "../utils/formatters";
import { calcEMI } from "../utils/emiCalculator";
import "./styles/calculator.css";
import "./styles/apply.css";

export default function Apply() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, fetchProfile } = useAuth();

  // State for 3-step application flow (1: Details, 2: Choose Lenders, 3: Review & Apply)
  const [stepperStep, setStepperStep] = useState(1);
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [dbLenders, setDbLenders] = useState([]);
  const [loadingLenders, setLoadingLenders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Modals state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState("");
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "partner" || user?.role === "broker";

  // Determine initial loan type from location.state or URL query params
  const resolveLoanType = (input) => {
    if (!input) return "home";
    const map = {
      home: "home",
      "Home Loan": "home",
      lap: "lap",
      "Loan Against Property": "lap",
      personal: "personal",
      "Personal Loan": "personal",
      business: "business",
      "Business Loan": "business",
      vehicle: "vehicle",
      "Vehicle Loan": "vehicle",
      education: "education",
      "Education Loan": "education"
    };
    return map[input] || "home";
  };

  const initialType = resolveLoanType(location.state?.loanType || location.state?.selectedProduct);

  const {
    loanType,
    amount,
    rate,
    tenure,
    rateType,
    params,
    emi,
    totalPayable,
    totalInterest,
    setLoanType,
    setAmount,
    setRate,
    setTenure,
    setRateType,
    clampAmount,
    clampRate,
    clampTenure,
    snapAmount
  } = useEmiCalculator(
    initialType,
    location.state?.amount,
    location.state?.rate,
    location.state?.tenure
  );

  // Default values dictionary per loan type
  const loanDefaultsMap = {
    home: { amount: 5000000, rate: 7.10, tenure: 240 },
    lap: { amount: 5000000, rate: 9.00, tenure: 180 },
    personal: { amount: 500000, rate: 10.50, tenure: 60 },
    business: { amount: 1000000, rate: 11.00, tenure: 60 },
    vehicle: { amount: 1000000, rate: 8.75, tenure: 84 },
    education: { amount: 1000000, rate: 9.00, tenure: 84 }
  };

  // Helper to select loan type & set pre-filled default values
  const handleSelectLoanType = (typeKey) => {
    setLoanType(typeKey);
    const defaults = loanDefaultsMap[typeKey] || loanDefaultsMap.home;
    if (!location.state?.amount) setAmount(defaults.amount);
    if (!location.state?.rate) setRate(defaults.rate);
    if (!location.state?.tenure) setTenure(defaults.tenure);
  };

  // Synchronize on route changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paramProduct = searchParams.get("product") || searchParams.get("type");
    const rawPassed = location.state?.loanType || location.state?.selectedProduct || paramProduct;
    if (rawPassed) {
      const resolved = resolveLoanType(rawPassed);
      handleSelectLoanType(resolved);
    }
  }, [location.search, location.state]);

  // Applicant details state for Step 3
  const [applicantData, setApplicantData] = useState({
    name: user?.name || "",
    mob_no: user?.number || "",
    email: user?.email || "",
    dob: "1995-05-15",
    gender: "male",
    address: "123 Green Avenue",
    pincode: "110001",
    state: "Delhi",
    district: "Central",
    city: "New Delhi",
    loanPurpose: "Loan Application",
    password: "Pass@1234"
  });

  // Sync applicant fields when user loads
  useEffect(() => {
    if (user) {
      setApplicantData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        mob_no: user.number || prev.mob_no
      }));
    }
  }, [user]);

  // Fetch real lenders from DB endpoint `/api/lenders`
  useEffect(() => {
    const fetchLenders = async () => {
      try {
        setLoadingLenders(true);
        const res = await fetch("/api/lenders");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbLenders(json.data);
        }
      } catch (err) {
        console.error("Error fetching live lenders from DB:", err);
      } finally {
        setLoadingLenders(false);
      }
    };
    fetchLenders();
  }, []);

  // Title map for alert banner
  const typeTitleMap = {
    home: "Home Loan",
    lap: "Loan Against Property",
    personal: "Personal Loan",
    business: "Business Loan",
    vehicle: "Vehicle Loan",
    education: "Education Loan"
  };

  const currentTitle = typeTitleMap[loanType] || "Home Loan";

  // Local state for Amount text inputs
  const [amtInputVal, setAmtInputVal] = useState("50");
  const [amtUnit, setAmtUnit] = useState(100000); // Lakhs vs Crores

  // Synchronize numeric input formatting
  useEffect(() => {
    if (amount >= 10000000) {
      setAmtUnit(10000000);
      setAmtInputVal((amount / 10000000).toFixed(2));
    } else {
      setAmtUnit(100000);
      setAmtInputVal((amount / 100000).toFixed(2));
    }
  }, [amount]);

  // Hook refs to paint range slider backgrounds dynamically
  const amtRef = useSliderPaint(amount, params.amtMin, params.amtMax);
  const rateRef = useSliderPaint(rate, params.rateMin, params.rateMax);
  const tenureRef = useSliderPaint(tenure, params.tenureMin, params.tenureMax);

  // Amount input handlers
  const handleAmtInputChange = (e) => {
    const rawVal = e.target.value;
    setAmtInputVal(rawVal);
    const parsed = parseFloat(rawVal) || 0;
    setAmount(parsed * amtUnit);
  };

  const handleUnitChange = (e) => {
    const newUnit = parseInt(e.target.value);
    setAmtUnit(newUnit);
    const parsed = parseFloat(amtInputVal) || 0;
    setAmount(parsed * newUnit);
  };

  // Loan type cards for category row
  const loanTypeCards = [
    {
      id: "home",
      name: "Home Loan",
      icon: "🏠",
      desc: "Buy or build your dream home"
    },
    {
      id: "lap",
      name: "Loan Against Property",
      icon: "🏢",
      desc: "Unlock your property's value"
    },
    {
      id: "personal",
      name: "Personal Loan",
      icon: "💳",
      desc: "For any personal need"
    },
    {
      id: "business",
      name: "Business Loan",
      icon: "💼",
      desc: "Grow your business"
    },
    {
      id: "vehicle",
      name: "Vehicle Loan",
      icon: "🚗",
      desc: "Car, bike or commercial"
    }
  ];

  // Combine DB lenders or default fallback list
  const mergedLendersList = useMemo(() => {
    if (dbLenders.length > 0) {
      return dbLenders.map((l) => {
        let minR = rateType === 'floating' ? (l.flowLow || l.min_rate || 7.20) : (l.fixLow || l.min_rate || 8.80);
        let maxR = rateType === 'floating' ? (l.flowHigh || l.max_rate || 9.80) : (l.fixHigh || l.max_rate || 11.50);
        return {
          id: l.id,
          name: l.name,
          type: l.type || "Private",
          logo: l.logo || null,
          rate: parseFloat(minR),
          maxRate: parseFloat(maxR),
          offer: l.offer || "Pre-approved offers available."
        };
      }).sort((a, b) => a.rate - b.rate);
    }

    const defaultLenders = rateType === "floating" ? [
      { id: 1, name: "HDFC Bank", type: "Private", offer: "Pre-approved offers for existing HDFC customers.", rate: 7.20, maxRate: 9.80 },
      { id: 2, name: "Bajaj Finserv", type: "NBFC/HFC", offer: "Pre-approved personal loans up to ₹40L for eligible customers.", rate: 7.25, maxRate: 10.50 },
      { id: 3, name: "Axis Bank", type: "Private", offer: "Special concession on processing fee.", rate: 7.30, maxRate: 10.00 },
      { id: 4, name: "Kotak Mahindra", type: "Private", offer: "Instant digital in-principle sanction.", rate: 7.40, maxRate: 9.75 },
      { id: 5, name: "Yes Bank", type: "Private", offer: "Pre-approved digital offer.", rate: 7.45, maxRate: 10.10 },
      { id: 6, name: "PNB Housing", type: "NBFC/HFC", offer: "Custom tenure & low EMI options.", rate: 7.50, maxRate: 13.45 },
      { id: 7, name: "LIC Housing", type: "NBFC/HFC", offer: "Griha Lakshmi: Special rate concession for women borrowers.", rate: 7.50, maxRate: 10.35 }
    ] : [
      { id: 1, name: "HDFC Bank", type: "Private", offer: "Pre-approved offers for existing HDFC customers.", rate: 8.80, maxRate: 11.50 },
      { id: 3, name: "Axis Bank", type: "Private", offer: "Special concession on processing fee.", rate: 9.00, maxRate: 11.70 },
      { id: 4, name: "Kotak Mahindra", type: "Private", offer: "Instant digital in-principle sanction.", rate: 9.00, maxRate: 11.50 },
      { id: 2, name: "Bajaj Finserv", type: "NBFC/HFC", offer: "Pre-approved personal loans up to ₹40L for eligible customers.", rate: 9.00, maxRate: 12.00 },
      { id: 6, name: "PNB Housing", type: "NBFC/HFC", offer: "Custom tenure & low EMI options.", rate: 9.00, maxRate: 14.00 },
      { id: 5, name: "Yes Bank", type: "Private", offer: "Pre-approved digital offer.", rate: 9.10, maxRate: 11.80 },
      { id: 8, name: "IndusInd Bank", type: "Private", offer: "Special rates for premium banking customers.", rate: 9.15, maxRate: 11.90 }
    ];

    return defaultLenders;
  }, [dbLenders, rateType]);

  // Format Lakhs/Crores for summary cards
  const fmtLakhCr = (val) => {
    const num = Number(val) || 0;
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Toggle lender selection
  const toggleLenderSelection = (lenderId) => {
    setSelectedLenders((prev) =>
      prev.includes(lenderId) ? prev.filter((id) => id !== lenderId) : [...prev, lenderId]
    );
  };

  const handleNextStep = () => {
    if (isAdmin) {
      setModalMessage("Admin and Partner accounts cannot apply for loans. Only borrower accounts can submit applications.");
      setShowAdminModal(true);
      return;
    }

    if (stepperStep === 1) {
      setStepperStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (stepperStep === 2) {
      if (selectedLenders.length === 0) {
        setModalMessage("Please select at least 1 lender to review your application.");
        setShowAdminModal(true);
        return;
      }
      setStepperStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleFinalSubmit();
    }
  };

  // Final Submit Handler: Registers application and redirects to Borrower Dashboard
  const handleFinalSubmit = async () => {
    if (!user || !user.email) {
      sessionStorage.setItem("pendingLoanApp", JSON.stringify({
        loanType,
        amount,
        tenure,
        selectedLenders,
        applicantData
      }));
      setShowLoginRequiredModal(true);
      return;
    }

    if (isAdmin) {
      setModalMessage("Admin and Partner accounts cannot submit loan applications. Only borrower accounts can apply.");
      setShowAdminModal(true);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const targetLenders = selectedLenders.length > 0 ? selectedLenders : [1, 2];

    try {
      const res = await axios.post("/api/client/apply-loan", {
        product: loanType,
        loanAmount: amount,
        tenure: tenure,
        selectedLenders: targetLenders,
        loan_purpose: applicantData.loanPurpose || `${currentTitle} Application`
      }, { withCredentials: true });

      if (res && res.data) {
        setSubmittedAppId(res.data.applicationId || "APP-" + Date.now().toString().slice(-5));
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Submission error:", err);
      if (err.response?.status === 429) {
        setSubmitError("Rate limit reached: Please wait 30 seconds before clicking submit again.");
      } else {
        const errMsg = err.response?.data?.message || "Failed to submit application. Please check details and try again.";
        setSubmitError(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="calc-full-page animate-fade-up">
      {/* ═══ TOP BLUE/PURPLE GRADIENT HERO ═══ */}
      <div className="calc-header-gradient">
        <div className="calc-nav-top">
          <button className="calc-pill-btn" onClick={() => navigate("/client-dashboard")}>
            ← Dashboard
          </button>
          <button className="calc-pill-btn active" onClick={() => setStepperStep(1)}>
            + New Loan Application
          </button>
        </div>

        <h1 className="calc-hero-title">Let's find your perfect loan</h1>
        <p className="calc-hero-sub">
          Choose your loan type, set the amount &amp; tenure — then pick lenders and apply in minutes.
        </p>

        {/* 3-Step Progress Indicator */}
        <div className="calc-stepper-bar">
          <div className={`cs-step ${stepperStep >= 1 ? "active" : ""}`}>
            <div className="cs-circle">1</div>
            <span className="cs-label">Loan Type &amp; Details</span>
          </div>
          <div className={`cs-line ${stepperStep >= 2 ? "active" : ""}`}></div>
          <div className={`cs-step ${stepperStep >= 2 ? "active" : ""}`}>
            <div className="cs-circle">2</div>
            <span className="cs-label">Choose Lenders</span>
          </div>
          <div className={`cs-line ${stepperStep >= 3 ? "active" : ""}`}></div>
          <div className={`cs-step ${stepperStep >= 3 ? "active" : ""}`}>
            <div className="cs-circle">3</div>
            <span className="cs-label">Review &amp; Apply</span>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT BODY ═══ */}
      <div className="calc-body-wrap">
        {isAdmin && (
          <div style={{ marginBottom: "24px", padding: "14px 20px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", color: "#991B1B", fontSize: ".88rem", fontWeight: 700, textAlign: "center" }}>
            ⚠️ Admin &amp; Partner accounts cannot submit loan applications. Please sign out and log in with a Borrower account to apply.
          </div>
        )}

        {stepperStep === 1 ? (
          <>
            {/* Alert banner showing pre-selected loan type */}
            <div className="preselected-alert-banner">
              <span className="pab-sparkle">✨</span>
              <span className="pab-text">
                <strong>{currentTitle} selected</strong> pre-selected based on your choice — change below if needed
              </span>
            </div>

            {/* Loan Type Category Selector */}
            <div className="calc-category-section">
              <h2 className="calc-section-title">Choose your loan type</h2>
              <div className="calc-type-grid">
                {loanTypeCards.map((card) => {
                  const isSel = loanType === card.id;
                  return (
                    <div
                      key={card.id}
                      className={`calc-type-card ${isSel ? "selected" : ""}`}
                      onClick={() => handleSelectLoanType(card.id)}
                    >
                      {isSel && <div className="calc-type-badge">✓</div>}
                      <div className="calc-type-icon">{card.icon}</div>
                      <div className="calc-type-name">{card.name}</div>
                      <div className="calc-type-desc">{card.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══ SET AMOUNT, RATE & TENURE SECTION ═══ */}
            <div className="calc-category-section" style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#64748B', marginBottom: '14px' }}>
                SET AMOUNT, RATE &amp; TENURE
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
                {/* LEFT COLUMN: Range Sliders & Controls */}
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  
                  {/* 1. Loan Amount */}
                  <div className="range-field" style={{ marginBottom: '20px' }}>
                    <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F2942' }}>Loan Amount</label>
                      <div className="rf-input-wrap" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '4px 8px' }}>
                        <span className="rf-prefix" style={{ fontWeight: 700, color: '#0F2942', fontSize: '0.85rem' }}>₹</span>
                        <input
                          type="number"
                          className="rf-input"
                          value={amtInputVal}
                          onChange={handleAmtInputChange}
                          onBlur={clampAmount}
                          step="0.01"
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.9rem', color: '#0F2942', width: '70px', textAlign: 'right' }}
                        />
                        <select
                          className="rf-unit"
                          value={amtUnit}
                          onChange={handleUnitChange}
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}
                        >
                          <option value={100000}>Lakh ▾</option>
                          <option value={10000000}>Crore ▾</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {[1000000, 2500000, 5000000, 10000000, 25000000].map((presetAmt) => {
                        const isSel = amount === presetAmt;
                        const label = presetAmt >= 10000000 ? `₹${(presetAmt / 10000000).toFixed(2)} Cr` : `₹${(presetAmt / 100000).toFixed(2)} L`;
                        return (
                          <button
                            key={presetAmt}
                            type="button"
                            onClick={() => setAmount(presetAmt)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '14px',
                              border: isSel ? '1px solid #0284C7' : '1px solid #E2E8F0',
                              background: isSel ? '#E0F2FE' : '#F8FAFC',
                              color: isSel ? '#0369A1' : '#475569',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="range"
                      ref={amtRef}
                      min={params.amtMin}
                      max={params.amtMax}
                      value={amount}
                      onChange={(e) => setAmount(snapAmount(e.target.value))}
                      step="any"
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  {/* 2. Expected Rate (% p.a.) */}
                  <div className="range-field" style={{ marginBottom: '20px' }}>
                    <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F2942' }}>Expected ROI</label>
                      <div className="rf-input-wrap" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '4px 8px' }}>
                        <input
                          type="number"
                          className="rf-input"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          onBlur={clampRate}
                          step="0.05"
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.9rem', color: '#0F2942', width: '50px', textAlign: 'right' }}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>% p.a.</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      ref={rateRef}
                      min={params.rateMin}
                      max={params.rateMax}
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      step="0.1"
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  {/* 3. Loan Tenure */}
                  <div className="range-field">
                    <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F2942' }}>Tenure</label>
                      <div className="rf-input-wrap" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '4px 8px' }}>
                        <input
                          type="number"
                          className="rf-input"
                          value={tenure}
                          onChange={(e) => setTenure(e.target.value)}
                          onBlur={clampTenure}
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.9rem', color: '#0F2942', width: '50px', textAlign: 'right' }}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>months</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {[5, 10, 15, 20, 25, 30].map((yr) => {
                        const mo = yr * 12;
                        const isSel = tenure === mo;
                        return (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setTenure(mo)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '14px',
                              border: isSel ? '1px solid #0284C7' : '1px solid #E2E8F0',
                              background: isSel ? '#E0F2FE' : '#F8FAFC',
                              color: isSel ? '#0369A1' : '#475569',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {yr} yr
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="range"
                      ref={tenureRef}
                      min={params.tenureMin}
                      max={params.tenureMax}
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      step="12"
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: ESTIMATED MONTHLY EMI Card */}
                <div style={{
                  background: 'linear-gradient(145deg, #0F2942 0%, #1E3A8A 100%)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 24px rgba(15,41,66,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#94A3B8', marginBottom: '6px' }}>
                      ESTIMATED MONTHLY EMI
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                      {fmtINRFull(emi)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#94A3B8', fontWeight: 600 }}>Principal</span>
                      <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{fmtLakhCr(amount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#94A3B8', fontWeight: 600 }}>Total Interest</span>
                      <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{fmtLakhCr(totalInterest)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '8px' }}>
                      <span style={{ color: '#38BDF8', fontWeight: 700 }}>Total Payable</span>
                      <span style={{ fontWeight: 900, color: '#38BDF8' }}>{fmtLakhCr(totalPayable)}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.75rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                    💡 <strong>This is an indicative EMI.</strong> Actual EMI depends on the lender's approved rate.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : stepperStep === 2 ? (
          /* ═══ STEP 2: CHOOSE LENDERS ═══ */
          <div className="calc-step2-wrap animate-fade-up">
            <div className="calc-step2-header">
              <h2 className="calc-step2-title">Available Lenders</h2>
              <p className="calc-step2-sub">
                Sorted by best Expected ROI — EMI shown is for your selected amount &amp; tenure.
              </p>

              <div className="smart-tip-box green">
                <span className="stb-icon">💡</span>
                <span>
                  <strong>Smart tip:</strong> Selecting 2–3 lenders is the sweet spot — they compete for your case, you get better rates. More than 5 can affect your credit score.
                </span>
              </div>
            </div>

            {/* Live Lenders Cards List */}
            <div className="calc-lenders-list">
              {loadingLenders ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                  Loading real lenders from database...
                </div>
              ) : (
                mergedLendersList.map((lender, idx) => {
                  const isSel = selectedLenders.includes(lender.id);
                  const lEmi = calcEMI(amount, lender.rate, tenure);
                  const isBest = idx === 0;

                  return (
                    <div
                      key={lender.id}
                      className={`calc-lender-card ${isSel ? "selected" : ""}`}
                      onClick={() => toggleLenderSelection(lender.id)}
                    >
                      <div className="clc-left">
                        <div className={`clc-checkbox ${isSel ? "checked" : ""}`}>
                          {isSel ? "✓" : ""}
                        </div>

                        <div className="clc-icon">
                          {lender.logo ? (
                            <img src={lender.logo} alt={lender.name} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                          ) : (
                            "🏛️"
                          )}
                        </div>

                        <div className="clc-info">
                          <div className="clc-name-row">
                            <span className="clc-name">{lender.name}</span>
                            {isBest && <span className="clc-best-badge">★ Best Rate</span>}
                          </div>
                          <div className="clc-sub-row">
                            <span>{lender.type ? String(lender.type).toUpperCase() : "PRIVATE"}</span>
                            <span className="clc-bullet">·</span>
                            <span className="clc-pf">PF applicable*</span>
                            <span className="clc-bullet">·</span>
                            <span className="clc-offer">🎁 Offer</span>
                          </div>
                        </div>
                      </div>

                      <div className="clc-right">
                        <div className="clc-rate">{lender.rate.toFixed(2)}%</div>
                        <div className="clc-emi">EMI {fmtINRFull(lEmi)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ═══ STEP 3: REVIEW & APPLY ═══ */
          <div className="calc-step3-wrap animate-fade-up">
            <div className="calc-step2-header">
              <h2 className="calc-step2-title">Review &amp; Submit Application</h2>
              <p className="calc-step2-sub">
                Review your loan configuration and applicant information before final submission.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="calc-section-card" style={{ marginBottom: '24px' }}>
              <h3 className="calc-card-h3">Application Summary</h3>

              <div className="calc-summary-grid">
                <div className="csg-item">
                  <span className="lbl">Loan Type</span>
                  <span className="val">{currentTitle}</span>
                </div>
                <div className="csg-item">
                  <span className="lbl">Loan Amount</span>
                  <span className="val">{fmtINR(amount)}</span>
                </div>
                <div className="csg-item">
                  <span className="lbl">Tenure</span>
                  <span className="val">{tenure} months ({Math.round(tenure / 12)} yrs)</span>
                </div>
                <div className="csg-item">
                  <span className="lbl">Est. Monthly EMI</span>
                  <span className="val highlight">{fmtINRFull(emi)}</span>
                </div>
              </div>
            </div>

            {/* Primary Applicant Details Form */}
            <div className="calc-section-card">
              <h3 className="calc-card-h3">Primary Applicant Information</h3>

              <div className="calc-form-grid">
                <div className="calc-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={applicantData.name}
                    onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                    placeholder="Full legal name"
                  />
                </div>

                <div className="calc-field">
                  <label>Mobile Number *</label>
                  <input
                    type="text"
                    value={applicantData.mob_no}
                    onChange={(e) => setApplicantData({ ...applicantData, mob_no: e.target.value })}
                    placeholder="10-digit mobile"
                  />
                </div>

                <div className="calc-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={applicantData.email}
                    onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>

                <div className="calc-field">
                  <label>Loan Purpose *</label>
                  <input
                    type="text"
                    value={applicantData.loanPurpose}
                    onChange={(e) => setApplicantData({ ...applicantData, loanPurpose: e.target.value })}
                    placeholder="e.g. Home Renovation, Business"
                  />
                </div>
              </div>

              {submitError && (
                <div className="calc-submit-err" style={{ marginTop: '16px' }}>
                  ⚠️ {submitError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ STICKY BOTTOM ACTION BAR ═══ */}
      <div className="calc-bottom-bar">
        <button
          className="calc-bar-back"
          onClick={() => {
            if (stepperStep > 1) setStepperStep(stepperStep - 1);
            else navigate("/client-dashboard");
          }}
        >
          ← Dashboard
        </button>

        <div className="calc-bar-center">
          <span className="cbc-lbl">EMI</span>
          <span className="cbc-val">{fmtINRFull(emi)}<small>/mo</small></span>
        </div>

        <button className="calc-bar-next" onClick={handleNextStep} disabled={submitting}>
          {submitting
            ? "Submitting Application..."
            : stepperStep === 1
            ? "Choose Lenders →"
            : stepperStep === 2
            ? "Review & Apply →"
            : "Submit Loan Application →"}
        </button>
      </div>

      {/* ═══ CUSTOM ADMIN MODAL POPUP ═══ */}
      {showAdminModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowAdminModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '32px', textAlign: 'center' }}>
            <div className="cmc-icon-badge" style={{ background: '#FEF2F2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px auto', color: '#DC2626' }}>
              ⚠️
            </div>
            <h3 className="cmc-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F2942', marginBottom: '10px' }}>
              Action Restricted
            </h3>
            <p className="cmc-message" style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '24px' }}>
              {modalMessage || "Admin and Partner accounts cannot submit loan applications. Only borrower accounts can apply."}
            </p>

            <div className="cmc-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="cmc-btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2,132,199,0.25)'
                }}
                onClick={() => setShowAdminModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CUSTOM LOGIN REQUIRED MODAL POPUP ═══ */}
      {showLoginRequiredModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowLoginRequiredModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '32px', textAlign: 'center' }}>
            <div className="cmc-icon-badge" style={{ background: '#EFF6FF', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px auto', color: '#2563EB' }}>
              🔒
            </div>
            <h3 className="cmc-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F2942', marginBottom: '10px' }}>
              Borrower Account Required
            </h3>
            <p className="cmc-message" style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '24px' }}>
              Please log in or register a borrower account to complete your loan application and track progress on your dashboard.
            </p>

            <div className="cmc-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="cmc-btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2,132,199,0.25)'
                }}
                onClick={() => {
                  setShowLoginRequiredModal(false);
                  navigate("/login", { state: { redirectTarget: "/apply" } });
                }}
              >
                Log In / Register Borrower Account →
              </button>
              <button
                className="cmc-btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
                onClick={() => setShowLoginRequiredModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CUSTOM SUCCESS MODAL POPUP ═══ */}
      {showSuccessModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card" style={{ maxWidth: '460px', padding: '36px 32px', textAlign: 'center' }}>
            <div className="cmc-icon-badge" style={{ background: '#ECFDF5', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px auto', color: '#059669' }}>
              🎉
            </div>
            <h3 className="cmc-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2942', marginBottom: '8px' }}>
              Application Submitted!
            </h3>
            <p className="cmc-message" style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '16px' }}>
              Your application <strong>({submittedAppId})</strong> for <strong>{currentTitle}</strong> has been submitted successfully to {selectedLenders.length || 2} lenders.
            </p>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', fontSize: '0.85rem', color: '#0369A1', fontWeight: 600, marginBottom: '24px' }}>
              You can now track live approval stages &amp; upload documents directly from your borrower dashboard.
            </div>

            <button
              className="cmc-btn-primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '10px',
                background: '#059669',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
              }}
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/client-dashboard");
              }}
            >
              Go to Borrower Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
