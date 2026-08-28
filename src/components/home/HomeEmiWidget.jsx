import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Building2, CreditCard, Briefcase, Car } from "lucide-react";
import { useEmiCalculator } from "../../hooks/useEmiCalculator";
import { useSliderPaint } from "../../hooks/useSliderPaint";
import { fmtINRFull, fmtTenure } from "../../utils/formatters";

export default function HomeEmiWidget() {
  const navigate = useNavigate();
  const {
    loanType,
    amount,
    rate,
    tenure,
    params,
    emi,
    setLoanType,
    setAmount,
    setRate,
    setTenure,
    clampAmount,
    clampRate,
    clampTenure,
    snapAmount
  } = useEmiCalculator("home");

  // Local state for numeric text inputs to allow typing freely
  const [amtInputVal, setAmtInputVal] = useState("30");
  const [amtUnit, setAmtUnit] = useState(100000); // Default to Lakh (100,000)
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  // Sync range slider to input box when slider values change
  useEffect(() => {
    if (isEditingAmount) return;

    if (amount >= 10000000) {
      setAmtUnit(10000000);
      setAmtInputVal((amount / 10000000).toFixed(2));
    } else {
      setAmtUnit(100000);
      setAmtInputVal((amount / 100000).toFixed(2));
    }
  }, [amount, isEditingAmount]);

  // Paint range sliders
  const amtRef = useSliderPaint(amount, params.amtMin, params.amtMax);
  const rateRef = useSliderPaint(rate, params.rateMin, params.rateMax);
  const tenureRef = useSliderPaint(tenure, params.tenureMin, params.tenureMax);

  // Input changes handlers
  const handleAmtInputChange = (e) => {
    const value = e.target.value;
    setAmtInputVal(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setAmount(numericValue * amtUnit);
    }
  };

  const handleAmtBlur = () => {
    setIsEditingAmount(false);
    const numericValue = parseFloat(amtInputVal);
    if (isNaN(numericValue) || numericValue <= 0) {
      setAmtInputVal((amount / amtUnit).toFixed(2));
      return;
    }
    const newAmount = numericValue * Number(amtUnit);
    const finalAmount = Math.max(
      params.amtMin,
      Math.min(params.amtMax, newAmount)
    );
    setAmount(finalAmount);
  };

  const handleUnitChange = (e) => {
    const newUnit = Number(e.target.value);
    const numericValue = parseFloat(amtInputVal) || 0;
    setAmtUnit(newUnit);
    setAmtInputVal(numericValue.toString());
    setAmount(numericValue * newUnit);
  };

  const handleRedirect = () => {
    navigate("/EMI-calculator", {
      state: { loanType, amount, rate, tenure, emi }
    });
  };

  return (
    <div className="home-emi-widget" id="homeEmiWidget">
      <div className="emi-card">
        {/* Header */}
        <div className="emi-card-top">
          <div className="ect-badge">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <polyline
                points="2,16 7,10 11,13 18,4"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon points="18,4 13,7 15,11" fill="#fff" />
            </svg>
          </div>
          <div className="ect-title">
            <h3>EMI Calculator</h3>
            <span>Estimate your monthly payment instantly</span>
          </div>
        </div>

        {/* Loan Type Pills */}
        <div className="home-loan-type-row">
          <button
            className={`hltp ${loanType === "home" ? "active" : ""}`}
            onClick={() => setLoanType("home")}
          >
            <Home size={14} className="hltp-ic inline" /> Home
          </button>
          <button
            className={`hltp ${loanType === "lap" ? "active" : ""}`}
            onClick={() => setLoanType("lap")}
          >
            <Building2 size={14} className="hltp-ic inline" /> LAP
          </button>
          <button
            className={`hltp ${loanType === "personal" ? "active" : ""}`}
            onClick={() => setLoanType("personal")}
          >
            <CreditCard size={14} className="hltp-ic inline" /> Personal
          </button>
          <button
            className={`hltp ${loanType === "business" ? "active" : ""}`}
            onClick={() => setLoanType("business")}
          >
            <Briefcase size={14} className="hltp-ic inline" /> Business
          </button>
          <button
            className={`hltp ${loanType === "vehicle" ? "active" : ""}`}
            onClick={() => setLoanType("vehicle")}
          >
            <Car size={14} className="hltp-ic inline" /> Vehicle
          </button>
        </div>

        {/* Loan Amount Slider */}
        <div className="range-field">
          <div className="rf-header">
            <label>Loan Amount</label>
            <div className="rf-input-wrap">
              <span className="rf-prefix">₹</span>
              <input
                type="number"
                className="rf-input"
                value={amtInputVal}
                onFocus={() => setIsEditingAmount(true)}
                onChange={handleAmtInputChange}
                onBlur={handleAmtBlur}
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
            <span>₹{params.amtMin >= 10000000 ? `${params.amtMin / 10000000} Cr` : `${params.amtMin / 100000} L`}</span>
            <span>₹{params.amtMax >= 10000000 ? `${params.amtMax / 10000000} Cr` : `${params.amtMax / 100000} L`}</span>
          </div>
        </div>

        {/* ROI Slider */}
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

        {/* Tenure Slider */}
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
            <span>{fmtTenure(params.tenureMin)}</span>
            <span>{fmtTenure(params.tenureMax)}</span>
          </div>
        </div>



        {/* Redirect Tab to Full Calculator */}
        <div className="emi-redirect-tab" onClick={handleRedirect}>
          <div className="ert-glow"></div>
          <div className="ert-left">
            <div className="ert-ic">🧮</div>
            <div className="ert-txt">
              <div class="ert-title">Calculate your EMI</div>
              <div class="ert-sub">Full breakdown · charts · compare lenders</div>
            </div>
          </div>
          <div className="ert-arrow">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="emi-card-foot">
          🔒 Indicative only — final ROI confirmed post credit assessment of your case
        </div>
      </div>
    </div>
  );
}
export { HomeEmiWidget };
