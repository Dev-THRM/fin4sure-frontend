export const LOAN_PARAMS = {
  home: { amtMin: 100000, amtMax: 300000000, rateMin: 6.5, rateMax: 18, tenureMin: 12, tenureMax: 360, label: 'Home Loan' },
  lap: { amtMin: 500000, amtMax: 300000000, rateMin: 7.5, rateMax: 18, tenureMin: 12, tenureMax: 240, label: 'Loan Against Property' },
  personal: { amtMin: 50000, amtMax: 5000000, rateMin: 9, rateMax: 24, tenureMin: 12, tenureMax: 84, label: 'Personal Loan' },
  business: { amtMin: 100000, amtMax: 20000000, rateMin: 10, rateMax: 26, tenureMin: 12, tenureMax: 60, label: 'Business Loan' },
  vehicle: { amtMin: 100000, amtMax: 10000000, rateMin: 7.5, rateMax: 16, tenureMin: 12, tenureMax: 96, label: 'Vehicle Loan' }
};

export function getLenderTypePriority(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('private')) return 1;
  if (t.includes('nbfc') || t.includes('hfc') || t.includes('housing finance')) return 2;
  if (t.includes('sfb') || t.includes('small')) return 3;
  if (t.includes('psu') || t.includes('public') || t.includes('govt')) return 4;
  return 5;
}

export const LENDERS = [
  // --- 1. Top PSUs & Private Giants ---
  {
    name: 'SBI', short: 'SBI', type: 'psu', emoji: '🏛️', color: '#003399', url: 'https://sbi.co.in',
    rates: {
      home: { f: [7.10, 9.65], x: [8.70, 11.20] },
      lap: { f: [8.55, 11.05], x: [9.55, 12.05] },
      personal: { f: [10.50, 14.50], x: [11.45, 14.80] },
      business: { f: [10.75, 13.05], x: [12.05, 15.05] },
      vehicle: { f: [8.75, 10.25], x: [9.25, 11.05] }
    },
    tc: 'Linked to EBLR. Women borrowers get 5 bps concession. Zero prepayment on floating loans.',
    offer: '🎁 Zero PF on home loans for women (festive offer — verify at branch)'
  },
  {
    name: 'HDFC Bank', short: 'HDFC', type: 'private', emoji: '🏦', color: '#004C97', url: 'https://hdfcbank.com',
    rates: {
      home: { f: [7.20, 9.80], x: [8.80, 11.50] },
      lap: { f: [9.00, 13.00], x: [10.00, 14.00] },
      personal: { f: [10.50, 21.00], x: [10.75, 24.00] },
      business: { f: [11.00, 22.00], x: [12.00, 22.00] },
      vehicle: { f: [8.85, 11.25], x: [9.40, 11.00] }
    },
    tc: 'RLLR-linked floating rates. CIBIL 750+ for best rates.',
    offer: '🎁 Pre-approved offers for existing HDFC customers.'
  },
  {
    name: 'ICICI Bank', short: 'ICICI', type: 'private', emoji: '🏦', color: '#F7941D', url: 'https://icicibank.com',
    rates: {
      home: { f: [7.25, 9.90], x: [8.90, 11.60] },
      lap: { f: [9.00, 13.50], x: [10.00, 14.50] },
      personal: { f: [10.65, 16.00], x: [10.75, 22.00] },
      business: { f: [11.50, 21.00], x: [12.50, 21.00] },
      vehicle: { f: [8.80, 11.15], x: [9.00, 11.00] }
    },
    tc: 'EBLR-linked rates. Instant digital processing for salaried borrowers.',
    offer: '🎁 Instant in-principle approval for pre-qualified customers.'
  },
  {
    name: 'Axis Bank', short: 'Axis', type: 'private', emoji: '🏦', color: '#800000', url: 'https://axisbank.com',
    rates: {
      home: { f: [7.30, 10.00], x: [9.00, 11.70] },
      lap: { f: [9.65, 12.50], x: [10.65, 13.50] },
      personal: { f: [10.49, 22.00], x: [11.00, 22.00] },
      business: { f: [12.00, 21.00], x: [13.00, 21.00] },
      vehicle: { f: [8.99, 11.50], x: [9.15, 10.50] }
    },
    tc: 'Max 100% on-road funding for vehicles. 5 bps concession for women on home loans.',
    offer: '🎁 Special concession on processing fees.'
  },
  {
    name: 'Kotak Mahindra', short: 'Kotak', type: 'private', emoji: '🏦', color: '#EF3E23', url: 'https://kotak.com',
    rates: {
      home: { f: [7.40, 9.75], x: [9.00, 11.50] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: [10.90, 20.00], x: [10.99, 24.00] },
      business: { f: [11.50, 20.00], x: [12.00, 22.00] },
      vehicle: { f: [9.10, 11.75], x: [9.00, 10.75] }
    },
    tc: 'Repo-linked floating rates. Digital-first processing.',
    offer: '🎁 Reduced processing fee on digital applications.'
  },
  {
    name: 'Punjab National Bank', short: 'PNB', type: 'psu', emoji: '🏛️', color: '#A20000', url: 'https://pnbindia.in',
    rates: {
      home: { f: [7.15, 9.75], x: [8.65, 11.25] },
      lap: { f: [8.90, 12.00], x: [9.90, 13.00] },
      personal: { f: [10.75, 15.25], x: [11.75, 16.00] },
      business: { f: [10.95, 14.50], x: [12.00, 15.50] },
      vehicle: { f: [8.75, 10.50], x: [9.35, 11.15] }
    },
    tc: 'PNB DigiHome: Concessional rates for high CIBIL scores (750+). Special defense loan packages.',
    offer: '🎁 Zero processing fee under PNB Pride scheme.'
  },
  {
    name: 'Bank of Baroda', short: 'BOB', type: 'psu', emoji: '🏛️', color: '#F47920', url: 'https://bankofbaroda.in',
    rates: {
      home: { f: [7.10, 9.60], x: [8.60, 11.10] },
      lap: { f: [8.85, 12.25], x: [9.85, 13.25] },
      personal: { f: [10.40, 15.25], x: [12.00, 17.00] },
      business: { f: [10.90, 14.50], x: [11.90, 15.50] },
      vehicle: { f: [8.70, 10.90], x: [8.75, 10.25] }
    },
    tc: 'Baroda Home Loan: EBLR-linked. Waiver of PF on certain schemes.',
    offer: '🎁 Zero processing fee on Baroda Auto & Home Loans.'
  },
  {
    name: 'Canara Bank', short: 'Canara', type: 'psu', emoji: '🏛️', color: '#3C6E71', url: 'https://canarabank.com',
    rates: {
      home: { f: [7.15, 9.70], x: [8.90, 11.40] },
      lap: { f: [9.00, 12.50], x: [10.00, 13.50] },
      personal: { f: [11.00, 15.50], x: [12.00, 16.00] },
      business: { f: [10.85, 14.00], x: [11.85, 15.00] },
      vehicle: { f: [8.80, 10.30], x: [9.40, 11.20] }
    },
    tc: 'Canara Home: EBLR-linked floating. Special scheme for pensioners.',
    offer: '🎁 Special discount on processing charges.'
  },
  {
    name: 'Union Bank', short: 'Union', type: 'psu', emoji: '🏛️', color: '#00669E', url: 'https://unionbankofindia.co.in',
    rates: {
      home: { f: [7.25, 9.85], x: [8.95, 11.45] },
      lap: { f: [9.10, 12.60], x: [10.10, 13.60] },
      personal: { f: [11.20, 15.00], x: [11.40, 15.50] },
      business: { f: [10.80, 14.20], x: [11.80, 15.20] },
      vehicle: { f: [8.70, 10.40], x: [9.30, 11.10] }
    },
    tc: 'Union Home: EBLR-linked. Concession for govt employees.',
    offer: '🎁 Concession of 0.05% for green-certified homes.'
  },
  {
    name: 'Bank of India', short: 'BOI', type: 'psu', emoji: '🏛️', color: '#003399', url: 'https://bankofindia.co.in',
    rates: {
      home: { f: [8.30, 10.50], x: [9.30, 11.50] },
      lap: { f: [8.80, 11.50], x: [9.80, 12.50] },
      personal: { f: [11.50, 15.00], x: [11.90, 15.50] },
      business: { f: [11.00, 13.50], x: [12.00, 15.00] },
      vehicle: { f: [8.80, 10.40], x: [9.40, 11.20] }
    },
    tc: 'PSU bank with pan-India reach. PMAY and Pradhan Mantri Awas Yojana eligible.',
    offer: '🎁 Zero processing fee for defence & govt employees.'
  },
  {
    name: 'Indian Bank', short: 'Indian', type: 'psu', emoji: '🏛️', color: '#1A237E', url: 'https://indianbank.in',
    rates: {
      home: { f: [8.40, 10.60], x: [9.20, 11.40] },
      lap: { f: [8.90, 11.60], x: [9.90, 12.60] },
      personal: { f: [11.80, 15.50], x: [12.50, 16.00] },
      business: { f: [11.20, 13.80], x: [12.20, 15.20] },
      vehicle: { f: [9.00, 10.60], x: [9.60, 11.40] }
    },
    tc: 'Strong South India presence. IB Home Loan — interest concession for women applicants.',
    offer: '🏠 Special rates for NRIs and PIOs.'
  },
  {
    name: 'Central Bank of India', short: 'CBI', type: 'psu', emoji: '🏛️', color: '#004B87', url: 'https://centralbankofindia.co.in',
    rates: {
      home: { f: [7.25, 9.90], x: [8.85, 11.50] },
      lap: { f: [9.15, 12.40], x: [10.15, 13.40] },
      personal: { f: [11.00, 15.25], x: [12.00, 16.00] },
      business: { f: [10.90, 14.25], x: [11.90, 15.25] },
      vehicle: { f: [8.85, 10.50], x: [9.45, 11.25] }
    },
    tc: 'Cent Home Loan with low margin requirement. Quick sanctioning for pre-cleared builders.',
    offer: '🎁 100% waiver of documentation charges.'
  },
  {
    name: 'Indian Overseas Bank', short: 'IOB', type: 'psu', emoji: '🏛️', color: '#002B49', url: 'https://iob.in',
    rates: {
      home: { f: [7.35, 9.80], x: [8.90, 11.40] },
      lap: { f: [9.20, 12.50], x: [10.20, 13.50] },
      personal: { f: [11.25, 15.50], x: [12.25, 16.50] },
      business: { f: [11.00, 14.50], x: [12.00, 15.50] },
      vehicle: { f: [8.90, 10.60], x: [9.50, 11.35] }
    },
    tc: 'Subha Gruha Home Loan: Flexible repayment options up to 30 years.',
    offer: '🎁 Low processing charge of only 0.25%.'
  },
  {
    name: 'UCO Bank', short: 'UCO', type: 'psu', emoji: '🏛️', color: '#0072CE', url: 'https://ucobank.com',
    rates: {
      home: { f: [7.20, 9.75], x: [8.80, 11.30] },
      lap: { f: [9.10, 12.30], x: [10.10, 13.30] },
      personal: { f: [11.10, 15.20], x: [12.10, 16.00] },
      business: { f: [10.85, 14.10], x: [11.85, 15.10] },
      vehicle: { f: [8.80, 10.45], x: [9.40, 11.15] }
    },
    tc: 'UCO Shelter scheme with doorstep loan pickup.',
    offer: '🎁 Special discount on UCO Car and Home loans.'
  },
  {
    name: 'Bank of Maharashtra', short: 'BOM', type: 'psu', emoji: '🏛️', color: '#005A9C', url: 'https://bankofmaharashtra.in',
    rates: {
      home: { f: [7.15, 9.60], x: [8.70, 11.15] },
      lap: { f: [8.95, 12.10], x: [9.95, 13.10] },
      personal: { f: [10.80, 14.75], x: [11.80, 15.50] },
      business: { f: [10.75, 13.90], x: [11.75, 14.90] },
      vehicle: { f: [8.70, 10.30], x: [9.30, 11.00] }
    },
    tc: 'Maha Super Housing Loan: Lowest ROI for credit score 775+.',
    offer: '🎁 Zero processing fee on all retail loans.'
  },
  {
    name: 'Punjab & Sind Bank', short: 'PSB', type: 'psu', emoji: '🏛️', color: '#7B1FA2', url: 'https://punjabandsindbank.co.in',
    rates: {
      home: { f: [8.50, 10.70], x: [9.30, 11.60] },
      lap: { f: [9.00, 11.80], x: [10.00, 12.80] },
      personal: { f: [11.50, 15.20], x: [12.00, 15.80] },
      business: { f: [11.00, 14.00], x: [12.00, 15.50] },
      vehicle: { f: [9.00, 10.80], x: [9.60, 11.40] }
    },
    tc: 'North India focused PSU. PMAY eligible. Repo-linked floating rates.',
    offer: '🌾 Priority sector concessional rates available.'
  },
  {
    name: 'IDBI Bank', short: 'IDBI', type: 'psu', emoji: '🏛️', color: '#003B5C', url: 'https://idbi.com',
    rates: {
      home: { f: [8.40, 10.75], x: [9.40, 11.75] },
      lap: { f: [9.00, 12.00], x: [10.00, 13.00] },
      personal: { f: [11.50, 16.00], x: [12.00, 16.50] },
      business: { f: [12.00, 16.50], x: [12.50, 17.00] },
      vehicle: { f: [8.90, 10.50], x: [9.50, 11.50] }
    },
    tc: 'Government-backed bank. Strong retail banking presence. OD facility on home loans.',
    offer: '🏛️ Subsidised rates under PMAY scheme.'
  },
  {
    name: 'IDFC First Bank', short: 'IDFC', type: 'private', emoji: '🏦', color: '#7B2D8B', url: 'https://idfcfirstbank.com',
    rates: {
      home: { f: [7.85, 9.75], x: [9.25, 11.25] },
      lap: { f: [9.50, 13.00], x: [10.50, 14.00] },
      personal: { f: [10.49, 23.00], x: [11.00, 24.00] },
      business: { f: [11.50, 22.00], x: [12.50, 22.00] },
      vehicle: { f: [9.00, 11.50], x: [9.50, 12.00] }
    },
    tc: 'Fully digital bank. Zero FCL charges on home loans.',
    offer: '🎁 Zero processing fee on home loan balance transfers.'
  },
  {
    name: 'Yes Bank', short: 'Yes', type: 'private', emoji: '🏦', color: '#00518F', url: 'https://yesbank.in',
    rates: {
      home: { f: [7.45, 10.10], x: [9.10, 11.80] },
      lap: { f: [9.30, 13.20], x: [10.30, 14.20] },
      personal: { f: [10.99, 22.50], x: [11.50, 23.00] },
      business: { f: [11.75, 21.50], x: [12.50, 22.00] },
      vehicle: { f: [9.20, 11.20], x: [9.75, 11.90] }
    },
    tc: 'Repo-linked floating rates. Quick digital sanction for salaried.',
    offer: '🎁 Instant digital pre-approval.'
  },
  {
    name: 'IndusInd Bank', short: 'IndusInd', type: 'private', emoji: '🏦', color: '#9E1B32', url: 'https://indusind.com',
    rates: {
      home: { f: [7.55, 10.20], x: [9.15, 11.90] },
      lap: { f: [9.40, 13.30], x: [10.40, 14.30] },
      personal: { f: [10.49, 23.50], x: [11.25, 24.00] },
      business: { f: [11.90, 22.50], x: [12.50, 23.00] },
      vehicle: { f: [8.95, 11.30], x: [9.50, 12.00] }
    },
    tc: 'EBLR-linked. Flexible repayment options for self-employed.',
    offer: '🎁 Special rates for premium banking customers.'
  },
  {
    name: 'Federal Bank', short: 'Federal', type: 'private', emoji: '🏦', color: '#003DA5', url: 'https://federalbank.co.in',
    rates: {
      home: { f: [7.65, 10.05], x: [9.20, 11.70] },
      lap: { f: [9.35, 12.90], x: [10.35, 13.90] },
      personal: { f: [11.49, 19.50], x: [12.00, 20.00] },
      business: { f: [11.60, 20.50], x: [12.20, 21.00] },
      vehicle: { f: [9.05, 10.90], x: [9.60, 11.50] }
    },
    tc: 'EBLR-linked. Strong presence in South India. Quick NRI home loans.',
    offer: '🎁 Express digital sanction for NRIs.'
  },
  {
    name: 'RBL Bank', short: 'RBL', type: 'private', emoji: '🏦', color: '#E31837', url: 'https://rblbank.com',
    rates: {
      home: { f: [9.00, 12.00], x: [10.00, 13.00] },
      lap: { f: [9.50, 13.50], x: [10.50, 14.50] },
      personal: { f: [13.50, 22.00], x: [14.00, 23.00] },
      business: { f: [13.50, 21.50], x: [14.00, 22.00] },
      vehicle: { f: [10.00, 13.50], x: [10.50, 14.00] }
    },
    tc: 'Mid-sized private bank. Fast approvals. Strong retail loan products.',
    offer: '🎁 Cashback on EMI for first 3 months.'
  },
  {
    name: 'South Indian Bank', short: 'SIB', type: 'private', emoji: '🏦', color: '#C8102E', url: 'https://southindianbank.com',
    rates: {
      home: { f: [7.70, 10.25], x: [9.15, 11.75] },
      lap: { f: [9.30, 12.80], x: [10.30, 13.80] },
      personal: { f: [11.50, 18.50], x: [12.50, 19.50] },
      business: { f: [11.75, 19.00], x: [12.50, 20.00] },
      vehicle: { f: [9.10, 11.20], x: [9.70, 11.80] }
    },
    tc: 'SIB Home: Affordable interest rates linked to Repo rate. Special schemes for NRIs.',
    offer: '🎁 Concessional processing fees for salaried women.'
  },
  {
    name: 'Karur Vysya Bank', short: 'KVB', type: 'private', emoji: '🏦', color: '#1B5E20', url: 'https://kvb.co.in',
    rates: {
      home: { f: [8.75, 11.00], x: [9.75, 12.00] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: [11.00, 17.50], x: [11.50, 18.00] },
      business: { f: [11.50, 18.50], x: [12.00, 19.00] },
      vehicle: { f: [9.00, 12.50], x: [10.00, 13.50] }
    },
    tc: 'Karur Vysya Bank — trusted South Indian bank established in 1916.',
    offer: '🏦 Preferential rates for employees of reputed companies.'
  },
  {
    name: 'City Union Bank', short: 'CUB', type: 'private', emoji: '🏛', color: '#4E342E', url: 'https://cityunionbank.com',
    rates: {
      home: { f: [9.00, 11.50], x: [10.00, 12.50] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: [11.50, 19.00], x: [12.00, 20.00] },
      business: { f: [11.50, 19.50], x: [12.00, 20.00] },
      vehicle: { f: [9.25, 12.00], x: [10.25, 13.00] }
    },
    tc: 'City Union Bank — premier private bank from Kumbakonam, Tamil Nadu.',
    offer: '🏛 Quick turnaround for SME and business loans.'
  },
  {
    name: 'Karnataka Bank', short: 'KarBank', type: 'private', emoji: '🏦', color: '#1565C0', url: 'https://karnatakabank.com',
    rates: {
      home: { f: [8.75, 11.10], x: [9.75, 12.10] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: [12.50, 17.50], x: [13.50, 18.00] },
      business: { f: [11.50, 14.50], x: [12.50, 15.50] },
      vehicle: { f: [9.25, 11.00], x: [9.75, 11.75] }
    },
    tc: 'South India community bank. Strong MSE lending. KBL Xpress loan available.',
    offer: '🏦 Special rates for diaspora members.'
  },
  {
    name: 'Bandhan Bank', short: 'Bandhan', type: 'private', emoji: '🤝', color: '#D50000', url: 'https://bandhanbank.com',
    rates: {
      home: { f: [9.16, 13.33], x: [10.16, 14.33] },
      lap: { f: [9.75, 13.50], x: [10.75, 14.50] },
      personal: { f: [14.00, 23.00], x: [15.00, 24.00] },
      business: { f: [15.00, 25.00], x: [16.00, 26.00] },
      vehicle: { f: [9.50, 12.50], x: [10.00, 13.00] }
    },
    tc: 'Bandhan Bank — commercial bank with microfinance roots, strong in East India.',
    offer: '🤝 Affordable housing specialist — home loans from ₹2 lakh.'
  },
  {
    name: 'CSB Bank', short: 'CSB', type: 'private', emoji: '🏦', color: '#D32F2F', url: 'https://csb.co.in',
    rates: {
      home: { f: [8.50, 11.25], x: [9.50, 12.25] },
      lap: { f: [9.40, 13.00], x: [10.40, 14.00] },
      personal: { f: [12.00, 19.50], x: [13.00, 20.50] },
      business: { f: [12.00, 19.00], x: [12.75, 20.00] },
      vehicle: { f: [9.20, 11.75], x: [9.80, 12.25] }
    },
    tc: 'CSB Bank (formerly Catholic Syrian Bank) — backed by Fairfax Financial.',
    offer: '🎁 Fast gold & mortgage loan approvals.'
  },
  {
    name: 'DCB Bank', short: 'DCB', type: 'private', emoji: '🏦', color: '#00838F', url: 'https://dcbbank.com',
    rates: {
      home: { f: [8.65, 11.50], x: [9.65, 12.50] },
      lap: { f: [9.50, 13.25], x: [10.50, 14.25] },
      personal: { f: [12.50, 21.00], x: [13.50, 22.00] },
      business: { f: [12.25, 20.50], x: [13.00, 21.50] },
      vehicle: { f: [9.35, 12.00], x: [10.00, 12.50] }
    },
    tc: 'DCB Bank — modern private bank with extensive MSME and NRI solutions.',
    offer: '🎁 DCB Suraksha home loan with life insurance cover.'
  },
  {
    name: 'Tamilnad Mercantile Bank', short: 'TMB', type: 'private', emoji: '🏦', color: '#2E7D32', url: 'https://tmb.in',
    rates: {
      home: { f: [8.60, 10.95], x: [9.60, 11.95] },
      lap: { f: [9.25, 12.25], x: [10.25, 13.25] },
      personal: { f: [11.75, 17.50], x: [12.50, 18.00] },
      business: { f: [11.50, 16.50], x: [12.25, 17.50] },
      vehicle: { f: [9.15, 11.20], x: [9.75, 11.80] }
    },
    tc: 'TMB Housing Loan: Low margin requirements and speedy processing.',
    offer: '🎁 Concession for agricultural & rural borrowers.'
  },
  {
    name: 'Jammu & Kashmir Bank', short: 'JKB', type: 'private', emoji: '🏔️', color: '#005088', url: 'https://jkbank.com',
    rates: {
      home: { f: [8.35, 10.50], x: [9.35, 11.50] },
      lap: { f: [9.00, 12.00], x: [10.00, 13.00] },
      personal: { f: [11.25, 16.00], x: [12.00, 16.75] },
      business: { f: [11.00, 15.00], x: [11.75, 16.00] },
      vehicle: { f: [8.95, 10.75], x: [9.50, 11.40] }
    },
    tc: 'JK Bank Gharonda Scheme: Special concessions in J&K, Ladakh and metro centers.',
    offer: '🎁 Low processing fee of 0.20% on housing loans.'
  },
  {
    name: 'HSBC India', short: 'HSBC', type: 'private', emoji: '🌐', color: '#DB0011', url: 'https://hsbc.co.in',
    rates: {
      home: { f: [8.50, 10.85], x: [9.50, 11.85] },
      lap: { f: [9.25, 12.50], x: [10.25, 13.50] },
      personal: { f: [10.25, 17.00], x: [10.75, 17.50] },
      business: { f: [11.50, 17.50], x: [12.00, 18.00] },
      vehicle: { f: [9.00, 11.00], x: [9.50, 11.50] }
    },
    tc: 'Global bank with strong NRI lending. Smart EMI options. Doorstep banking.',
    offer: '🌐 Preferential rates for NRI & Premier banking customers.'
  },
  {
    name: 'Standard Chartered', short: 'StanC', type: 'private', emoji: '🌐', color: '#006272', url: 'https://sc.com/in',
    rates: {
      home: { f: [8.75, 11.00], x: [9.75, 12.00] },
      lap: { f: [9.50, 12.75], x: [10.50, 13.75] },
      personal: { f: [11.00, 17.50], x: [11.49, 18.00] },
      business: { f: [12.50, 19.50], x: [13.00, 20.00] },
      vehicle: { f: [9.25, 11.50], x: [9.75, 12.00] }
    },
    tc: 'Premium private bank. Excellent digital experience. MortgageOne offsetting account.',
    offer: '🎁 Fee waiver for Priority banking customers.'
  },
  {
    name: 'DBS Bank India', short: 'DBS', type: 'private', emoji: '🌏', color: '#E50000', url: 'https://dbsbank.in',
    rates: {
      home: { f: [8.75, 10.25], x: [9.75, 11.25] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: [11.50, 20.00], x: [12.00, 21.00] },
      business: { f: [12.50, 18.50], x: [13.00, 19.00] },
      vehicle: { f: [9.00, 11.50], x: [9.50, 12.00] }
    },
    tc: 'DBS Bank India — Singapore\'s DBS Group with full digital banking suite in India.',
    offer: '🌏 Fully digital home loan with dedicated Relationship Manager.'
  },
  {
    name: 'Saraswat Bank', short: 'Saraswat', type: 'private', emoji: '🏦', color: '#0D47A1', url: 'https://saraswatbank.com',
    rates: {
      home: { f: [8.60, 10.90], x: [9.50, 11.90] },
      lap: { f: [9.10, 12.00], x: [10.00, 13.00] },
      personal: { f: [12.50, 16.50], x: [13.00, 17.00] },
      business: { f: [11.00, 14.00], x: [12.00, 15.00] },
      vehicle: { f: [9.00, 10.75], x: [9.60, 11.50] }
    },
    tc: 'Cooperative bank with 100+ years of history. Strong Maharashtra & Goa presence.',
    offer: '🎁 Loyalty benefits for existing account holders.'
  },

  // --- 2. Small Finance Banks (SFBs) ---
  {
    name: 'AU Small Finance', short: 'AU SFB', type: 'small', emoji: '🏦', color: '#5E2D91', url: 'https://aubank.in',
    rates: {
      home: { f: [8.50, 12.00], x: [9.75, 13.00] },
      lap: { f: [9.75, 14.50], x: [10.75, 15.50] },
      personal: { f: [11.50, 23.00], x: [11.99, 24.00] },
      business: { f: [12.00, 22.50], x: [12.50, 23.00] },
      vehicle: { f: [9.50, 12.50], x: [10.00, 13.00] }
    },
    tc: 'Small finance bank. Flexible eligibility for self-employed and informal income.',
    offer: '🎁 Tailored products for first-time borrowers.'
  },
  {
    name: 'Equitas Small Finance Bank', short: 'Equitas SFB', type: 'small', emoji: '🏦', color: '#00838F', url: 'https://equitasbank.com',
    rates: {
      home: { f: [9.25, 13.50], x: [10.25, 14.50] },
      lap: { f: [10.00, 14.00], x: [11.00, 15.00] },
      personal: { f: [13.50, 21.00], x: [14.00, 22.00] },
      business: { f: [14.50, 23.00], x: [15.00, 24.00] },
      vehicle: { f: [9.50, 12.50], x: [10.25, 13.25] }
    },
    tc: 'Equitas Small Finance Bank — digital banking with inclusive finance for all.',
    offer: '💰 Priority queue for existing account holders.'
  },
  {
    name: 'Ujjivan Small Finance Bank', short: 'Ujjivan SFB', type: 'small', emoji: '🌟', color: '#0277BD', url: 'https://ujjivansfb.in',
    rates: {
      home: { f: [9.50, 13.00], x: [10.50, 14.00] },
      lap: { f: [10.25, 13.50], x: [11.25, 14.50] },
      personal: { f: [15.00, 25.00], x: [16.00, 26.00] },
      business: { f: [15.00, 25.00], x: [16.00, 26.00] },
      vehicle: { f: [10.00, 13.00], x: [10.75, 13.75] }
    },
    tc: 'Ujjivan Small Finance Bank — growing pan-India network with digital onboarding.',
    offer: '🌟 Digital onboarding and disbursal in 48 hours.'
  },
  {
    name: 'Jana Small Finance Bank', short: 'Jana SFB', type: 'small', emoji: '🏢', color: '#558B2F', url: 'https://janabank.com',
    rates: {
      home: { f: [9.90, 14.00], x: [10.90, 15.00] },
      lap: { f: [10.50, 14.50], x: [11.50, 15.50] },
      personal: { f: [16.00, 26.00], x: [17.00, 27.00] },
      business: { f: [14.00, 25.00], x: [15.00, 26.00] },
      vehicle: { f: [10.25, 13.50], x: [11.00, 14.00] }
    },
    tc: 'Jana Small Finance Bank — microfinance leader turned SFB with MSME focus.',
    offer: '🏢 Special rates for MSME sector borrowers.'
  },
  {
    name: 'ESAF Small Finance Bank', short: 'ESAF SFB', type: 'small', emoji: '🌱', color: '#2E7D32', url: 'https://esafbank.com',
    rates: {
      home: { f: [10.00, 14.00], x: [11.00, 15.00] },
      lap: { f: [10.50, 14.50], x: [11.50, 15.50] },
      personal: { f: [15.00, 23.00], x: [16.00, 24.00] },
      business: { f: [14.50, 23.50], x: [15.00, 24.00] },
      vehicle: { f: [10.50, 13.50], x: [11.25, 14.25] }
    },
    tc: 'ESAF Small Finance Bank — serving rural and semi-urban India.',
    offer: '🌱 Micro-loans for self-employed and rural borrowers.'
  },
  {
    name: 'Suryoday Small Finance Bank', short: 'Suryoday SFB', type: 'small', emoji: '☀️', color: '#FF6F00', url: 'https://suryodaybank.com',
    rates: {
      home: { f: [9.75, 13.75], x: [10.75, 14.75] },
      lap: { f: [10.50, 14.25], x: [11.50, 15.25] },
      personal: { f: [15.50, 25.00], x: [16.50, 26.00] },
      business: { f: [14.50, 24.50], x: [15.50, 25.50] },
      vehicle: { f: [10.20, 13.50], x: [11.00, 14.00] }
    },
    tc: 'Suryoday SFB: Inclusive banking with fast digital sanction.',
    offer: '☀️ Affordable home loans for new-to-credit buyers.'
  },
  {
    name: 'Utkarsh Small Finance Bank', short: 'Utkarsh SFB', type: 'small', emoji: '🌾', color: '#1B5E20', url: 'https://utkarsh.bank',
    rates: {
      home: { f: [9.80, 13.90], x: [10.80, 14.90] },
      lap: { f: [10.60, 14.30], x: [11.60, 15.30] },
      personal: { f: [15.75, 25.50], x: [16.75, 26.50] },
      business: { f: [14.75, 24.75], x: [15.75, 25.75] },
      vehicle: { f: [10.30, 13.60], x: [11.10, 14.10] }
    },
    tc: 'Utkarsh SFB: Deep reach across UP, Bihar, and North-Central India.',
    offer: '🌾 Concessional rates for rural enterprise development.'
  },

  // --- 3. Top NBFCs and Housing Finance Companies (HFCs) ---
  {
    name: 'Bajaj Finserv', short: 'Bajaj', type: 'nbfc', emoji: '🏢', color: '#0099CC', url: 'https://bajajfinserv.in',
    rates: {
      home: { f: [7.25, 10.50], x: [9.00, 12.00] },
      lap: { f: [9.00, 14.00], x: [10.00, 15.00] },
      personal: { f: [10.50, 25.00], x: [10.99, 26.00] },
      business: { f: [11.00, 26.00], x: [12.00, 26.00] },
      vehicle: { f: [8.50, 10.50], x: [8.80, 11.00] }
    },
    tc: 'PLR-linked. Strong digital platform. Balance transfer available.',
    offer: '🎁 Pre-approved personal loans up to ₹40L for eligible customers.'
  },
  {
    name: 'Bajaj Housing Finance', short: 'BJF Housing', type: 'nbfc', emoji: '🏠', color: '#E65100', url: 'https://bajajhousingfinance.in',
    rates: {
      home: { f: [8.50, 14.00], x: [9.50, 15.00] },
      lap: { f: [9.00, 14.50], x: [10.00, 15.50] },
      personal: { f: [11.50, 20.00], x: [12.50, 21.00] },
      business: { f: [12.50, 21.00], x: [13.00, 22.00] },
      vehicle: { f: [9.00, 11.50], x: [9.50, 12.00] }
    },
    tc: 'Bajaj Housing Finance Ltd — fast-growing HFC backed by Bajaj Finance.',
    offer: '🏠 Instant in-principle approval in 5 minutes online.'
  },
  {
    name: 'PNB Housing', short: 'PNBHFL', type: 'nbfc', emoji: '🏢', color: '#CC0000', url: 'https://pnbhousing.com',
    rates: {
      home: { f: [7.50, 13.45], x: [9.00, 14.00] },
      lap: { f: [8.50, 13.50], x: [9.50, 14.50] },
      personal: { f: [11.75, 16.00], x: [12.75, 17.50] },
      business: { f: [12.75, 18.00], x: [14.00, 19.50] },
      vehicle: { f: [9.50, 12.75], x: [10.50, 13.75] }
    },
    tc: 'PLR-linked rates. Specializes in affordable and mid-segment housing.',
    offer: '🎁 Custom tenure plans with low processing charges.'
  },
  {
    name: 'LIC Housing', short: 'LICHFL', type: 'nbfc', emoji: '🏢', color: '#006400', url: 'https://lichousing.com',
    rates: {
      home: { f: [7.50, 10.35], x: [9.50, 12.00] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: [11.25, 15.50], x: [12.25, 16.75] },
      business: { f: [12.00, 17.50], x: [13.25, 18.75] },
      vehicle: { f: [9.00, 11.80], x: [9.90, 12.80] }
    },
    tc: 'PLR-linked. Strong tier-2/3 city presence. 5 bps for women.',
    offer: '🎁 Griha Lakshmi: Special rate concession for women borrowers.'
  },
  {
    name: 'Tata Capital', short: 'Tata', type: 'nbfc', emoji: '🏢', color: '#0A2463', url: 'https://tatacapital.com',
    rates: {
      home: { f: [8.50, 11.00], x: [9.50, 12.00] },
      lap: { f: [9.00, 13.50], x: [10.00, 14.50] },
      personal: { f: [10.50, 23.00], x: [10.99, 24.00] },
      business: { f: [11.50, 23.00], x: [12.00, 24.00] },
      vehicle: { f: [8.75, 11.00], x: [9.00, 11.50] }
    },
    tc: 'Digital loan processing. Same-day approval for pre-qualified customers.',
    offer: '🎁 Digital home loans with doorstep documentation.'
  },
  {
    name: 'Tata Capital Housing Finance', short: 'TCHF', type: 'nbfc', emoji: '🏠', color: '#B71C1C', url: 'https://tatacapital.com',
    rates: {
      home: { f: [8.75, 11.00], x: [9.75, 12.00] },
      lap: { f: [9.25, 12.50], x: [10.25, 13.50] },
      personal: { f: [11.00, 20.00], x: [12.00, 21.00] },
      business: { f: [12.00, 21.00], x: [13.00, 22.00] },
      vehicle: { f: [9.00, 11.50], x: [9.75, 12.00] }
    },
    tc: 'Tata Capital Housing Finance — part of the iconic Tata Group.',
    offer: '🏠 Balance transfer with top-up facility available.'
  },
  {
    name: 'Aditya Birla Capital', short: 'ABCL', type: 'nbfc', emoji: '🏢', color: '#C8102E', url: 'https://adityabirlacapital.com',
    rates: {
      home: { f: [8.00, 11.50], x: [9.50, 12.50] },
      lap: { f: [9.25, 14.00], x: [10.25, 15.00] },
      personal: { f: [10.50, 25.00], x: [10.99, 26.00] },
      business: { f: [11.50, 23.50], x: [12.00, 24.00] },
      vehicle: { f: [8.85, 11.20], x: [9.10, 11.60] }
    },
    tc: 'NBFC with flexible eligibility. Good for self-employed & new-to-credit.',
    offer: '🎁 Doorstep service and flexible income documentation.'
  },
  {
    name: 'Aditya Birla Housing Finance', short: 'ABHFL', type: 'nbfc', emoji: '🏗', color: '#AD1457', url: 'https://adityabirlahomeloans.com',
    rates: {
      home: { f: [8.60, 11.50], x: [9.60, 12.50] },
      lap: { f: [9.10, 12.00], x: [10.10, 13.00] },
      personal: { f: [11.50, 20.00], x: [12.50, 21.00] },
      business: { f: [12.00, 19.50], x: [13.00, 20.00] },
      vehicle: { f: [9.10, 11.50], x: [9.60, 12.00] }
    },
    tc: 'Aditya Birla Housing Finance — flagship HFC of the Aditya Birla Group.',
    offer: '🏗 Flexible repayment with top-up loan facility.'
  },
  {
    name: 'L&T Finance', short: 'L&T', type: 'nbfc', emoji: '🏢', color: '#0C3C60', url: 'https://ltfinance.com',
    rates: {
      home: { f: [8.25, 11.75], x: [9.75, 12.75] },
      lap: { f: [9.50, 14.25], x: [10.50, 15.25] },
      personal: { f: [11.00, 24.00], x: [11.50, 25.00] },
      business: { f: [12.00, 23.50], x: [12.50, 24.00] },
      vehicle: { f: [9.00, 11.50], x: [9.25, 12.00] }
    },
    tc: 'NBFC. Quick approvals with minimal documentation for small-ticket loans.',
    offer: '🎁 24-hour disbursal promise on micro loans.'
  },
  {
    name: 'Piramal Finance', short: 'Piramal', type: 'nbfc', emoji: '🏢', color: '#7B1FA2', url: 'https://piramalfinance.com',
    rates: {
      home: { f: [9.50, 13.00], x: [10.50, 14.00] },
      lap: { f: [10.00, 14.50], x: [11.00, 15.50] },
      personal: { f: [13.00, 23.00], x: [14.00, 24.00] },
      business: { f: [12.50, 21.00], x: [13.50, 22.00] },
      vehicle: { f: [9.50, 12.50], x: [10.00, 13.00] }
    },
    tc: 'Piramal Capital & Housing Finance — one of India\'s leading diversified NBFCs.',
    offer: '🏠 Doorstep service for home loan applications.'
  },
  {
    name: 'Mahindra Finance', short: 'Mahindra', type: 'nbfc', emoji: '🏢', color: '#E53935', url: 'https://mahindrafinance.com',
    rates: {
      home: { f: null, x: null },
      lap: { f: [10.50, 15.00], x: [11.50, 16.00] },
      personal: { f: [15.00, 25.00], x: [16.00, 26.00] },
      business: { f: [13.50, 21.00], x: [14.00, 22.00] },
      vehicle: { f: [9.50, 14.00], x: [10.50, 15.00] }
    },
    tc: 'Rural-focused NBFC. Strong in vehicle and SME financing. Pan-India rural reach.',
    offer: '🚗 Specialist in tractor, CV and two-wheeler loans.'
  },
  {
    name: 'Muthoot Finance', short: 'Muthoot', type: 'nbfc', emoji: '🏢', color: '#F9A825', url: 'https://muthootfinance.com',
    rates: {
      home: { f: null, x: null },
      lap: { f: [10.00, 14.50], x: [11.00, 15.50] },
      personal: { f: [13.00, 23.00], x: [14.00, 24.00] },
      business: { f: [13.50, 21.00], x: [14.00, 22.00] },
      vehicle: { f: [9.75, 13.00], x: [10.50, 13.75] }
    },
    tc: 'Gold loan and diversified NBFC. Quick disbursal for LAP against gold and property.',
    offer: '🏅 Quick-disbursal loan — disbursed in 24 hours.'
  },
  {
    name: 'Manappuram Finance', short: 'Manappuram', type: 'nbfc', emoji: '🥇', color: '#F9A825', url: 'https://manappuram.com',
    rates: {
      home: { f: [9.80, 13.75], x: [10.80, 14.75] },
      lap: { f: [10.25, 14.75], x: [11.25, 15.75] },
      personal: { f: [11.50, 28.00], x: [12.00, 29.00] },
      business: { f: [13.50, 26.00], x: [14.00, 27.00] },
      vehicle: { f: [10.00, 13.50], x: [10.75, 14.25] }
    },
    tc: 'Manappuram Finance Ltd — gold loan leader expanding into personal loans.',
    offer: '🥇 Gold-backed personal loan — lowest rates in segment.'
  },
  {
    name: 'Chola Finance', short: 'Chola', type: 'nbfc', emoji: '🏢', color: '#6A1B9A', url: 'https://cholamandalam.com',
    rates: {
      home: { f: [9.25, 12.00], x: [10.25, 13.00] },
      lap: { f: [9.75, 13.50], x: [10.75, 14.50] },
      personal: { f: [14.50, 23.50], x: [15.00, 24.00] },
      business: { f: [13.50, 21.00], x: [14.00, 22.00] },
      vehicle: { f: [9.25, 13.00], x: [10.25, 14.00] }
    },
    tc: 'Cholamandalam Investment & Finance. Diversified NBFC from Murugappa Group. Strong used vehicle loans.',
    offer: '🚗 Best-in-class used car and CV loan products.'
  },
  {
    name: 'Shriram Housing Finance', short: 'Shriram HF', type: 'nbfc', emoji: '🏢', color: '#FF6F00', url: 'https://shriramhousingfinance.com',
    rates: {
      home: { f: [9.50, 13.50], x: [10.50, 14.50] },
      lap: { f: [10.00, 14.50], x: [11.00, 15.50] },
      personal: { f: [12.50, 20.00], x: [13.50, 21.00] },
      business: { f: [12.50, 18.50], x: [13.00, 19.00] },
      vehicle: { f: [9.75, 13.50], x: [10.50, 14.25] }
    },
    tc: 'Affordable housing finance specialist. Tier 2 & 3 city expertise. Informal income accepted.',
    offer: '🏠 EWS & LIG segment specialists under PMAY.'
  },
  {
    name: 'Shriram Finance', short: 'Shriram', type: 'nbfc', emoji: '🏭', color: '#6A1B9A', url: 'https://shriramfinance.in',
    rates: {
      home: { f: [10.00, 14.00], x: [11.00, 15.00] },
      lap: { f: [10.50, 14.50], x: [11.50, 15.50] },
      personal: { f: [14.50, 25.50], x: [15.00, 26.00] },
      business: { f: [13.50, 23.50], x: [14.00, 24.00] },
      vehicle: { f: [10.00, 16.00], x: [11.00, 17.00] }
    },
    tc: 'Shriram Finance Ltd — India\'s largest vehicle financier. Strong in used CVs.',
    offer: '🏭 India\'s largest used CV and vehicle loan lender.'
  },
  {
    name: 'GIC Housing Finance', short: 'GIC HF', type: 'nbfc', emoji: '🏢', color: '#1B5E20', url: 'https://gichfindia.com',
    rates: {
      home: { f: [9.00, 11.50], x: [10.00, 12.50] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: [12.00, 17.00], x: [13.00, 18.00] },
      business: { f: [12.50, 18.00], x: [13.50, 19.00] },
      vehicle: { f: [9.50, 12.00], x: [10.25, 12.75] }
    },
    tc: 'General Insurance Corporation subsidiary. Focus on salaried segment. Quick processing.',
    offer: '🎁 Insurance bundled at preferential group rates.'
  },
  {
    name: 'Aavas Financiers', short: 'Aavas', type: 'nbfc', emoji: '🏢', color: '#AD1457', url: 'https://aavas.in',
    rates: {
      home: { f: [10.50, 14.00], x: [11.50, 15.00] },
      lap: { f: [11.00, 15.00], x: [12.00, 16.00] },
      personal: { f: [13.50, 21.00], x: [14.50, 22.00] },
      business: { f: [13.50, 19.50], x: [14.00, 20.00] },
      vehicle: { f: [10.00, 13.50], x: [10.75, 14.25] }
    },
    tc: 'Rural and semi-urban housing finance. Serves customers without formal income proof.',
    offer: '🌾 Serving Bharat — rural housing specialists.'
  },
  {
    name: 'Home First Finance', short: 'HomeFirst', type: 'nbfc', emoji: '🏢', color: '#E65100', url: 'https://homefirstindia.com',
    rates: {
      home: { f: [10.25, 13.50], x: [11.25, 14.50] },
      lap: { f: [10.75, 14.00], x: [11.75, 15.00] },
      personal: { f: [13.00, 20.00], x: [14.00, 21.00] },
      business: { f: [13.00, 19.00], x: [14.00, 20.00] },
      vehicle: { f: [10.00, 13.00], x: [10.75, 13.75] }
    },
    tc: 'Affordable home loans for first-time buyers. Digital-first lending process.',
    offer: '🏠 ₹0 down payment schemes available.'
  },
  {
    name: 'Navi Housing Finance', short: 'Navi', type: 'nbfc', emoji: '📱', color: '#00695C', url: 'https://navi.com',
    rates: {
      home: { f: [8.99, 14.00], x: [9.99, 15.00] },
      lap: { f: null, x: null },
      personal: { f: [14.00, 44.00], x: [15.00, 45.00] },
      business: { f: [13.50, 25.00], x: [14.50, 26.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Navi Technologies — digital-first lender with instant in-app approvals.',
    offer: '📱 100% digital — home loan approved in minutes.'
  },
  {
    name: 'Sundaram Home Finance', short: 'Sundaram HF', type: 'nbfc', emoji: '🏛', color: '#4527A0', url: 'https://sundaramhome.in',
    rates: {
      home: { f: [8.50, 11.00], x: [9.50, 12.00] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: [11.50, 18.00], x: [12.50, 19.00] },
      business: { f: [12.00, 18.50], x: [13.00, 19.50] },
      vehicle: { f: [9.00, 11.50], x: [9.60, 12.10] }
    },
    tc: 'Sundaram Home Finance Ltd — 25+ years of experience in housing finance.',
    offer: '🏛 Special rates for women borrowers and senior citizens.'
  },
  {
    name: 'Repco Home Finance', short: 'Repco', type: 'nbfc', emoji: '🏠', color: '#37474F', url: 'https://repcohome.com',
    rates: {
      home: { f: [9.00, 12.00], x: [10.00, 13.00] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: [12.00, 18.00], x: [13.00, 19.00] },
      business: { f: [12.50, 19.00], x: [13.50, 20.00] },
      vehicle: { f: [9.50, 12.00], x: [10.15, 12.65] }
    },
    tc: 'Repco Home Finance Ltd — affordable housing focus in Tier 2/3 cities.',
    offer: '🏠 Specialises in affordable housing for the underserved.'
  },
  {
    name: 'Motilal Oswal Home Finance', short: 'MOHFL', type: 'nbfc', emoji: '📈', color: '#880E4F', url: 'https://motilaloswalhomefinance.com',
    rates: {
      home: { f: [9.75, 13.50], x: [10.75, 14.50] },
      lap: { f: [10.25, 14.00], x: [11.25, 15.00] },
      personal: { f: [12.50, 20.00], x: [13.50, 21.00] },
      business: { f: [13.00, 20.50], x: [14.00, 21.50] },
      vehicle: { f: [9.80, 12.50], x: [10.50, 13.25] }
    },
    tc: 'Motilal Oswal Home Finance — specialised in LAP against rented commercial property.',
    offer: '📈 Specialised LAP against rented commercial property.'
  },
  {
    name: 'IndoStar Capital Finance', short: 'IndoStar', type: 'nbfc', emoji: '⭐', color: '#1565C0', url: 'https://indostarcapital.com',
    rates: {
      home: { f: [9.50, 13.00], x: [10.50, 14.00] },
      lap: { f: [10.00, 14.00], x: [11.00, 15.00] },
      personal: { f: [13.00, 21.00], x: [14.00, 22.00] },
      business: { f: [13.50, 21.50], x: [14.00, 22.00] },
      vehicle: { f: [10.50, 15.00], x: [11.50, 16.00] }
    },
    tc: 'IndoStar Capital Finance — pan-India NBFC with housing for self-employed NTC.',
    offer: '⭐ Specialised housing loans for self-employed NTC.'
  },
  {
    name: 'Poonawalla Fincorp', short: 'Poonawalla', type: 'nbfc', emoji: '🪙', color: '#004A80', url: 'https://poonawallafincorp.com',
    rates: {
      home: { f: [8.95, 12.50], x: [9.95, 13.50] },
      lap: { f: [9.50, 13.50], x: [10.50, 14.50] },
      personal: { f: [10.99, 21.00], x: [11.99, 22.00] },
      business: { f: [11.50, 21.50], x: [12.50, 22.50] },
      vehicle: { f: [9.25, 12.00], x: [10.00, 12.75] }
    },
    tc: 'Poonawalla Fincorp — fast-growing digital NBFC under Cyrus Poonawalla Group.',
    offer: '🪙 100% digital personal & business loans with zero hidden charges.'
  },
  {
    name: 'LoanTap Financial', short: 'LoanTap', type: 'nbfc', emoji: '💡', color: '#0097A7', url: 'https://loantap.in',
    rates: {
      home: { f: [9.50, 13.50], x: [10.50, 14.50] },
      lap: { f: [10.00, 14.00], x: [11.00, 15.00] },
      personal: { f: [11.50, 23.00], x: [12.00, 24.00] },
      business: { f: [13.50, 25.00], x: [14.00, 26.00] },
      vehicle: { f: [9.80, 13.00], x: [10.50, 13.75] }
    },
    tc: 'LoanTap Credit Technologies — fintech NBFC for personal and business loans.',
    offer: '💡 Flexible EMI-free period and custom repayment terms.'
  },
  {
    name: 'Credit Access Grameen', short: 'CAG', type: 'nbfc', emoji: '🌾', color: '#F57F17', url: 'https://creditaccessgrameen.com',
    rates: {
      home: { f: [10.50, 14.50], x: [11.50, 15.50] },
      lap: { f: [11.00, 15.00], x: [12.00, 16.00] },
      personal: { f: [19.00, 25.00], x: [20.00, 26.00] },
      business: { f: [17.50, 25.50], x: [18.00, 26.00] },
      vehicle: { f: [10.50, 14.00], x: [11.25, 14.75] }
    },
    tc: 'Credit Access Grameen — India\'s leading MFI-NBFC serving rural women entrepreneurs.',
    offer: '🌾 Serving rural women entrepreneurs since 1991.'
  },
  {
    name: 'Canara HSBC Life', short: 'CHL', type: 'private', emoji: '🛡', color: '#283593', url: 'https://canarahsbclife.com',
    rates: {
      home: { f: [8.80, 10.50], x: [9.80, 11.50] },
      lap: { f: [9.30, 12.00], x: [10.30, 13.00] },
      personal: { f: [11.50, 17.50], x: [12.50, 18.50] },
      business: { f: [12.00, 18.00], x: [13.00, 19.00] },
      vehicle: { f: [9.10, 11.20], x: [9.70, 11.80] }
    },
    tc: 'Canara HSBC Life Insurance — bancassurance JV with bundled home loan insurance.',
    offer: '🛡 Free life insurance cover bundled with home loan.'
  },
  {
    name: 'Axis Finance', short: 'Axis Fin', type: 'nbfc', emoji: '🏦', color: '#800000', url: 'https://axisfinance.in',
    rates: {
      home: { f: [9.50, 12.50], x: [10.50, 13.50] },
      lap: { f: [9.75, 13.00], x: [10.75, 14.00] },
      personal: { f: [12.50, 21.50], x: [13.00, 22.00] },
      business: { f: [13.50, 23.50], x: [14.00, 24.00] },
      vehicle: { f: [9.50, 12.50], x: [10.25, 13.25] }
    },
    tc: 'Axis Finance Ltd — NBFC subsidiary of Axis Bank with strong retail loan portfolio.',
    offer: '🏦 Preferred rates for existing Axis Bank account holders.'
  }
];
