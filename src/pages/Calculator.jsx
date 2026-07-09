import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEmiCalculator } from "../hooks/useEmiCalculator";
import { useSliderPaint } from "../hooks/useSliderPaint";
import { fmtINR, fmtINRFull, fmtTenure } from "../utils/formatters";
import { LENDERS, LOAN_PARAMS } from "../utils/loanConstants";
import { calcEMI } from "../utils/emiCalculator";
import { EmiDonut } from "../components/emi/EmiDonut"; // We will create this subcomponent next
import "./styles/calculator.css";

export default function Calculator() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize hook with parameters passed from Home page state (if any)
  const {
    loanType,
    amount,
    rate,
    tenure,
    rateType,
    params,
    amountStep,
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
    location.state?.loanType || "home",
    location.state?.amount,
    location.state?.rate,
    location.state?.tenure
  );

  // Local state for Amount text inputs to handle formatting safely
  const [amtInputVal, setAmtInputVal] = useState("30");
  const [amtUnit, setAmtUnit] = useState(100000); // Lakhs vs Crores

  // Local state for Schedule tab selection (summary or amort)
  const [activeTab, setActiveTab] = useState("summary");

  // Local state for Lender filters
  const [lenderFilter, setLenderFilter] = useState("all");
  const [lenderSort, setLenderSort] = useState("rate");

  // Synchronize numeric input formatting with range slider amount changes
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

  // Amount inputs handlers
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

  // Quick pick helpers for Amount and Tenure
  const quickAmountOptions = useMemo(() => {
    const isPersonal = loanType === "personal";
    const opts = isPersonal
      ? [500000, 1000000, 1500000, 2000000, 2500000]
      : [1000000, 2500000, 5000000, 10000000, 25000000];
    return opts.filter((v) => v >= params.amtMin && v <= params.amtMax).slice(0, 5);
  }, [loanType, params]);

  const quickTenureOptions = useMemo(() => {
    const opts = [60, 120, 180, 240, 300, 360];
    return opts.filter((v) => v >= params.tenureMin && v <= params.tenureMax).slice(0, 5);
  }, [params]);

  // Filter and sort lenders dynamically
  const filteredLenders = useMemo(() => {
    const rk = rateType === "floating" ? "f" : "x";
    
    // Filter out lenders without rates for this specific loan type/rate type combination
    let list = LENDERS.filter(
      (l) =>
        !l._hidden &&
        l.rates[loanType]?.[rk] &&
        l.rates[loanType][rk][0] !== null
    );

    // Apply category filters
    if (lenderFilter !== "all") {
      list = list.filter((l) => l.type === lenderFilter);
    }

    // Determine sorting logic
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

  const typeLabels = {
    psu: "PSU",
    private: "Private",
    nbfc: "NBFC",
    small: "SFB"
  };

  const handleApplyLender = (lenderName) => {
    navigate("/apply", {
      state: { loanType, amount, rate, tenure, lender: lenderName }
    });
  };

  return (
    <div className="emi-page-content animate-fade-up">
      {/* ═══ HERO STRIP ═══ */}
      <div className="emi-hero">
        <div className="emi-hero-text">
          <div className="emi-hero-tag">✦ EMI Calculator</div>
          <h1>Plan your loan with confidence</h1>
          <p>
            Adjust the amount, rate and tenure to see your monthly EMI instantly — then compare live rates from 35+ lenders.
          </p>
        </div>

        {/* Fixed/Floating Rate Toggle (Only shown for Home and LAP loans) */}
        {(loanType === "home" || loanType === "lap") && (
          <div className="rate-toggle" id="emiRateToggle">
            <button
              className={`rt-btn ${rateType === "floating" ? "active" : ""}`}
              onClick={() => setRateType("floating")}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Floating
            </button>
            <button
              className={`rt-btn ${rateType === "fixed" ? "active" : ""}`}
              onClick={() => setRateType("fixed")}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Fixed
            </button>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="rate-info-banner" id="rateInfoBanner">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span id="rateInfoText">
          {rateType === "floating"
            ? "Floating rate: Linked to RBI repo rate (5.25%). Currently favourable as rates are at multi-year lows."
            : "Fixed rate: Rate stays constant throughout tenure. This loan type is offered on a fixed-rate basis by lenders."}
        </span>
      </div>

      {/* ═══ CALCULATOR MAIN GRID ═══ */}
      <div className="emi-calc-grid">
        {/* Left Column: Inputs */}
        <div className="emi-inputs-card">
          <div className="eic-label">Loan Details</div>

          {/* Loan Category Toggle */}
          <div className="emi-loantype-row">
            <button
              className={`hltp ${loanType === "home" ? "active" : ""}`}
              onClick={() => setLoanType("home")}
            >
              <span className="hltp-ic">🏠</span>Home
            </button>
            <button
              className={`hltp ${loanType === "lap" ? "active" : ""}`}
              onClick={() => setLoanType("lap")}
            >
              <span className="hltp-ic">🏢</span>LAP
            </button>
            <button
              className={`hltp ${loanType === "personal" ? "active" : ""}`}
              onClick={() => setLoanType("personal")}
            >
              <span className="hltp-ic">💳</span>Personal
            </button>
            <button
              className={`hltp ${loanType === "business" ? "active" : ""}`}
              onClick={() => setLoanType("business")}
            >
              <span className="hltp-ic">📦</span>Business
            </button>
            <button
              className={`hltp ${loanType === "vehicle" ? "active" : ""}`}
              onClick={() => setLoanType("vehicle")}
            >
              <span className="hltp-ic">🚗</span>Vehicle
            </button>
          </div>

          {/* Loan Amount Range Field */}
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
            <div className="amt-quick-btns">
              {quickAmountOptions.map((val) => (
                <button key={val} onClick={() => setAmount(val)}>
                  {fmtINR(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Expected ROI Range Field */}
          <div className="range-field">
            <div className="rf-header">
              <label>Expected ROI (p.a.)</label>
              <div className="rf-input-wrap">
                <input
                  type="number"
                  className="rf-input"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  onBlur={clampRate}
                  step="0.1"
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
              step="0.25"
            />
            <div className="rf-minmax">
              <span>{params.rateMin}%</span>
              <span>{params.rateMax}%</span>
            </div>
          </div>

          {/* Loan Tenure Range Field */}
          <div className="range-field">
            <div className="rf-header">
              <label>Loan Tenure</label>
              <div className="rf-input-wrap">
                <input
                  type="number"
                  className="rf-input"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  onBlur={clampTenure}
                />
                <span className="rf-suffix">Months</span>
              </div>
            </div>
            <input
              type="range"
              ref={tenureRef}
              min={params.tenureMin}
              max={params.tenureMax}
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              step="6"
            />
            <div className="rf-minmax">
              <span>{params.tenureMin / 12} Year</span>
              <span>{params.tenureMax / 12} Years</span>
            </div>
            <div className="amt-quick-btns">
              {quickTenureOptions.map((val) => (
                <button key={val} onClick={() => setTenure(val)}>
                  {val / 12} yr
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Donut */}
        <div className="emi-result-card">
          <div className="emi-result-top">
            <div className="erp-label">Your Monthly EMI</div>
            <div className="erp-emi">{fmtINRFull(emi)}</div>
            <div className="erp-sub">{fmtTenure(tenure)}</div>
          </div>

          <EmiDonut
            principal={amount}
            interest={totalInterest}
            principalPercentage={principalPercentage}
          />

          <div className="pie-legend">
            <span>
              <span className="legend-dot" style={{ backgroundColor: "#22D3EE" }}></span>
              Principal
            </span>
            <span>
              <span className="legend-dot" style={{ backgroundColor: "#D4AF37" }}></span>
              Interest
            </span>
          </div>

          <div className="breakdown-grid">
            <div className="bkd-box">
              <div className="val">{fmtINRFull(amount)}</div>
              <div className="lbl">Principal</div>
            </div>
            <div className="bkd-box">
              <div className="val">{fmtINRFull(totalInterest)}</div>
              <div className="lbl">Total Interest</div>
            </div>
            <div className="bkd-box bkd-full">
              <div className="val">{fmtINRFull(totalPayable)}</div>
              <div className="lbl">Total Amount Payable</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SCHEDULE ACCORDIONS / DETAIL TABS ═══ */}
      <div className="emi-detail-tabs">
        <button
          className={`edt-tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          📊 Schedule Summary
        </button>
        <button
          className={`edt-tab ${activeTab === "amort" ? "active" : ""}`}
          onClick={() => setActiveTab("amort")}
        >
          📅 Amortisation Schedule
        </button>
      </div>

      {/* Tab Panel: Summary */}
      {activeTab === "summary" && (
        <div className="emi-detail-panel animate-fade-up">
          <div className="emi-summary-grid">
            <div className="esg-card">
              <div className="esg-ic">💰</div>
              <div className="esg-v">{fmtINRFull(emi)}</div>
              <div className="esg-l">Monthly EMI</div>
            </div>
            <div className="esg-card">
              <div className="esg-ic">🏦</div>
              <div className="esg-v">{fmtINR(amount)}</div>
              <div className="esg-l">Principal</div>
            </div>
            <div className="esg-card">
              <div className="esg-ic">📈</div>
              <div className="esg-v">{fmtINR(totalInterest)}</div>
              <div className="esg-l">Total Interest</div>
            </div>
            <div className="esg-card">
              <div className="esg-ic">🧾</div>
              <div className="esg-v">{fmtINR(totalPayable)}</div>
              <div className="esg-l">Total Payable</div>
            </div>
          </div>
          <div className="emi-summary-note">
            Over <strong>{fmtTenure(tenure)}</strong>, you’ll pay <strong>{fmtINR(totalInterest)}</strong> in interest — about <strong>{interestPercentage}%</strong> of your total outgo. Choosing a lower expected ROI or shorter tenure reduces this. <em>Final ROI will be confirmed post credit assessment of the case.</em>
          </div>
        </div>
      )}

      {/* Tab Panel: Amortisation Table */}
      {activeTab === "amort" && (
        <div className="emi-detail-panel animate-fade-up">
          <div className="amort-scroll">
            <table className="amort-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Year</th>
                  <th>EMI Paid</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {amortizationSchedule.map((row) => (
                  <tr key={row.year}>
                    <td style={{ textAlign: "left", fontWeight: "600" }}>
                      Year {row.year}
                    </td>
                    <td>{fmtINRFull(row.emiPaid)}</td>
                    <td>{fmtINRFull(row.principalPaid)}</td>
                    <td>{fmtINRFull(row.interestPaid)}</td>
                    <td>{fmtINRFull(row.outstandingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ COMPARE LENDERS SECTION ═══ */}
      <div className="lender-section">
        <div className="lender-section-header">
          <div>
            <h3>Compare Lenders</h3>
            <div className="lender-sub">
              Live rates from 29 banks & NBFCs · sorted for your profile
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
                NBFC/HFC
              </button>
              <button
                className={`lf-btn ${lenderFilter === "small" ? "active" : ""}`}
                onClick={() => setLenderFilter("small")}
              >
                SFB
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

        {/* Lender rows list */}
        <div className="lender-grid">
          {filteredLenders.length > 0 ? (
            <>
              {/* Header row */}
              <div className="lc-row lc-row-head">
                <div className="lcr-lender">Lender</div>
                <div className="lcr-rate">Expected ROI</div>
                <div className="lcr-emi">Est. EMI</div>
                <div className="lcr-act"></div>
              </div>

              {filteredLenders.map((l) => {
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
                        <div className="lcr-badge">
                          {typeLabels[l.type] || ""}{" "}
                          {l.offer && (
                            <>
                              {" · "}
                              <span className="lcr-offer">{l.offer}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lcr-rate">
                      <span className="lcr-rate-v" style={isBest ? { color: "#059669" } : {}}>
                        {ratesArr[0].toFixed(2)}%
                      </span>
                      <span className="lcr-rate-r">
                        {ratesArr[0].toFixed(2)}–{ratesArr[1].toFixed(2)}
                      </span>
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
              })}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text2)" }}>
              No lenders available for this filter/loan type combination.
            </div>
          )}
        </div>

        <div className="roi-confirm-note">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            <strong>Note:</strong> Final ROI will be confirmed post credit assessment of the case. Processing fee, where applicable, is confirmed by the lender at sanction. Rates shown are indicative, updated June 2026.
          </span>
        </div>
      </div>
    </div>
  );
}
export { Calculator };
