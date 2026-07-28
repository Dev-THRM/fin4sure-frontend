import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEmiCalculator } from "../hooks/useEmiCalculator";
import { useSliderPaint } from "../hooks/useSliderPaint";
import { fmtINR, fmtINRFull } from "../utils/formatters";
import { LENDERS } from "../utils/loanConstants";
import { calcEMI } from "../utils/emiCalculator";
import "./styles/calculator.css";

export default function Calculator() {
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

  // Sub-tabs & Lender filter/sort states for EMI Calculator Dashboard
  const [subTab, setSubTab] = useState("summary"); // "summary" | "amortization"
  const [lenderFilter, setLenderFilter] = useState("All");
  const [lenderSort, setLenderSort] = useState("rate_asc");

  // Derive initial loan type from location.state
  const initialLoanType = location.state?.loanType || "home";

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
    initialLoanType,
    location.state?.amount,
    location.state?.rate,
    location.state?.tenure
  );

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
    loanPurpose: "Home Purchase / Refinance",
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

  // Quick tenure options (years)
  const quickTenureYears = [5, 10, 15, 20, 25, 30];

  // Loan type cards for row
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

  // Helper to extract interest rate for current loanType from DB lender object or fallback
  const getLenderRate = (lender) => {
    if (lender.loanRates && Array.isArray(lender.loanRates)) {
      const found = lender.loanRates.find(r => r.type && (r.type.short_id === loanType || r.type.name.toLowerCase().includes(loanType)));
      if (found && found.min_rate) return parseFloat(found.min_rate);
    }
    const rk = rateType === "floating" ? "f" : "x";
    if (lender.rates && lender.rates[loanType] && lender.rates[loanType][rk]) {
      return lender.rates[loanType][rk][0];
    }
    return 10.40;
  };

  // Handle rate type toggle with auto-updated expected ROI rate
  const handleRateTypeChange = (type) => {
    setRateType(type);
    if (type === 'floating') {
      setRate(7.20);
    } else {
      setRate(8.80);
    }
  };

  // Combine DB lenders or default fallback list with exact Floating vs Fixed rates
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

  // Calculate year-by-year amortization schedule
  const amortizationSchedule = useMemo(() => {
    const P = amount || 0;
    const r = (rate || 0) / 12 / 100;
    const n = tenure || 0;
    if (!P || !r || !n || !emi) return [];

    let balance = P;
    const schedule = [];
    const totalYears = Math.ceil(n / 12);

    for (let yr = 1; yr <= totalYears; yr++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let m = 1; m <= 12; m++) {
        const monthIndex = (yr - 1) * 12 + m;
        if (monthIndex > n) break;

        const interestForMonth = balance * r;
        let principalForMonth = emi - interestForMonth;
        if (balance < principalForMonth) {
          principalForMonth = balance;
        }
        balance -= principalForMonth;
        yearlyPrincipal += principalForMonth;
        yearlyInterest += interestForMonth;
      }

      schedule.push({
        year: yr,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        totalPayment: Math.round(yearlyPrincipal + yearlyInterest),
        balance: Math.max(0, Math.round(balance))
      });
    }

    return schedule;
  }, [amount, rate, tenure, emi]);

  // Filtered and Sorted Lenders List for Compare Lenders section
  const filteredAndSortedLenders = useMemo(() => {
    let list = [...mergedLendersList];

    if (lenderFilter !== "All") {
      const fl = lenderFilter.toLowerCase();
      list = list.filter(l => (l.type || '').toLowerCase().includes(fl));
    }

    if (lenderSort === "rate_asc") {
      list.sort((a, b) => a.rate - b.rate);
    } else if (lenderSort === "rate_desc") {
      list.sort((a, b) => b.rate - a.rate);
    } else if (lenderSort === "emi_asc") {
      list.sort((a, b) => calcEMI(amount, a.rate, tenure) - calcEMI(amount, b.rate, tenure));
    }

    return list;
  }, [mergedLendersList, lenderFilter, lenderSort, amount, tenure]);

  // Toggle lender selection
  const toggleLenderSelection = (lenderId) => {
    setSelectedLenders((prev) =>
      prev.includes(lenderId) ? prev.filter((id) => id !== lenderId) : [...prev, lenderId]
    );
  };

  // Custom Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState("");
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "partner" || user?.role === "broker";

  // Check if page opened with location.state.step === 3 or from session draft
  useEffect(() => {
    if (location.state?.step === 3) {
      setStepperStep(3);
    }
    if (location.state?.selectedLenders && Array.isArray(location.state.selectedLenders)) {
      setSelectedLenders(location.state.selectedLenders);
    }
  }, [location.state]);

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

      // Transition smoothly to Step 3 (Review & Apply)
      setStepperStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleFinalSubmit();
    }
  };

  // Final Submit Handler: Registers application and returns to Borrower Dashboard
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
          <button className="calc-pill-btn" onClick={() => navigate("/")}>
            ← Dashboard
          </button>
          <button className="calc-pill-btn active" onClick={() => navigate("/apply")}>
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
            {/* ═══ TOP HERO SECTION & RATE TYPE TOGGLE ═══ */}
            <div className="calc-hero-card" style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '14px 20px',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0F2942', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px' }}>
                    ✦ EMI CALCULATOR
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                    Plan your loan with confidence
                  </h2>
                </div>

                {/* Floating | Fixed Toggle */}
                <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '20px', border: '1px solid #CBD5E1' }}>
                  <button
                    type="button"
                    onClick={() => handleRateTypeChange('floating')}
                    style={{
                      padding: '5px 16px',
                      borderRadius: '16px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: rateType === 'floating' ? '#0F2942' : 'transparent',
                      color: rateType === 'floating' ? '#FFFFFF' : '#64748B',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ⚡ Floating
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateTypeChange('fixed')}
                    style={{
                      padding: '5px 16px',
                      borderRadius: '16px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: rateType === 'fixed' ? '#0F2942' : 'transparent',
                      color: rateType === 'fixed' ? '#FFFFFF' : '#64748B',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    — Fixed
                  </button>
                </div>
              </div>

              {/* Disclaimer Alert Box */}
              {rateType === 'floating' ? (
                <div style={{
                  background: '#E0F2FE',
                  border: '1px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#0369A1',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <span>💬</span>
                  <span>Floating rate: Linked to RBI repo rate (6.25%). Currently favourable ROI rates are at multi-year lows.</span>
                </div>
              ) : (
                <div style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#B45309',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <span>💬</span>
                  <span>Fixed rate: Rate stays constant throughout tenure. This loan type is offered on a fixed-rate basis by lenders.</span>
                </div>
              )}

              {/* Live Rate Snapshot Chips Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap', background: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F2942' }}>
                  ⚡ Live {rateType === 'floating' ? 'Floating' : 'Fixed'} Rates:
                </span>
                {filteredAndSortedLenders.slice(0, 4).map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.74rem', fontWeight: 700 }}>
                    <span style={{ color: '#0F2942' }}>{l.name}:</span>
                    <span style={{ color: '#0284C7', fontWeight: 900 }}>{l.rate.toFixed(2)}%</span>
                  </div>
                ))}
                <a href="#compare-lenders-section" style={{ marginLeft: 'auto', fontSize: '0.74rem', fontWeight: 800, color: '#0284C7', textDecoration: 'none' }}>
                  Compare All Lenders Below ↓
                </a>
              </div>
            </div>

            {/* ═══ 2-COLUMN CALCULATOR CONTAINER ═══ */}
            <div className="calc-grid-container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Left Column: LOAN DETAILS */}
              <div className="calc-left-panel" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 22px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#64748B', marginBottom: '14px' }}>
                  LOAN DETAILS
                </div>

                {/* 1. Loan Amount */}
                <div className="range-field" style={{ marginBottom: '14px' }}>
                  <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F2942' }}>Loan Amount</label>
                    <div className="rf-input-wrap" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '2px 8px' }}>
                      <span className="rf-prefix" style={{ fontWeight: 700, color: '#0F2942', fontSize: '0.85rem' }}>₹</span>
                      <input
                        type="number"
                        className="rf-input"
                        value={amtInputVal}
                        onChange={handleAmtInputChange}
                        onBlur={clampAmount}
                        step="0.01"
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.88rem', color: '#0F2942', width: '70px', textAlign: 'right' }}
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

                  {/* Preset Amount Buttons */}
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
                            padding: '3px 10px',
                            borderRadius: '14px',
                            border: isSel ? '1px solid #0284C7' : '1px solid #E2E8F0',
                            background: isSel ? '#E0F2FE' : '#F8FAFC',
                            color: isSel ? '#0369A1' : '#475569',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
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
                  <div className="rf-minmax" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94A3B8', marginTop: '4px' }}>
                    <span>₹10 L</span>
                    <span>₹50 Cr</span>
                  </div>
                </div>

                {/* 2. Expected Rate (% p.a.) */}
                <div className="range-field" style={{ marginBottom: '14px' }}>
                  <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F2942' }}>Expected Rate (% p.a.)</label>
                    <div className="rf-input-wrap" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '2px 8px' }}>
                      <input
                        type="number"
                        className="rf-input"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        onBlur={clampRate}
                        step="0.05"
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.88rem', color: '#0F2942', width: '50px', textAlign: 'right' }}
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
                  <div className="rf-minmax" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94A3B8', marginTop: '4px' }}>
                    <span>{params.rateMin}%</span>
                    <span>{params.rateMax}%</span>
                  </div>
                </div>

                {/* 3. Loan Tenure */}
                <div className="range-field">
                  <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F2942' }}>Loan Tenure</label>
                    <div className="rf-input-wrap" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '2px 8px' }}>
                      <input
                        type="number"
                        className="rf-input"
                        value={tenure}
                        onChange={(e) => setTenure(e.target.value)}
                        onBlur={clampTenure}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.88rem', color: '#0F2942', width: '50px', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Months</span>
                    </div>
                  </div>

                  {/* Preset Tenure Buttons */}
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
                            padding: '3px 10px',
                            borderRadius: '14px',
                            border: isSel ? '1px solid #0284C7' : '1px solid #E2E8F0',
                            background: isSel ? '#E0F2FE' : '#F8FAFC',
                            color: isSel ? '#0369A1' : '#475569',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
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
                  <div className="rf-minmax" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94A3B8', marginTop: '4px' }}>
                    <span>1 yr</span>
                    <span>30 yrs</span>
                  </div>
                </div>
              </div>

              {/* Right Column: YOUR MONTHLY EMI Card (Dark Slate Blue Card) */}
              <div style={{
                background: 'linear-gradient(145deg, #0B192C 0%, #1E293B 100%)',
                borderRadius: '16px',
                padding: '18px 22px',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 4px 12px rgba(11,25,44,0.12)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', color: '#94A3B8', textAlign: 'center', marginBottom: '4px' }}>
                    YOUR MONTHLY EMI
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'center', color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                    {fmtINRFull(emi)}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginLeft: '4px' }}>/mo</span>
                  </div>

                  {/* Compact Doughnut Chart */}
                  <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="transparent" />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#F59E0B"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${(100 - (totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50)) / 100 * (2 * Math.PI * 48)} ${2 * Math.PI * 48}`}
                        strokeDashoffset={0}
                        style={{ transition: 'stroke-dasharray 0.4s ease' }}
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#38BDF8"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${(totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50) / 100 * (2 * Math.PI * 48)} ${2 * Math.PI * 48}`}
                        strokeDashoffset={-((100 - (totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50)) / 100 * (2 * Math.PI * 48))}
                        style={{ transition: 'stroke-dasharray 0.4s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38BDF8', lineHeight: 1 }}>{totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50}%</div>
                      <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', marginTop: '2px' }}>PRINCIPAL</div>
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.76rem', fontWeight: 700, marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
                      <span style={{ color: '#E2E8F0' }}>Principal</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                      <span style={{ color: '#E2E8F0' }}>Interest</span>
                    </div>
                  </div>
                </div>

                {/* Inner Summary Boxes */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>{fmtLakhCr(amount)}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>PRINCIPAL</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F59E0B' }}>{fmtLakhCr(totalInterest)}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>TOTAL INTEREST</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8' }}>TOTAL AMOUNT PAYABLE</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#38BDF8' }}>{fmtLakhCr(totalPayable)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div id="compare-lenders-section" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800, marginBottom: '6px' }}>
                    ⚡ LIVE {rateType === 'floating' ? 'FLOATING' : 'FIXED'} RATES
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 800, color: '#0F2942', margin: '0 0 4px 0' }}>
                    Compare Lenders ({rateType === 'floating' ? 'Floating' : 'Fixed'} Rates)
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                    Live rates from 10+ lenders curated for your profile
                  </p>
                </div>

                {/* Filter Pills & Sort Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '6px', background: '#F8FAFC', padding: '4px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    {["All", "PSU", "Private", "NBFC/HFC", "SFB"].map((fl) => (
                      <button
                        key={fl}
                        type="button"
                        onClick={() => setLenderFilter(fl)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: lenderFilter === fl ? '#0F2942' : 'transparent',
                          color: lenderFilter === fl ? '#FFFFFF' : '#64748B',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {fl}
                      </button>
                    ))}
                  </div>

                  <select
                    value={lenderSort}
                    onChange={(e) => setLenderSort(e.target.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0F2942',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="rate_asc">Lowest Rate ▾</option>
                    <option value="rate_desc">Highest Rate ▾</option>
                    <option value="emi_asc">Lowest EMI ▾</option>
                  </select>
                </div>
              </div>

              {filteredAndSortedLenders.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                      🏛️
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F2942' }}>{filteredAndSortedLenders[0].name}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', background: '#DBEAFE', color: '#1E40AF', fontSize: '0.7rem', fontWeight: 700 }}>
                          {filteredAndSortedLenders[0].type || 'PRIVATE'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                        🏷️ {filteredAndSortedLenders[0].offer || "Pre-approved offers available."}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F2942' }}>{filteredAndSortedLenders[0].rate.toFixed(2)}%</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{filteredAndSortedLenders[0].rate.toFixed(2)}–{filteredAndSortedLenders[0].maxRate.toFixed(2)}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284C7' }}>
                        {fmtINRFull(calcEMI(amount, filteredAndSortedLenders[0].rate, tenure))}<span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/mo</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Est. EMI</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLenders([filteredAndSortedLenders[0].id]);
                        setStepperStep(2);
                      }}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '10px',
                        background: '#0F2942',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(15,41,66,0.2)'
                      }}
                    >
                      Apply →
                    </button>
                  </div>
                </div>
              )}

              {/* Lenders Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#0F2942', color: '#FFFFFF', textAlign: 'left' }}>
                      <th style={{ padding: '14px 20px', borderRadius: '10px 0 0 0', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.05em' }}>LENDER</th>
                      <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.05em' }}>EXPECTED ROI ({rateType === 'floating' ? 'FLOATING' : 'FIXED'})</th>
                      <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.05em' }}>EST. EMI</th>
                      <th style={{ padding: '14px 20px', borderRadius: '0 10px 0 0', textAlign: 'right', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.05em' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedLenders.map((lender) => {
                      const lEmi = calcEMI(amount, lender.rate, tenure);
                      return (
                        <tr key={lender.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                🏛️
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: '#0F2942' }}>{lender.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '6px' }}>
                                    {lender.type || 'PRIVATE'}
                                  </span>
                                  {lender.offer && (
                                    <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 600 }}>
                                      🏷️ {lender.offer}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#0F2942', fontSize: '0.95rem' }}>{lender.rate.toFixed(2)}%</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{lender.rate.toFixed(2)}–{lender.maxRate.toFixed(2)}</div>
                          </td>

                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.95rem' }}>{fmtINRFull(lEmi)}<span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>/mo</span></div>
                          </td>

                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLenders([lender.id]);
                                setStepperStep(2);
                              }}
                              style={{
                                padding: '8px 18px',
                                borderRadius: '8px',
                                background: '#0F2942',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Apply →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ═══ SUB-TABS: SCHEDULE SUMMARY | AMORTIZATION SCHEDULE ═══ */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '24px 32px', marginBottom: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setSubTab('summary')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: subTab === 'summary' ? '1px solid #0284C7' : '1px solid #E2E8F0',
                    background: subTab === 'summary' ? '#E0F2FE' : '#F8FAFC',
                    color: subTab === 'summary' ? '#0369A1' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📊 Schedule Summary
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab('amortization')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: subTab === 'amortization' ? '1px solid #0284C7' : '1px solid #E2E8F0',
                    background: subTab === 'amortization' ? '#E0F2FE' : '#F8FAFC',
                    color: subTab === 'amortization' ? '#0369A1' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📅 Amortization Schedule
                </button>
              </div>

              {subTab === 'summary' ? (
                <div>
                  {/* 4 Stat Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F2942' }}>{fmtINRFull(emi)}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>MONTHLY EMI</div>
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F2942' }}>{fmtLakhCr(amount)}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>PRINCIPAL</div>
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>{fmtLakhCr(totalInterest)}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>TOTAL INTEREST</div>
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7' }}>{fmtLakhCr(totalPayable)}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>TOTAL PAYABLE</div>
                    </div>
                  </div>

                  {/* Summary Explanatory Banner */}
                  <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '14px 20px', color: '#0369A1', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: 500 }}>
                    Over <strong>{Math.round(tenure / 12)} yrs</strong>, you'll pay <strong>{fmtLakhCr(totalInterest)}</strong> in interest — about <strong>{100 - (totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50)}%</strong> of your total outlay. Choosing lower expected ROI or shorter tenure reduces this. Final ROI will be confirmed post credit assessment of the case.
                  </div>
                </div>
              ) : (
                /* Amortization Table */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>YEAR</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>PRINCIPAL PAID</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>INTEREST PAID</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>TOTAL PAYMENT</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>REMAINING BALANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.map((row) => (
                        <tr key={row.year} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2942' }}>Year {row.year}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0369A1' }}>₹{row.principalPaid.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#D97706' }}>₹{row.interestPaid.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2942' }}>₹{row.totalPayment.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748B' }}>₹{row.balance.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

              {/* Smart Tip Box 1 */}
              <div className="smart-tip-box green">
                <span className="stb-icon">💡</span>
                <span>
                  <strong>Smart tip:</strong> Selecting 2–3 lenders is the sweet spot — they compete for your case, you get better rates. More than 5 can affect your credit score.
                </span>
              </div>

              {/* Smart Tip Box 2 */}
              <div className="smart-tip-box blue">
                <span className="stb-icon">💡</span>
                <span>
                  <strong>Smart tip:</strong> Applying to 3–4 lenders lets them compete for the lowest rate.
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

              <div className="csg-lenders-row">
                <span className="lbl">Selected Lenders ({selectedLenders.length}):</span>
                <div className="csg-lender-chips">
                  {mergedLendersList
                    .filter((l) => selectedLenders.includes(l.id))
                    .map((l) => (
                      <span key={l.id} className="csg-chip">
                        🏛️ {l.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Primary Applicant Details Form Card */}
            <div className="calc-section-card">
              <h3 className="calc-card-h3">Applicant Credentials</h3>

              <div className="calc-form-grid">
                <div className="calc-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={applicantData.name}
                    onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                    placeholder="Full name as per PAN"
                  />
                </div>

                <div className="calc-field">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    maxLength="10"
                    value={applicantData.mob_no}
                    onChange={(e) => setApplicantData({ ...applicantData, mob_no: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
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
                <div className="calc-submit-err">
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
            if (stepperStep === 3) {
              setStepperStep(2);
            } else if (stepperStep === 2) {
              setStepperStep(1);
            } else {
              navigate("/");
            }
          }}
        >
          {stepperStep === 3 ? "← Back to Lenders" : stepperStep === 2 ? "← Back to Details" : "← Dashboard"}
        </button>

        <div className="calc-bar-center">
          {stepperStep === 1 ? (
            <>
              <span>EMI</span> <strong>{fmtINRFull(emi)}/mo</strong>
            </>
          ) : stepperStep === 2 ? (
            <span>
              Selected: <strong>{selectedLenders.length} lenders</strong>
            </span>
          ) : (
            <span>
              Ready to submit: <strong>{currentTitle}</strong>
            </span>
          )}
        </div>

        <button
          className="calc-bar-next"
          disabled={submitting || (stepperStep === 2 && selectedLenders.length === 0)}
          onClick={handleNextStep}
        >
          {submitting ? "Submitting Application..." : stepperStep === 1 ? "Choose Lenders →" : stepperStep === 2 ? "Review Your Application →" : "Submit & Go to Dashboard →"}
        </button>
      </div>

      {/* ═══ CUSTOM MODAL POPUP ═══ */}
      {showAdminModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowAdminModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cmc-icon-badge">
              ⚠️
            </div>
            <h3 className="cmc-title">
              {isAdmin ? "Borrower Account Required" : "Selection Required"}
            </h3>
            <p className="cmc-message">
              {modalMessage}
            </p>

            <div className="cmc-actions">
              {isAdmin ? (
                <>
                  <button
                    className="cmc-btn-primary"
                    onClick={() => {
                      setShowAdminModal(false);
                      navigate("/login");
                    }}
                  >
                    Sign In as Borrower →
                  </button>
                  <button
                    className="cmc-btn-secondary"
                    onClick={() => setShowAdminModal(false)}
                  >
                    Dismiss
                  </button>
                </>
              ) : (
                <button
                  className="cmc-btn-primary"
                  onClick={() => setShowAdminModal(false)}
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ APPLICATION SUCCESS MODAL POPUP ═══ */}
      {showSuccessModal && (
        <div className="custom-modal-backdrop" onClick={() => navigate("/client-dashboard")}>
          <div className="custom-modal-card success-card" onClick={(e) => e.stopPropagation()}>
            <div className="cmc-icon-badge success">
              🎉
            </div>
            <h3 className="cmc-title">Application Submitted!</h3>
            <p className="cmc-message">
              Your <strong>{currentTitle}</strong> application for <strong>{fmtINR(amount)}</strong> has been registered with {selectedLenders.length > 0 ? selectedLenders.length : 2} selected lenders!
            </p>

            <div className="cmc-app-id-badge">
              Application Ref: #{submittedAppId || "APP-10002"}
            </div>

            <div className="cmc-actions">
              <button
                className="cmc-btn-success"
                onClick={async () => {
                  setShowSuccessModal(false);
                  if (fetchProfile) {
                    await fetchProfile();
                  }
                  navigate("/client-dashboard");
                }}
              >
                Go to Borrower Dashboard →
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
    </div>
  );
}

export { Calculator };
