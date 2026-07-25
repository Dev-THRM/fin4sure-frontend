import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEmiCalculator } from "../hooks/useEmiCalculator";
import { useSliderPaint } from "../hooks/useSliderPaint";
import { fmtINR, fmtINRFull, fmtTenure } from "../utils/formatters";
import { LENDERS } from "../utils/loanConstants";
import { calcEMI } from "../utils/emiCalculator";
import { EmiDonut } from "../components/emi/EmiDonut";
import "./styles/calculator.css";

export default function Calculator() {
  const location = useLocation();
  const navigate = useNavigate();

  // State for 3-step application flow
  const [stepperStep, setStepperStep] = useState(1);
  const lenderSectionRef = useRef(null);

  // Derive initial loan type from location.state
  const initialLoanType = location.state?.loanType || "home";
  const initialProductName = location.state?.selectedProduct || "Home Loan";

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
    principalPercentage,
    interestPercentage,
    amortizationSchedule,
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

  // Local state for Lender filters
  const [lenderFilter, setLenderFilter] = useState("all");
  const [lenderSort, setLenderSort] = useState("rate");

  // Filter and sort lenders dynamically
  const filteredLenders = useMemo(() => {
    const rk = rateType === "floating" ? "f" : "x";
    let list = LENDERS.filter(
      (l) =>
        !l._hidden &&
        l.rates[loanType]?.[rk] &&
        l.rates[loanType][rk][0] !== null
    );

    if (lenderFilter !== "all") {
      list = list.filter((l) => l.type === lenderFilter);
    }

    if (lenderSort === "rate") {
      list.sort((a, b) => {
        const rateA = a.rates[loanType][rk][0];
        const rateB = b.rates[loanType][rk][0];
        return rateA - rateB;
      });
    } else {
      list.sort((a, b) => {
        const emiA = calcEMI(amount, a.rates[loanType][rk][0], tenure);
        const emiB = calcEMI(amount, b.rates[loanType][rk][0], tenure);
        return emiA - emiB;
      });
    }

    return list;
  }, [loanType, rateType, lenderFilter, lenderSort, amount, tenure]);

  const bestRate = useMemo(() => {
    if (filteredLenders.length === 0) return 0;
    const rk = rateType === "floating" ? "f" : "x";
    return Math.min(...filteredLenders.map((l) => l.rates[loanType][rk][0]));
  }, [filteredLenders, loanType, rateType]);

  const handleChooseLenders = () => {
    setStepperStep(2);
    if (lenderSectionRef.current) {
      lenderSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleApplyLender = (lenderName) => {
    navigate("/apply", {
      state: { loanType, amount, rate, tenure, lender: lenderName }
    });
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

        {/* ═══ COMPARE LENDERS LIST ═══ */}
        <div className="calc-section-card" ref={lenderSectionRef}>
          <div className="lender-section-header">
            <div>
              <h3>Compare &amp; Select Lenders</h3>
              <div className="lender-sub">
                Live rates from 30+ lenders for {currentTitle}
              </div>
            </div>

            <div className="emi-controls-row">
              <div className="lender-filters">
                <button
                  className={`lf-btn ${lenderFilter === "all" ? "active" : ""}`}
                  onClick={() => setLenderFilter("all")}
                >
                  All
                </button>
                <button
                  className={`lf-btn ${lenderFilter === "psu" ? "active" : ""}`}
                  onClick={() => setLenderFilter("psu")}
                >
                  PSU
                </button>
                <button
                  className={`lf-btn ${lenderFilter === "private" ? "active" : ""}`}
                  onClick={() => setLenderFilter("private")}
                >
                  Private
                </button>
                <button
                  className={`lf-btn ${lenderFilter === "nbfc" ? "active" : ""}`}
                  onClick={() => setLenderFilter("nbfc")}
                >
                  NBFC
                </button>
              </div>

              <select
                className="lender-sort-select"
                value={lenderSort}
                onChange={(e) => setLenderSort(e.target.value)}
              >
                <option value="rate">↓ Lowest Rate</option>
                <option value="emi">↓ Lowest EMI</option>
              </select>
            </div>
          </div>

          <div className="lender-grid">
            {filteredLenders.length > 0 ? (
              filteredLenders.map((l) => {
                const rk = rateType === "floating" ? "f" : "x";
                const ratesArr = l.rates[loanType][rk];
                const estEmi = calcEMI(amount, ratesArr[0], tenure);
                const isBest = ratesArr[0] === bestRate;

                return (
                  <div key={l.name} className={`lc-row ${isBest ? "lc-best" : ""}`}>
                    <div className="lcr-lender">
                      <div
                        className="lcr-icon"
                        style={{
                          backgroundColor: `${l.color}1a`,
                          color: l.color
                        }}
                      >
                        {l.emoji}
                      </div>
                      <div className="lcr-info">
                        <div className="lcr-name">
                          {l.name}
                          {isBest && <span className="lcr-best-tag">★ Best</span>}
                        </div>
                        <div className="lcr-badge">{l.type.toUpperCase()} Bank</div>
                      </div>
                    </div>

                    <div className="lcr-rate">
                      <span className="lcr-rate-v">{ratesArr[0].toFixed(2)}%</span>
                      <span className="lcr-rate-r">p.a. onwards</span>
                    </div>

                    <div className="lcr-emi">
                      {fmtINRFull(estEmi)}
                      <span className="lcr-emi-l">/mo</span>
                    </div>

                    <div className="lcr-act">
                      <button
                        className="lcr-btn"
                        onClick={() => handleApplyLender(l.name)}
                      >
                        Apply →
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                No lenders found matching this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ STICKY BOTTOM ACTION BAR ═══ */}
      <div className="calc-bottom-bar">
        <button className="calc-bar-back" onClick={() => navigate("/")}>
          ← Dashboard
        </button>

        <div className="calc-bar-center">
          <span>EMI</span> <strong>{fmtINRFull(emi)}/mo</strong>
        </div>

        <button className="calc-bar-next" onClick={handleChooseLenders}>
          Choose Lenders →
        </button>
      </div>
    </div>
  );
}

export { Calculator };
