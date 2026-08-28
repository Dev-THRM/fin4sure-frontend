import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calculator as CalculatorIcon,
  Zap,
  BarChart3,
  Calendar,
  Landmark
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEmiCalculator } from "../hooks/useEmiCalculator";
import { useSliderPaint } from "../hooks/useSliderPaint";
import { fmtINR, fmtINRFull } from "../utils/formatters";
import { calcEMI } from "../utils/emiCalculator";
import { LENDERS, getLenderTypePriority } from "../utils/loanConstants";
import "./styles/calculator.css";

export default function Calculator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dbLenders, setDbLenders] = useState([]);
  const [loadingLenders, setLoadingLenders] = useState(false);

  // Sub-tabs & Lender filter/sort states for EMI Calculator Dashboard
  const [subTab, setSubTab] = useState("summary"); // "summary" | "amortization"
  const [lenderFilter, setLenderFilter] = useState("All");
  const [lenderSort, setLenderSort] = useState("type_order");

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

  // Fetch real lenders and live admin overrides
  useEffect(() => {
    const fetchLenders = async () => {
      try {
        setLoadingLenders(true);
        const res = await fetch("/api/admin/lender-rates");
        if (res.ok) {
          const json = await res.json();
          const ratesList = json.rates || json.data || (Array.isArray(json) ? json : []);
          if (Array.isArray(ratesList) && ratesList.length > 0) {
            setDbLenders(ratesList);
            return;
          }
        }
        const fallbackRes = await fetch("/api/lenders");
        const fallbackJson = await fallbackRes.json();
        if (fallbackJson.success && Array.isArray(fallbackJson.data)) {
          setDbLenders(fallbackJson.data);
        }
      } catch (err) {
        console.error("Error fetching live rates:", err);
      } finally {
        setLoadingLenders(false);
      }
    };
    fetchLenders();
  }, []);

  // Local state for Amount text inputs
  const [amtInputVal, setAmtInputVal] = useState("50");
  const [amtUnit, setAmtUnit] = useState(100000); // Lakhs vs Crores
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  // Synchronize numeric input formatting
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

  // Hook refs to paint range slider backgrounds dynamically
  const amtRef = useSliderPaint(amount, params.amtMin, params.amtMax);
  const rateRef = useSliderPaint(rate, params.rateMin, params.rateMax);
  const tenureRef = useSliderPaint(tenure, params.tenureMin, params.tenureMax);

  // Amount input handlers
  const handleAmtInputChange = (e) => {
    const value = e.target.value;

    // Keep exactly what the user types
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

    // Keep the number entered by the user unchanged
    setAmtInputVal(numericValue.toString());

    // Apply the new unit to that same number
    setAmount(numericValue * newUnit);
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

  // Combine DB lenders or real master list based on loanType & rateType
  const mergedLendersList = useMemo(() => {
    const dbMap = new Map();
    if (Array.isArray(dbLenders) && dbLenders.length > 0) {
      dbLenders.forEach(dl => {
        if (dl.name) dbMap.set(dl.name.toLowerCase().trim(), dl);
        if (dl.short) dbMap.set(dl.short.toLowerCase().trim(), dl);
      });
    }

    const currentCatKey = loanType || 'home';
    const result = [];

    LENDERS.forEach((l, idx) => {
      const rateObj = l.rates?.[currentCatKey];
      if (!rateObj) return;

      const flowPair = rateObj.f;
      const fixPair = rateObj.x;

      // Skip lenders that do not offer this loan category (e.g. Mahindra on Home Loans)
      if (!flowPair && !fixPair) return;

      let minR = rateType === 'floating'
        ? (flowPair ? flowPair[0] : fixPair?.[0])
        : (fixPair ? fixPair[0] : flowPair?.[0]);

      let maxR = rateType === 'floating'
        ? (flowPair ? flowPair[1] : fixPair?.[1])
        : (fixPair ? fixPair[1] : flowPair?.[1]);

      if (minR === null || minR === undefined) return;

      let offer = l.offer || "Special competitive rate offer";
      const dbEntry = dbMap.get(l.name.toLowerCase().trim()) || (l.short ? dbMap.get(l.short.toLowerCase().trim()) : null);

      if (dbEntry) {
        if (rateType === 'floating') {
          if (dbEntry.flowLow !== undefined && dbEntry.flowLow !== null && dbEntry.flowLow !== "N/A" && dbEntry.flowLow !== "") {
            const parsed = parseFloat(dbEntry.flowLow);
            if (!isNaN(parsed) && parsed > 0) minR = parsed;
          }
          if (dbEntry.flowHigh !== undefined && dbEntry.flowHigh !== null && dbEntry.flowHigh !== "N/A" && dbEntry.flowHigh !== "") {
            const parsed = parseFloat(dbEntry.flowHigh);
            if (!isNaN(parsed) && parsed > 0) maxR = parsed;
          }
        } else {
          if (dbEntry.fixLow !== undefined && dbEntry.fixLow !== null && dbEntry.fixLow !== "N/A" && dbEntry.fixLow !== "") {
            const parsed = parseFloat(dbEntry.fixLow);
            if (!isNaN(parsed) && parsed > 0) minR = parsed;
          }
          if (dbEntry.fixHigh !== undefined && dbEntry.fixHigh !== null && dbEntry.fixHigh !== "N/A" && dbEntry.fixHigh !== "") {
            const parsed = parseFloat(dbEntry.fixHigh);
            if (!isNaN(parsed) && parsed > 0) maxR = parsed;
          }
        }
        if (dbEntry.offer) offer = dbEntry.offer;
      }

      const typeUpper = l.type ? (
        l.type.toUpperCase() === 'PSU' ? 'PSU' :
        (l.type.toLowerCase().includes('nbfc') || l.type.toLowerCase().includes('hfc')) ? 'NBFC/HFC' :
        (l.type.toLowerCase().includes('small') || l.type.toLowerCase().includes('sfb')) ? 'SFB' :
        'PRIVATE'
      ) : 'PRIVATE';

      result.push({
        id: dbEntry?.id || (idx + 1),
        name: l.name,
        short: l.short || l.name,
        type: typeUpper,
        emoji: l.emoji || '🏛️',
        logo: l.logo || null,
        rate: parseFloat(minR),
        maxRate: parseFloat(maxR || minR),
        offer
      });
    });

    return result.sort((a, b) => {
      const pA = getLenderTypePriority(a.type);
      const pB = getLenderTypePriority(b.type);
      if (pA !== pB) return pA - pB;
      return a.rate - b.rate;
    });
  }, [dbLenders, loanType, rateType]);

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
      list = list.filter(l => {
        const rawType = String(l.type || 'PRIVATE').toLowerCase();
        if (fl === "psu") {
          return rawType === "psu" || rawType.includes("psu") || rawType.includes("public") || rawType.includes("govt");
        }
        if (fl === "private") {
          return rawType === "private";
        }
        if (fl === "nbfc/hfc" || fl === "nbfc" || fl === "hfc") {
          return rawType.includes("nbfc") || rawType.includes("hfc");
        }
        if (fl === "sfb" || fl === "small") {
          return rawType.includes("sfb") || rawType.includes("small");
        }
        return true;
      });
    }

    // Type priority order: Private → NBFC/HFC → SFB → PSU
    const typeOrder = { 'private': 0, 'nbfc/hfc': 1, 'nbfc': 1, 'hfc': 1, 'sfb': 2, 'psu': 3 };
    const getTypeOrder = (type) => {
      const t = (type || '').toLowerCase();
      for (const key of Object.keys(typeOrder)) {
        if (t.includes(key)) return typeOrder[key];
      }
      return 99;
    };

    if (lenderSort === "rate_asc") {
      list.sort((a, b) => {
        if (a.rate !== b.rate) return a.rate - b.rate;
        return getTypeOrder(a.type) - getTypeOrder(b.type);
      });
    } else if (lenderSort === "rate_desc") {
      list.sort((a, b) => {
        if (b.rate !== a.rate) return b.rate - a.rate;
        return getTypeOrder(a.type) - getTypeOrder(b.type);
      });
    } else if (lenderSort === "emi_asc") {
      list.sort((a, b) => {
        const diff = calcEMI(amount, a.rate, tenure) - calcEMI(amount, b.rate, tenure);
        if (diff !== 0) return diff;
        return getTypeOrder(a.type) - getTypeOrder(b.type);
      });
    } else {
      list.sort((a, b) => {
        const pA = getTypeOrder(a.type);
        const pB = getTypeOrder(b.type);
        if (pA !== pB) return pA - pB;
        return a.rate - b.rate;
      });
    }

    return list;
  }, [mergedLendersList, lenderFilter, lenderSort, amount, tenure]);

  const handleApplyToLender = (lenderId) => {
    navigate("/apply", {
      state: {
        loanType: loanType,
        amount: amount,
        rate: rate,
        tenure: tenure,
        selectedLenders: [lenderId]
      }
    });
  };

  return (
    <div className="calc-full-page animate-fade-up">
      {/* ═══ STANDALONE EMI CALCULATOR HERO BANNER (COMPACT) ═══ */}
      <div style={{
        maxWidth: '1600px',
        width: '96%',
        margin: '12px auto 8px',
        padding: '0 16px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0F2942 0%, #1E3A8A 50%, #0369A1 100%)',
          borderRadius: '16px',
          padding: '12px 24px',
          color: '#FFFFFF',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 16px rgba(15, 41, 66, 0.12)'
        }}>
          {/* Left Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#38BDF8',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.06em'
            }}>
              <CalculatorIcon size={12} /> EMI CALCULATOR
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.2rem',
              fontWeight: 800,
              margin: 0,
              color: '#FFFFFF'
            }}>
              Plan your loan with confidence
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Adjust amount, rate &amp; tenure to see your monthly EMI instantly — then compare 35+ lenders.
            </span>
          </div>

          {/* Right Floating / Fixed Rate Toggle Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '3px',
            display: 'inline-flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <button
              type="button"
              onClick={() => handleRateTypeChange('floating')}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: rateType === 'floating' ? '#0F2942' : 'transparent',
                color: rateType === 'floating' ? '#FFFFFF' : '#64748B',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Zap size={13} /> Floating
            </button>
            <button
              type="button"
              onClick={() => handleRateTypeChange('fixed')}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: rateType === 'fixed' ? '#0F2942' : 'transparent',
                color: rateType === 'fixed' ? '#FFFFFF' : '#64748B',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              — Fixed
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT BODY (NO STEPPER) ═══ */}
      <div className="calc-body-wrap">
        {/* ═══ TOP SECTION: SCHEDULE SUMMARY | AMORTIZATION SCHEDULE ═══ */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 24px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setSubTab('summary')}
              style={{
                padding: '6px 18px',
                borderRadius: '16px',
                border: subTab === 'summary' ? '1px solid #0284C7' : '1px solid #E2E8F0',
                background: subTab === 'summary' ? '#E0F2FE' : '#F8FAFC',
                color: subTab === 'summary' ? '#0369A1' : '#64748B',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <BarChart3 size={15} /> Schedule Summary
            </button>
            <button
              type="button"
              onClick={() => setSubTab('amortization')}
              style={{
                padding: '6px 18px',
                borderRadius: '16px',
                border: subTab === 'amortization' ? '1px solid #0284C7' : '1px solid #E2E8F0',
                background: subTab === 'amortization' ? '#E0F2FE' : '#F8FAFC',
                color: subTab === 'amortization' ? '#0369A1' : '#64748B',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={15} /> Amortization Schedule
            </button>
          </div>

          {subTab === 'summary' ? (
            <div>
              {/* 4 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F2942' }}>{fmtINRFull(emi)}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>MONTHLY EMI</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F2942' }}>{fmtLakhCr(amount)}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>PRINCIPAL</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D97706' }}>{fmtLakhCr(totalInterest)}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>TOTAL INTEREST</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284C7' }}>{fmtLakhCr(totalPayable)}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>TOTAL PAYABLE</div>
                </div>
              </div>

              {/* Summary Explanatory Banner */}
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '10px 16px', color: '#0369A1', fontSize: '0.82rem', lineHeight: '1.4', fontWeight: 500 }}>
                Over <strong>{Math.round(tenure / 12)} yrs</strong>, you'll pay <strong>{fmtLakhCr(totalInterest)}</strong> in interest — about <strong>{100 - (totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50)}%</strong> of your total outlay. Choosing lower expected ROI or shorter tenure reduces this. Final ROI will be confirmed post credit assessment of the case.
              </div>
            </div>
          ) : (
            /* Amortization Table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>YEAR</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>PRINCIPAL PAID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>INTEREST PAID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>TOTAL PAYMENT</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>REMAINING BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((row) => (
                    <tr key={row.year} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F2942' }}>Year {row.year}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0369A1' }}>₹{row.principalPaid.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#D97706' }}>₹{row.interestPaid.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F2942' }}>₹{row.totalPayment.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#64748B' }}>₹{row.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ═══ UNIFIED SIDE-BY-SIDE GRID (LEFT: CALCULATOR | RIGHT: COMPARE LENDERS TABLE) ═══ */}
        <div className="calc-main-side-grid" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start', marginBottom: '24px' }}>

          {/* ═══ LEFT PANEL: LOAN CALCULATOR & EMI READOUT ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#64748B' }}>
                  LOAN CALCULATOR
                </div>
                {/* Floating | Fixed Toggle */}
                <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '20px', border: '1px solid #CBD5E1' }}>
                    <button
                    type="button"
                    onClick={() => handleRateTypeChange('floating')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: rateType === 'floating' ? '#0F2942' : 'transparent',
                      color: rateType === 'floating' ? '#FFFFFF' : '#64748B',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Zap size={12} /> Floating
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateTypeChange('fixed')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      border: 'none',
                      fontSize: '0.76rem',
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

              {/* 1. Loan Amount */}
              <div className="range-field" style={{ marginBottom: '14px' }}>
                <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F2942' }}>Loan Amount</label>
                  <div
                    className="rf-input-wrap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#F8FAFC",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "2px 8px",
                      width: "auto",
                      minWidth: "150px",
                      boxSizing: "border-box",
                      overflow: "visible"
                    }}
                  >
                    <span
                      className="rf-prefix"
                      style={{
                        fontWeight: 700,
                        color: "#0F2942",
                        fontSize: "0.85rem",
                        flexShrink: 0
                      }}
                    >
                      ₹
                    </span>

                    <input
                      type="number"
                      className="rf-input"
                      value={amtInputVal}
                      onFocus={() => setIsEditingAmount(true)}
                      onChange={handleAmtInputChange}
                      onBlur={handleAmtBlur}
                      step="0.01"
                      style={{
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        fontWeight: 800,
                        fontSize: "0.92rem",
                        color: "#0F2942",
                        width: "56px",
                        minWidth: "45px",
                        textAlign: "right",
                        padding: "2px 4px"
                      }}
                    />

                    <select
                      className="rf-unit"
                      value={amtUnit}
                      onChange={handleUnitChange}
                      style={{
                        border: "none",
                        borderLeft: "1px solid #CBD5E1",
                        background: "#E0F2FE",
                        outline: "none",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: "#0369A1",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        marginLeft: "6px",
                        minWidth: "68px",
                        textAlign: "center",
                        flexShrink: 0
                      }}
                    >
                      <option value={100000}>Lakh</option>
                      <option value={10000000}>Crore</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {[1000000, 2500000, 5000000, 10000000, 25000000].map((presetAmt) => {
                    const isSel = amount === presetAmt;
                    const label = presetAmt >= 10000000 ? `₹${(presetAmt / 10000000).toFixed(2)} Cr` : `₹${(presetAmt / 100000).toFixed(2)} L`;
                    return (
                      <button
                        key={presetAmt}
                        type="button"
                        onClick={() => setAmount(presetAmt)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: isSel ? '1px solid #0284C7' : '1px solid #E2E8F0',
                          background: isSel ? '#E0F2FE' : '#F8FAFC',
                          color: isSel ? '#0369A1' : '#475569',
                          fontSize: '0.72rem',
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
              <div className="range-field" style={{ marginBottom: '14px' }}>
                <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F2942' }}>Expected Rate (% p.a.)</label>
                  <div
                    className="rf-input-wrap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#F8FAFC",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "2px 10px",
                      width: "auto",
                      minWidth: "90px",
                      overflow: "visible"
                    }}
                  >
                    <input
                      type="number"
                      className="rf-input"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      onBlur={clampRate}
                      step="0.05"
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.85rem', color: '#0F2942', width: '50px', textAlign: 'right' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>%</span>
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
                <div className="rf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F2942' }}>Loan Tenure</label>
                  <div className="rf-input-wrap" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '2px 6px' }}>
                    <input
                      type="number"
                      className="rf-input"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      onBlur={clampTenure}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '0.85rem', color: '#0F2942', width: '45px', textAlign: 'right' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Mos</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {[5, 10, 15, 20, 25, 30].map((yr) => {
                    const mo = yr * 12;
                    const isSel = tenure === mo;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setTenure(mo)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: isSel ? '1px solid #0284C7' : '1px solid #E2E8F0',
                          background: isSel ? '#E0F2FE' : '#F8FAFC',
                          color: isSel ? '#0369A1' : '#475569',
                          fontSize: '0.72rem',
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

            {/* ═══ YOUR MONTHLY EMI CARD ═══ */}
            <div style={{
              background: 'linear-gradient(145deg, #0B192C 0%, #1E293B 100%)',
              borderRadius: '20px',
              padding: '24px 20px',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(11,25,44,0.15)'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#94A3B8', textAlign: 'center', marginBottom: '4px' }}>
                YOUR MONTHLY EMI
              </div>

              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.2rem', fontWeight: 900, textAlign: 'center', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {fmtINRFull(emi)}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38BDF8', textAlign: 'center', marginBottom: '16px' }}>
                {Math.round(tenure / 12)} Yrs
              </div>

              {/* Doughnut SVG Chart */}
              <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 14px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="75" cy="75" r="60" stroke="rgba(255,255,255,0.08)" strokeWidth="16" fill="transparent" />
                  <circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke="#F59E0B"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${(100 - (totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50)) / 100 * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                    strokeDashoffset={0}
                    style={{ transition: 'stroke-dasharray 0.4s ease' }}
                  />
                  <circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke="#38BDF8"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${(totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50) / 100 * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                    strokeDashoffset={-((100 - (totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50)) / 100 * (2 * Math.PI * 60))}
                    style={{ transition: 'stroke-dasharray 0.4s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>{totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 50}%</div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', marginTop: '2px' }}>PRINCIPAL</div>
                </div>
              </div>

              {/* Chart Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38BDF8' }} />
                  <span style={{ color: '#FFFFFF' }}>Principal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ color: '#FFFFFF' }}>Interest</span>
                </div>
              </div>

              {/* 2 Side-by-Side Metric Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{fmtLakhCr(amount)}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', marginTop: '4px', letterSpacing: '0.04em' }}>PRINCIPAL</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{fmtLakhCr(totalInterest)}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', marginTop: '4px', letterSpacing: '0.04em' }}>TOTAL INTEREST</div>
                </div>
              </div>

              {/* 1 Full-Width Bottom Metric Box */}
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 16px' }}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.35rem', fontWeight: 900, color: '#38BDF8' }}>{fmtLakhCr(totalPayable)}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', marginTop: '4px', letterSpacing: '0.04em' }}>TOTAL AMOUNT PAYABLE</div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT PANEL: COMPARE LENDERS TABLE ═══ */}
          <div id="compare-lenders-section" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 800 }}>
                  <Zap size={11} /> LIVE {rateType.toUpperCase()} RATES
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', fontWeight: 800, color: '#0F2942', margin: '2px 0 0 0' }}>
                  Compare Lenders ({rateType === 'floating' ? 'Floating' : 'Fixed'})
                </h2>
              </div>

              {/* Filter Pills & Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '4px', background: '#F8FAFC', padding: '3px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  {["All", "PSU", "Private", "NBFC/HFC", "SFB"].map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setLenderFilter(fl)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.74rem',
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
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#0F2942',
                    cursor: 'pointer'
                  }}
                >
                  <option value="type_order">Type Order ▾</option>
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
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                    <Landmark size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F2942' }}>{filteredAndSortedLenders[0].name}</span>
                      <span style={{ padding: '1px 6px', borderRadius: '8px', background: '#DBEAFE', color: '#1E40AF', fontSize: '0.65rem', fontWeight: 700 }}>
                        {filteredAndSortedLenders[0].type || 'PRIVATE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F2942' }}>{filteredAndSortedLenders[0].rate.toFixed(2)}%</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>{filteredAndSortedLenders[0].rate.toFixed(2)}–{filteredAndSortedLenders[0].maxRate.toFixed(2)}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0284C7' }}>
                      {fmtINRFull(calcEMI(amount, filteredAndSortedLenders[0].rate, tenure))}<span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/mo</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Est. EMI</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyToLender(filteredAndSortedLenders[0].id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#0F2942',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(15,41,66,0.2)'
                    }}
                  >
                    Apply →
                  </button>
                </div>
              </div>
            )}

            {/* Lenders Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#0F2942', color: '#FFFFFF', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', borderRadius: '8px 0 0 0', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.05em' }}>LENDER</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.05em' }}>EXPECTED ROI ({rateType === 'floating' ? 'FLOATING' : 'FIXED'})</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.05em' }}>EST. EMI</th>
                    <th style={{ padding: '10px 14px', borderRadius: '0 8px 0 0', textAlign: 'right', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.05em' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedLenders.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '30px 14px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                        No matching lenders found for {lenderFilter}.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedLenders.map((lender) => {
                      const lEmi = calcEMI(amount, lender.rate, tenure);
                      const rowKey = `calc-lender-${lender.name}-${lender.type}-${lenderFilter}-${rateType}-${loanType}`;
                      const isPsu = lender.type === 'PSU';
                      const isNbfc = lender.type === 'NBFC/HFC';
                      const isSfb = lender.type === 'SFB';

                      return (
                        <tr key={rowKey} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Landmark size={16} className="text-slate-600" />
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: '#0F2942' }}>{lender.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                  <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    color: isPsu ? '#1E40AF' : isNbfc ? '#92400E' : isSfb ? '#15803D' : '#475569',
                                    background: isPsu ? '#DBEAFE' : isNbfc ? '#FEF3C7' : isSfb ? '#DCFCE7' : '#F1F5F9',
                                    padding: '1px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {lender.type || 'PRIVATE'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 800, color: '#0F2942', fontSize: '0.88rem' }}>{lender.rate.toFixed(2)}%</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{lender.rate.toFixed(2)}–{lender.maxRate.toFixed(2)}%</div>
                          </td>

                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.88rem' }}>{fmtINRFull(lEmi)}<span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B' }}>/mo</span></div>
                          </td>

                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleApplyToLender(lender.id)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                background: '#0F2942',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Apply →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
