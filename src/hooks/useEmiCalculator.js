import { useState, useMemo, useEffect } from "react";
import { LOAN_PARAMS } from "../utils/loanConstants";
import { calcEMI, buildAmortSchedule } from "../utils/emiCalculator";

/**
 * Custom hook to manage all EMI calculator states, clamping, constraints, and calculation outputs.
 * 
 * @param {string} [initialLoanType='home'] - Initial loan type key
 * @param {number} [initialAmount] - Optional initial loan amount (defaults to type minimum)
 * @param {number} [initialRate] - Optional initial annual interest rate
 * @param {number} [initialTenure] - Optional initial tenure in months
 */
export function useEmiCalculator(initialLoanType = "home", initialAmount, initialRate, initialTenure) {
  const [loanType, setLoanTypeState] = useState(initialLoanType);

  // Load defaults based on loan type
  const params = LOAN_PARAMS[loanType] || LOAN_PARAMS.home;

  const [amount, setAmountState] = useState(() => {
    if (initialAmount !== undefined) return initialAmount;
    // Default to a sensible mid-point or min
    return Math.max(params.amtMin, Math.min(5000000, params.amtMax));
  });

  const [rate, setRateState] = useState(() => {
    if (initialRate !== undefined) return initialRate;
    return Math.max(params.rateMin, Math.min(8.5, params.rateMax));
  });

  const [tenure, setTenureState] = useState(() => {
    if (initialTenure !== undefined) return initialTenure;
    return Math.max(params.tenureMin, Math.min(240, params.tenureMax));
  });

  const [rateType, setRateTypeState] = useState(() => {
    // If floating is supported, default to floating. Else default to fixed.
    return loanType === "home" || loanType === "lap" ? "floating" : "fixed";
  });

  // Automatically adjust bounds when loan type changes
  const changeLoanType = (newType) => {
    if (!LOAN_PARAMS[newType]) return;
    setLoanTypeState(newType);

    const newParams = LOAN_PARAMS[newType];

    // Clamping amount
    setAmountState((prev) => {
      const step = newType === "personal" ? 50000 : 500000;
      let clamped = Math.min(Math.max(prev, newParams.amtMin), newParams.amtMax);
      clamped = Math.round(clamped / step) * step;
      return clamped;
    });

    // Clamping rate
    setRateState((prev) => {
      return Math.min(Math.max(prev, newParams.rateMin), newParams.rateMax);
    });

    // Clamping tenure
    setTenureState((prev) => {
      return Math.min(Math.max(prev, newParams.tenureMin), newParams.tenureMax);
    });

    // Adjust rate type if new type doesn't support floating
    setRateTypeState(() => {
      return newType === "home" || newType === "lap" ? "floating" : "fixed";
    });
  };

  // Helper step granularity
  const amountStep = useMemo(() => {
    return loanType === "personal" ? 50000 : 500000;
  }, [loanType]);

  // Snaps the amount to the clean steps (5L or 50k)
  const snapAmount = (val) => {
    const rawVal = parseFloat(val) || 0;
    let rounded = Math.round(rawVal / amountStep) * amountStep;
    return Math.min(Math.max(rounded, params.amtMin), params.amtMax);
  };

  // Safe state setters
  const setAmount = (val) => {
    setAmountState(parseFloat(val) || 0);
  };

  const setRate = (val) => {
    setRateState(parseFloat(val) || 0);
  };

  const setTenure = (val) => {
    setTenureState(parseInt(val) || 0);
  };

  const setRateType = (rt) => {
    if (rt === "floating" && loanType !== "home" && loanType !== "lap") return;
    setRateTypeState(rt);
  };

  // Clamp checks on blur / final submit
  const clampAmount = () => {
    setAmountState((prev) => snapAmount(prev));
  };

  const clampRate = () => {
    setRateState((prev) => Math.min(Math.max(prev, params.rateMin), params.rateMax));
  };

  const clampTenure = () => {
    setTenureState((prev) => Math.min(Math.max(prev, params.tenureMin), params.tenureMax));
  };

  // Derived calculations
  const emi = useMemo(() => {
    return calcEMI(amount, rate, tenure);
  }, [amount, rate, tenure]);

  const totalPayable = useMemo(() => {
    return emi * tenure;
  }, [emi, tenure]);

  const totalInterest = useMemo(() => {
    return Math.max(0, totalPayable - amount);
  }, [totalPayable, amount]);

  const principalPercentage = useMemo(() => {
    if (!totalPayable) return 0;
    return Math.round((amount / totalPayable) * 100);
  }, [amount, totalPayable]);

  const interestPercentage = useMemo(() => {
    return 100 - principalPercentage;
  }, [principalPercentage]);

  const amortizationSchedule = useMemo(() => {
    return buildAmortSchedule(amount, rate, tenure);
  }, [amount, rate, tenure]);

  return {
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
    setLoanType: changeLoanType,
    setAmount,
    setRate,
    setTenure,
    setRateType,
    clampAmount,
    clampRate,
    clampTenure,
    snapAmount
  };
}

export default useEmiCalculator;
