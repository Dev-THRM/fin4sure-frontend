/**
 * Calculate Equated Monthly Installment (EMI)
 * @param {number} P - Principal loan amount
 * @param {number} r - Annual interest rate (p.a.)
 * @param {number} n - Loan tenure in months
 * @returns {number} Monthly EMI amount
 */
export function calcEMI(P, r, n) {
  if (!r) return P / n;
  const mr = r / 12 / 100;
  return (P * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

/**
 * Generate yearly amortization schedule data
 * @param {number} P - Principal loan amount
 * @param {number} r - Annual interest rate (p.a.)
 * @param {number} n - Loan tenure in months
 * @returns {Array<{year: number, emiPaid: number, principalPaid: number, interestPaid: number, outstandingBalance: number}>}
 */
export function buildAmortSchedule(P, r, n) {
  const mr = r / 12 / 100;
  const emi = calcEMI(P, r, n);
  let bal = P;
  const schedule = [];

  const totalYears = Math.ceil(n / 12);
  for (let y = 1; y <= totalYears; y++) {
    let yPrin = 0;
    let yInt = 0;
    let yEmi = 0;

    for (let m = 1; m <= 12 && (y - 1) * 12 + m <= n; m++) {
      const interest = bal * mr;
      const principal = emi - interest;

      yInt += interest;
      yPrin += principal;
      yEmi += emi;
      bal -= principal;
      if (bal < 0) bal = 0;
    }

    schedule.push({
      year: y,
      emiPaid: yEmi,
      principalPaid: yPrin,
      interestPaid: yInt,
      outstandingBalance: Math.max(0, bal)
    });
  }

  return schedule;
}
