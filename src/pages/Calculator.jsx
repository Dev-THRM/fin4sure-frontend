import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEmiCalculator } from "../hooks/useEmiCalculator";
import { useSliderPaint } from "../hooks/useSliderPaint";
import { fmtINR, fmtINRFull, fmtTenure } from "../utils/formatters";
import { LENDERS } from "../utils/loanConstants";
import { calcEMI } from "../utils/emiCalculator";
import "./styles/calculator.css";

export default function Calculator() {
  const location = useLocation();
  const navigate = useNavigate();

  // State for 3-step application flow
  const [stepperStep, setStepperStep] = useState(1);
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [dbLenders, setDbLenders] = useState([]);
  const [loadingLenders, setLoadingLenders] = useState(false);

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
    // Standard default fallback rate
    return 10.40;
  };

  // Combine DB lenders or default fallback list
  const mergedLendersList = useMemo(() => {
    if (dbLenders.length > 0) {
      return dbLenders.map((l) => ({
        id: l.id,
        name: l.name,
        type: l.type || "Private",
        logo: l.logo,
        rate: getLenderRate(l)
      })).sort((a, b) => a.rate - b.rate);
    }
    return LENDERS.map((l, idx) => ({
      id: idx + 1,
      name: l.name,
      type: l.type || "Private",
      logo: null,
      rate: getLenderRate(l)
    })).sort((a, b) => a.rate - b.rate);
  }, [dbLenders, loanType, rateType]);

  // Toggle lender selection
  const toggleLenderSelection = (lenderId) => {
    setSelectedLenders((prev) =>
      prev.includes(lenderId) ? prev.filter((id) => id !== lenderId) : [...prev, lenderId]
    );
  };

  const handleNextStep = () => {
    if (stepperStep === 1) {
      setStepperStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/apply", {
        state: { loanType, amount, rate, tenure, selectedLenders }
      });
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
        {stepperStep === 1 ? (
          <>
            {/* Pre-selected Loan Alert Banner */}
            <div className="preselected-alert-banner">
              <span className="pab-sparkle">✦</span>
              <span className="pab-text">
                <strong>{currentTitle} selected</strong> pre-selected based on your choice — change below if needed
              </span>
            </div>

            {/* ═══ CHOOSE YOUR LOAN TYPE ═══ */}
            <div className="calc-section-card">
              <h2 className="calc-section-title">Choose your loan type</h2>

              <div className="calc-type-grid">
                {loanTypeCards.map((c) => {
                  const isSel = loanType === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`calc-type-card ${isSel ? "selected" : ""}`}
                      onClick={() => setLoanType(c.id)}
                    >
                      {isSel && <div className="calc-type-badge">✓</div>}
                      <div className="calc-type-icon">{c.icon}</div>
                      <div className="calc-type-name">{c.name}</div>
                      <div className="calc-type-desc">{c.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══ SET AMOUNT, RATE & TENURE ═══ */}
            <div className="calc-section-card">
              <div className="calc-sub-tag">SET AMOUNT, RATE &amp; TENURE</div>

              <div className="calc-main-split">
                {/* Left Inputs Column */}
                <div className="calc-inputs-left">
                  {/* Loan Amount Range */}
                  <div className="range-field">
                    <div className="rf-header">
                      <label>Loan Amount</label>
                      <div className="rf-input-wrap">
                        <span className="rf-prefix">₹</span>
                        <input
                          type="number"
                          className="rf-input"
                          value={amtInputVal}
                          onChange={handleAmtInputChange}
                          onBlur={clampAmount}
                          step="0.01"
                        />
                        <select
                          className="rf-unit"
                          value={amtUnit}
                          onChange={handleUnitChange}
                        >
                          <option value={100000}>Lakh</option>
                          <option value={10000000}>Crore</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="range"
                      ref={amtRef}
                      min={params.amtMin}
                      max={params.amtMax}
                      value={amount}
                      onChange={(e) => setAmount(snapAmount(e.target.value))}
                      step="any"
                    />
                    <div className="rf-minmax">
                      <span>₹{params.amtMin >= 10000000 ? `${params.amtMin / 10000000} Cr` : `${params.amtMin / 100000} Lakh`}</span>
                      <span>₹{params.amtMax >= 10000000 ? `${params.amtMax / 10000000} Cr` : `${params.amtMax / 100000} Crores`}</span>
                    </div>
                  </div>

                  {/* Expected ROI Range */}
                  <div className="range-field">
                    <div className="rf-header">
                      <label>Expected ROI</label>
                      <div className="rf-input-wrap">
                        <input
                          type="number"
                          className="rf-input"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          onBlur={clampRate}
                          step="0.05"
                        />
                        <span className="rf-suffix">% p.a.</span>
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
                    />
                    <div className="rf-minmax">
                      <span>{params.rateMin}%</span>
                      <span>{params.rateMax}%</span>
                    </div>
                  </div>

                  {/* Loan Tenure Range */}
                  <div className="range-field">
                    <div className="rf-header">
                      <label>Tenure</label>
                      <div className="rf-input-wrap">
                        <input
                          type="number"
                          className="rf-input"
                          value={tenure}
                          onChange={(e) => setTenure(e.target.value)}
                          onBlur={clampTenure}
                        />
                        <span className="rf-suffix">months</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      ref={tenureRef}
                      min={params.tenureMin}
                      max={params.tenureMax}
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      step="12"
                    />
                    <div className="rf-minmax">
                      <span>1 yr</span>
                      <span>30 yr</span>
                    </div>

                    {/* Quick Tenure Year Buttons */}
                    <div className="quick-tenure-row">
                      {quickTenureYears.map((yr) => {
                        const mo = yr * 12;
                        const isSel = tenure === mo;
                        return (
                          <button
                            key={yr}
                            className={`qt-btn ${isSel ? "active" : ""}`}
                            onClick={() => setTenure(mo)}
                          >
                            {yr} yr
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Navy EMI Card */}
                <div className="calc-navy-emi-card">
                  <div className="cne-label">ESTIMATED MONTHLY EMI</div>
                  <div className="cne-emi-val">{fmtINRFull(emi)}</div>

                  <div className="cne-breakdown">
                    <div className="cne-row">
                      <span className="cne-lbl">Principal</span>
                      <span className="cne-val">{fmtINR(amount)}</span>
                    </div>
                    <div className="cne-row">
                      <span className="cne-lbl">Total Interest</span>
                      <span className="cne-val">{fmtINR(totalInterest)}</span>
                    </div>
                    <div className="cne-row highlight">
                      <span className="cne-lbl">Total Payable</span>
                      <span className="cne-val">{fmtINR(totalPayable)}</span>
                    </div>
                  </div>

                  <div className="cne-note">
                    💡 This is an indicative EMI. Actual EMI depends on the lender's approved rate.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
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
        )}
      </div>

      {/* ═══ STICKY BOTTOM ACTION BAR ═══ */}
      <div className="calc-bottom-bar">
        <button
          className="calc-bar-back"
          onClick={() => {
            if (stepperStep === 2) {
              setStepperStep(1);
            } else {
              navigate("/");
            }
          }}
        >
          {stepperStep === 2 ? "← Back to Details" : "← Dashboard"}
        </button>

        <div className="calc-bar-center">
          {stepperStep === 1 ? (
            <>
              <span>EMI</span> <strong>{fmtINRFull(emi)}/mo</strong>
            </>
          ) : (
            <span>
              Selected: <strong>{selectedLenders.length} lenders</strong>
            </span>
          )}
        </div>

        <button className="calc-bar-next" onClick={handleNextStep}>
          {stepperStep === 1 ? "Choose Lenders →" : "Continue to Application →"}
        </button>
      </div>
    </div>
  );
}

export { Calculator };
