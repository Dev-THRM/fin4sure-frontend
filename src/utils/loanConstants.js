export const LOAN_PARAMS = {
  home: { amtMin: 100000, amtMax: 300000000, rateMin: 6.5, rateMax: 18, tenureMin: 12, tenureMax: 360, label: 'Home Loan' },
  lap: { amtMin: 500000, amtMax: 300000000, rateMin: 7.5, rateMax: 18, tenureMin: 12, tenureMax: 240, label: 'Loan Against Property' },
  personal: { amtMin: 50000, amtMax: 5000000, rateMin: 9, rateMax: 24, tenureMin: 12, tenureMax: 84, label: 'Personal Loan' },
  business: { amtMin: 100000, amtMax: 20000000, rateMin: 10, rateMax: 26, tenureMin: 12, tenureMax: 60, label: 'Business Loan' },
  vehicle: { amtMin: 100000, amtMax: 10000000, rateMin: 7.5, rateMax: 16, tenureMin: 12, tenureMax: 96, label: 'Vehicle Loan' }
};

export const LENDERS = [
  {
    name: 'SBI', short: 'SBI', type: 'psu', emoji: '🏛️', color: '#003399', url: 'https://sbi.co.in',
    rates: {
      home: { f: [7.10, 9.65], x: [8.70, 11.20] },
      lap: { f: [8.55, 11.05], x: [9.55, 12.05] },
      personal: { f: null, x: [11.45, 14.80] },
      business: { f: [10.75, 13.05], x: [12.05, 15.05] },
      vehicle: { f: [8.75, 10.25], x: [9.25, 11.05] }
    },
    tc: 'Linked to EBLR. Women borrowers get 5 bps concession. Zero prepayment on floating loans.',
    offer: '🎁 Zero PF on home loans for women (festive offer — verify at branch)'
  },
  {
    name: 'HDFC Bank', short: 'HDFC', type: 'private', emoji: '🏦', color: '#004C97', url: 'https://hdfc.bank.in',
    rates: {
      home: { f: [7.20, 9.80], x: [8.80, 11.50] },
      lap: { f: [9.00, 13.00], x: [10.00, 14.00] },
      personal: { f: null, x: [10.40, 24.00] },
      business: { f: [11.00, 22.00], x: [12.00, 22.00] },
      vehicle: { f: [9.40, 11.00], x: [9.40, 11.00] }
    },
    tc: 'RLLR-linked floating rates. CIBIL 750+ for best rates.',
    offer: '🎁 Pre-approved offers for existing HDFC customers.'
  },
  {
    name: 'ICICI Bank', short: 'ICICI', type: 'private', emoji: '🏦', color: '#F7941D', url: 'https://icicibank.com',
    rates: {
      home: { f: [7.25, 9.90], x: [8.90, 11.60] },
      lap: { f: [9.00, 13.50], x: [10.00, 14.50] },
      personal: { f: null, x: [10.50, 22.00] },
      business: { f: [11.50, 21.00], x: [12.50, 21.00] },
      vehicle: { f: [9.00, 11.00], x: [9.00, 11.00] }
    },
    tc: 'EBLR-linked rates. Instant digital processing for salaried borrowers.',
    offer: '🎁 Instant in-principle approval for pre-qualified customers.'
  },
  {
    name: 'Axis Bank', short: 'Axis', type: 'private', emoji: '🏦', color: '#800000', url: 'https://axisbank.com',
    rates: {
      home: { f: [7.30, 10.00], x: [9.00, 11.70] },
      lap: { f: [9.90, 11.00], x: [10.90, 12.00] },
      personal: { f: null, x: [10.49, 22.00] },
      business: { f: [12.00, 21.00], x: [13.00, 21.00] },
      vehicle: { f: [9.15, 10.50], x: [9.15, 10.50] }
    },
    tc: 'Max 100% on-road funding for vehicles. 5 bps concession for women on home loans.',
    offer: null
  },
  {
    name: 'Kotak Mahindra', short: 'Kotak', type: 'private', emoji: '🏦', color: '#EF3E23', url: 'https://kotak.com',
    rates: {
      home: { f: [7.40, 9.75], x: [9.00, 11.50] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: null, x: [10.99, 24.00] },
      business: { f: null, x: [12.00, 22.00] },
      vehicle: { f: [9.00, 10.75], x: [9.00, 10.75] }
    },
    tc: 'Repo-linked floating rates. Digital-first processing.',
    offer: null
  },
  {
    name: 'Bajaj Finserv', short: 'Bajaj', type: 'nbfc', emoji: '🏢', color: '#0099CC', url: 'https://bajajfinserv.in',
    rates: {
      home: { f: [7.25, 10.50], x: [9.00, 12.00] },
      lap: { f: [9.00, 14.00], x: [10.00, 15.00] },
      personal: { f: null, x: [10.99, 26.00] },
      business: { f: [11.00, 26.00], x: [12.00, 26.00] },
      vehicle: { f: null, x: [8.80, 11.00] }
    },
    tc: 'PLR-linked. Strong digital platform. Balance transfer available.',
    offer: '🎁 Pre-approved personal loans up to ₹40L for eligible customers.'
  },
  {
    name: 'PNB Housing', short: 'PNBHFL', type: 'nbfc', emoji: '🏢', color: '#CC0000', url: 'https://pnbhousing.com',
    rates: {
      home: { f: [7.50, 13.45], x: [9.00, 14.00] },
      lap: { f: [8.50, 13.50], x: [9.50, 14.50] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'PLR-linked rates. Specializes in affordable and mid-segment housing.',
    offer: null
  },
  {
    name: 'LIC Housing', short: 'LICHFL', type: 'nbfc', emoji: '🏢', color: '#006400', url: 'https://lichousing.com',
    rates: {
      home: { f: [7.50, 10.35], x: [9.50, 12.00] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'PLR-linked. Strong tier-2/3 city presence. 5 bps for women.',
    offer: '🎁 Griha Lakshmi: Special rate concession for women borrowers.'
  },
  {
    name: 'Tata Capital', short: 'Tata', type: 'nbfc', emoji: '🏢', color: '#0A2463', url: 'https://tatacapital.com',
    rates: {
      home: { f: [8.50, 11.00], x: [9.50, 12.00] },
      lap: { f: [9.00, 13.50], x: [10.00, 14.50] },
      personal: { f: null, x: [10.99, 24.00] },
      business: { f: null, x: [12.00, 24.00] },
      vehicle: { f: null, x: [9.00, 11.50] }
    },
    tc: 'Digital loan processing. Same-day approval for pre-qualified customers.',
    offer: '🎁 Digital home loans with doorstep documentation.'
  },
  {
    name: 'Bank of Baroda', short: 'BOB', type: 'psu', emoji: '🏛️', color: '#F47920', url: 'https://bankofbaroda.in',
    rates: {
      home: { f: [7.10, 9.60], x: [8.60, 11.10] },
      lap: { f: [8.85, 12.25], x: [9.85, 13.25] },
      personal: { f: null, x: [12.00, 17.00] },
      business: { f: null, x: [10.90, 14.50] },
      vehicle: { f: null, x: [8.75, 10.25] }
    },
    tc: 'Baroda Home Loan: EBLR-linked. Waiver of PF on certain schemes.',
    offer: null
  },
  {
    name: 'Canara Bank', short: 'Canara', type: 'psu', emoji: '🏛️', color: '#3C6E71', url: 'https://canarabank.com',
    rates: {
      home: { f: [7.15, 9.70], x: [8.90, 11.40] },
      lap: { f: [9.00, 12.50], x: [10.00, 13.50] },
      personal: { f: null, x: [12.00, 16.00] },
      business: { f: null, x: [10.85, 14.00] },
      vehicle: { f: null, x: [8.80, 10.30] }
    },
    tc: 'Canara Home: EBLR-linked floating. Special scheme for pensioners.',
    offer: null
  },
  {
    name: 'IDFC First Bank', short: 'IDFC', type: 'private', emoji: '🏦', color: '#7B2D8B', url: 'https://idfcfirstbank.com',
    rates: {
      home: { f: [7.85, 9.75], x: [9.25, 11.25] },
      lap: { f: [9.50, 13.00], x: [10.50, 14.00] },
      personal: { f: null, x: [10.49, 23.00] },
      business: { f: null, x: [11.50, 22.00] },
      vehicle: { f: null, x: [9.00, 11.50] }
    },
    tc: 'Fully digital bank. Zero FCL charges on home loans.',
    offer: '🎁 Zero processing fee on home loan balance transfers.'
  },
  {
    name: 'Yes Bank', short: 'Yes', type: 'private', emoji: '🏦', color: '#00518F', url: 'https://yesbank.in',
    rates: {
      home: { f: [7.45, 10.10], x: [9.10, 11.80] },
      lap: { f: [9.30, 13.20], x: [10.30, 14.20] },
      personal: { f: null, x: [10.99, 22.50] },
      business: { f: null, x: [11.75, 21.50] },
      vehicle: { f: null, x: [9.20, 11.20] }
    },
    tc: 'Repo-linked floating rates. Quick digital sanction for salaried.',
    offer: null
  },
  {
    name: 'IndusInd Bank', short: 'IndusInd', type: 'private', emoji: '🏦', color: '#9E1B32', url: 'https://indusind.com',
    rates: {
      home: { f: [7.55, 10.20], x: [9.15, 11.90] },
      lap: { f: [9.40, 13.30], x: [10.40, 14.30] },
      personal: { f: null, x: [10.49, 23.50] },
      business: { f: null, x: [11.90, 22.50] },
      vehicle: { f: null, x: [8.95, 11.30] }
    },
    tc: 'EBLR-linked. Flexible repayment options for self-employed.',
    offer: '🎁 Special rates for premium banking customers.'
  },
  {
    name: 'Union Bank', short: 'Union', type: 'psu', emoji: '🏛️', color: '#00669E', url: 'https://unionbankofindia.co.in',
    rates: {
      home: { f: [7.25, 9.85], x: [8.95, 11.45] },
      lap: { f: [9.10, 12.60], x: [10.10, 13.60] },
      personal: { f: null, x: [11.40, 15.50] },
      business: { f: null, x: [10.80, 14.20] },
      vehicle: { f: null, x: [8.70, 10.40] }
    },
    tc: 'Union Home: EBLR-linked. Concession for govt employees.',
    offer: null
  },
  {
    name: 'Aditya Birla Capital', short: 'ABCL', type: 'nbfc', emoji: '🏢', color: '#C8102E', url: 'https://adityabirlacapital.com',
    rates: {
      home: { f: [8.00, 11.50], x: [9.50, 12.50] },
      lap: { f: [9.25, 14.00], x: [10.25, 15.00] },
      personal: { f: null, x: [10.99, 26.00] },
      business: { f: null, x: [12.00, 24.00] },
      vehicle: { f: null, x: [9.10, 11.60] }
    },
    tc: 'NBFC with flexible eligibility. Good for self-employed & new-to-credit.',
    offer: '🎁 Doorstep service and flexible income documentation.'
  },
  {
    name: 'L&T Finance', short: 'L&T', type: 'nbfc', emoji: '🏢', color: '#0C3C60', url: 'https://ltfinance.com',
    rates: {
      home: { f: [8.25, 11.75], x: [9.75, 12.75] },
      lap: { f: [9.50, 14.25], x: [10.50, 15.25] },
      personal: { f: null, x: [11.50, 25.00] },
      business: { f: null, x: [12.50, 24.00] },
      vehicle: { f: null, x: [9.25, 12.00] }
    },
    tc: 'NBFC. Quick approvals with minimal documentation for small-ticket loans.',
    offer: null
  },
  {
    name: 'Federal Bank', short: 'Federal', type: 'private', emoji: '🏦', color: '#003DA5', url: 'https://federalbank.co.in',
    rates: {
      home: { f: [7.65, 10.05], x: [9.20, 11.70] },
      lap: { f: [9.35, 12.90], x: [10.35, 13.90] },
      personal: { f: null, x: [11.49, 19.50] },
      business: { f: null, x: [11.60, 20.50] },
      vehicle: { f: null, x: [9.05, 10.90] }
    },
    tc: 'EBLR-linked. Strong presence in South India. Quick NRI home loans.',
    offer: null
  },
  {
    name: 'AU Small Finance', short: 'AU SFB', type: 'small', emoji: '🏦', color: '#5E2D91', url: 'https://aubank.in',
    rates: {
      home: { f: [8.50, 12.00], x: [9.75, 13.00] },
      lap: { f: [9.75, 14.50], x: [10.75, 15.50] },
      personal: { f: null, x: [11.99, 24.00] },
      business: { f: null, x: [12.50, 23.00] },
      vehicle: { f: null, x: [9.50, 12.50] }
    },
    tc: 'Small finance bank. Flexible eligibility for self-employed and informal income.',
    offer: '🎁 Tailored products for first-time borrowers.'
  },
  {
    name: 'IDBI Bank', short: 'IDBI', type: 'psu', emoji: '🏛️', color: '#003B5C', url: 'https://idbi.com',
    rates: {
      home: { f: [8.40, 10.75], x: [9.40, 11.75] },
      lap: { f: [9.00, 12.00], x: [10.00, 13.00] },
      personal: { f: null, x: [12.00, 16.50] },
      business: { f: null, x: [12.50, 17.00] },
      vehicle: { f: [8.90, 10.50], x: [9.50, 11.50] }
    },
    tc: 'Government-owned bank. Strong retail banking presence. OD facility on home loans.',
    offer: '🏛️ Subsidised rates under PMAY scheme.'
  },
  {
    name: 'Bank of India', short: 'BOI', type: 'psu', emoji: '🏛️', color: '#003399', url: 'https://bankofindia.co.in',
    rates: {
      home: { f: [8.30, 10.50], x: [9.30, 11.50] },
      lap: { f: [8.80, 11.50], x: [9.80, 12.50] },
      personal: { f: null, x: [11.90, 15.50] },
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
      personal: { f: null, x: [12.50, 16.00] },
      business: { f: [11.20, 13.80], x: [12.20, 15.20] },
      vehicle: { f: [9.00, 10.60], x: [9.60, 11.40] }
    },
    tc: 'Strong South India presence. IB Home Loan — interest concession for women applicants.',
    offer: '🏠 Special rates for NRIs and PIOs.'
  },
  {
    name: 'Punjab & Sind Bank', short: 'PSB', type: 'psu', emoji: '🏛️', color: '#7B1FA2', url: 'https://punjabandsindbank.co.in',
    rates: {
      home: { f: [8.50, 10.70], x: [9.30, 11.60] },
      lap: { f: [9.00, 11.80], x: [10.00, 12.80] },
      personal: { f: null, x: [12.00, 15.80] },
      business: { f: [11.00, 14.00], x: [12.00, 15.50] },
      vehicle: { f: [9.00, 10.80], x: [9.60, 11.40] }
    },
    tc: 'North India focused PSU. PMAY eligible. Repo-linked floating rates.',
    offer: '🌾 Priority sector concessional rates available.'
  },
  {
    name: 'HSBC India', short: 'HSBC', type: 'private', emoji: '🌐', color: '#DB0011', url: 'https://hsbc.co.in',
    rates: {
      home: { f: [8.50, 10.85], x: [9.50, 11.85] },
      lap: { f: [9.25, 12.50], x: [10.25, 13.50] },
      personal: { f: null, x: [10.75, 17.50] },
      business: { f: null, x: [12.00, 18.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Global bank with strong NRI lending. Smart EMI options. Doorstep banking.',
    offer: '🌐 Preferential rates for NRI & expat customers.'
  },
  {
    name: 'Standard Chartered', short: 'StanC', type: 'private', emoji: '🌐', color: '#006272', url: 'https://sc.com/in',
    rates: {
      home: { f: [8.75, 11.00], x: [9.75, 12.00] },
      lap: { f: [9.50, 12.75], x: [10.50, 13.75] },
      personal: { f: null, x: [11.49, 18.00] },
      business: { f: null, x: [13.00, 20.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Premium private bank. Excellent digital experience. MortgageOne offsetting account.',
    offer: '🎁 Fee waiver for premium banking customers.'
  },
  {
    name: 'RBL Bank', short: 'RBL', type: 'private', emoji: '🏦', color: '#E31837', url: 'https://rblbank.com',
    rates: {
      home: { f: [9.00, 12.00], x: [10.00, 13.00] },
      lap: { f: [9.50, 13.50], x: [10.50, 14.50] },
      personal: { f: null, x: [14.00, 23.00] },
      business: { f: null, x: [14.00, 22.00] },
      vehicle: { f: null, x: [10.00, 13.50] }
    },
    tc: 'Mid-sized private bank. Fast approvals. Strong retail loan products.',
    offer: '🎁 Cashback on EMI for first 3 months.'
  },
  {
    name: 'Karnataka Bank', short: 'KarBank', type: 'private', emoji: '🏦', color: '#1565C0', url: 'https://karnatakabank.com',
    rates: {
      home: { f: [8.75, 11.10], x: [9.75, 12.10] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: null, x: [13.50, 18.00] },
      business: { f: [11.50, 14.50], x: [12.50, 15.50] },
      vehicle: { f: [9.25, 11.00], x: [9.75, 11.75] }
    },
    tc: 'South India community bank. Strong MSE lending. KBL Xpress loan available.',
    offer: '🏦 Special rates for Kannada-speaking diaspora members.'
  },
  {
    name: 'Saraswat Bank', short: 'Saraswat', type: 'private', emoji: '🏦', color: '#0D47A1', url: 'https://saraswatbank.com',
    rates: {
      home: { f: [8.60, 10.90], x: [9.50, 11.90] },
      lap: { f: [9.10, 12.00], x: [10.00, 13.00] },
      personal: { f: null, x: [13.00, 17.00] },
      business: { f: [11.00, 14.00], x: [12.00, 15.00] },
      vehicle: { f: [9.00, 10.75], x: [9.60, 11.50] }
    },
    tc: 'Cooperative bank with 100+ years of history. Strong Maharashtra & Goa presence.',
    offer: '🎁 Loyalty benefits for existing account holders.'
  },
  {
    name: 'Shriram Housing Finance', short: 'Shriram', type: 'nbfc', emoji: '🏢', color: '#FF6F00', url: 'https://shriramhousingfinance.com',
    rates: {
      home: { f: [9.50, 13.50], x: [10.50, 14.50] },
      lap: { f: [10.00, 14.50], x: [11.00, 15.50] },
      personal: { f: null, x: null },
      business: { f: null, x: [13.00, 19.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Affordable housing finance specialist. Tier 2 & 3 city expertise. Informal income accepted.',
    offer: '🏠 EWS & LIG segment specialists under PMAY.'
  },
  {
    name: 'GIC Housing Finance', short: 'GIC HF', type: 'nbfc', emoji: '🏢', color: '#1B5E20', url: 'https://gichfindia.com',
    rates: {
      home: { f: [9.00, 11.50], x: [10.00, 12.50] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'General Insurance Corporation subsidiary. Focus on salaried segment. Quick processing.',
    offer: '🎁 Insurance bundled at preferential group rates.'
  },
  {
    name: 'Aavas Financiers', short: 'Aavas', type: 'nbfc', emoji: '🏢', color: '#AD1457', url: 'https://aavas.in',
    rates: {
      home: { f: [10.50, 14.00], x: [11.50, 15.00] },
      lap: { f: [11.00, 15.00], x: [12.00, 16.00] },
      personal: { f: null, x: null },
      business: { f: null, x: [14.00, 20.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Rural and semi-urban housing finance. Serves customers without formal income proof.',
    offer: '🌾 Serving Bharat — rural housing specialists.'
  },
  {
    name: 'Home First Finance', short: 'HomeFirst', type: 'nbfc', emoji: '🏢', color: '#E65100', url: 'https://homefirstindia.com',
    rates: {
      home: { f: [10.25, 13.50], x: [11.25, 14.50] },
      lap: { f: [10.75, 14.00], x: [11.75, 15.00] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'Affordable home loans for first-time buyers. Digital-first lending process.',
    offer: '🏠 ₹0 down payment schemes available.'
  },
  {
    name: 'Mahindra Finance', short: 'Mahindra', type: 'nbfc', emoji: '🏢', color: '#E53935', url: 'https://mahindrafinance.com',
    rates: {
      home: { f: null, x: null },
      lap: { f: [10.50, 15.00], x: [11.50, 16.00] },
      personal: { f: null, x: [16.00, 26.00] },
      business: { f: null, x: [14.00, 22.00] },
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
      personal: { f: null, x: [14.00, 24.00] },
      business: { f: null, x: [14.00, 22.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Gold loan and diversified NBFC. Quick disbursal for LAP against gold and property.',
    offer: '🏅 Quick-disbursal loan — disbursed in 24 hours.'
  },
  {
    name: 'Chola Finance', short: 'Chola', type: 'nbfc', emoji: '🏢', color: '#6A1B9A', url: 'https://cholamandalam.com',
    rates: {
      home: { f: [9.25, 12.00], x: [10.25, 13.00] },
      lap: { f: [9.75, 13.50], x: [10.75, 14.50] },
      personal: { f: null, x: [15.00, 24.00] },
      business: { f: null, x: [14.00, 22.00] },
      vehicle: { f: [9.25, 13.00], x: [10.25, 14.00] }
    },
    tc: 'Cholamandalam Investment & Finance. Diversified NBFC from Murugappa Group. Strong used vehicle loans.',
    offer: '🚗 Best-in-class used car and CV loan products.'
  },
  {
    name: 'Piramal Finance', short: 'Piramal', type: 'nbfc', emoji: '🏢', color: '#7B1FA2', url: 'https://www.piramalfinance.com',
    rates: {
      home: { f: [9.50, 13.00], x: [10.50, 14.00] },
      lap: { f: [10.00, 14.50], x: [11.00, 15.50] },
      personal: { f: null, x: [14.00, 24.00] },
      business: { f: null, x: [13.50, 22.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Piramal Capital & Housing Finance — one of India\'s leading diversified NBFCs.',
    offer: '🏠 Doorstep service for home loan applications.'
  },
  {
    name: 'Navi Housing Finance', short: 'Navi', type: 'nbfc', emoji: '📱', color: '#00695C', url: 'https://navi.com',
    rates: {
      home: { f: [8.99, 14.00], x: [9.99, 15.00] },
      lap: { f: null, x: null },
      personal: { f: null, x: [15.00, 45.00] },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'Navi Technologies — digital-first lender with instant in-app approvals.',
    offer: '📱 100% digital — home loan approved in minutes.'
  },
  {
    name: 'Sundaram Home Finance', short: 'Sundaram HF', type: 'nbfc', emoji: '🏛', color: '#4527A0', url: 'https://sundaram.co.in',
    rates: {
      home: { f: [8.50, 11.00], x: [9.50, 12.00] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'Sundaram Home Finance Ltd — 25+ years of experience in housing finance.',
    offer: '🏛 Special rates for women borrowers and senior citizens.'
  },
  {
    name: 'Repco Home Finance', short: 'Repco', type: 'nbfc', emoji: '🏠', color: '#37474F', url: 'https://repcobank.com',
    rates: {
      home: { f: [9.00, 12.00], x: [10.00, 13.00] },
      lap: { f: [9.50, 12.50], x: [10.50, 13.50] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'Repco Home Finance Ltd — affordable housing focus in Tier 2/3 cities.',
    offer: '🏠 Specialises in affordable housing for the underserved.'
  },
  {
    name: 'Equitas Small Finance Bank', short: 'Equitas SFB', type: 'small', emoji: '🏦', color: '#00838F', url: 'https://equitasbank.com',
    rates: {
      home: { f: [9.25, 13.50], x: [10.25, 14.50] },
      lap: { f: [10.00, 14.00], x: [11.00, 15.00] },
      personal: { f: null, x: [14.00, 22.00] },
      business: { f: null, x: [15.00, 24.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Equitas Small Finance Bank — digital banking with inclusive finance for all.',
    offer: '💰 Priority queue for existing account holders.'
  },
  {
    name: 'Ujjivan Small Finance Bank', short: 'Ujjivan SFB', type: 'small', emoji: '🌟', color: '#0277BD', url: 'https://ujjivansfb.in',
    rates: {
      home: { f: [9.50, 13.00], x: [10.50, 14.00] },
      lap: { f: [10.25, 13.50], x: [11.25, 14.50] },
      personal: { f: null, x: [16.00, 26.00] },
      business: { f: null, x: [16.00, 26.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Ujjivan Small Finance Bank — growing pan-India network with digital onboarding.',
    offer: '🌟 Digital onboarding and disbursal in 48 hours.'
  },
  {
    name: 'Jana Small Finance Bank', short: 'Jana SFB', type: 'small', emoji: '🏢', color: '#558B2F', url: 'https://janabank.com',
    rates: {
      home: { f: [9.90, 14.00], x: [10.90, 15.00] },
      lap: { f: [10.50, 14.50], x: [11.50, 15.50] },
      personal: { f: null, x: [17.00, 27.00] },
      business: { f: null, x: [15.00, 26.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Jana Small Finance Bank — microfinance leader turned SFB with MSME focus.',
    offer: '🏢 Special rates for MSME sector borrowers.'
  },
  {
    name: 'ESAF Small Finance Bank', short: 'ESAF SFB', type: 'small', emoji: '🌱', color: '#2E7D32', url: 'https://esafbank.com',
    rates: {
      home: { f: [10.00, 14.00], x: [11.00, 15.00] },
      lap: { f: [10.50, 14.50], x: [11.50, 15.50] },
      personal: { f: null, x: [16.00, 24.00] },
      business: { f: null, x: [15.00, 24.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'ESAF Small Finance Bank — serving rural and semi-urban India.',
    offer: '🌱 Micro-loans for self-employed and rural borrowers.'
  },
  {
    name: 'Tata Capital Housing Finance', short: 'TCHF', type: 'nbfc', emoji: '🏠', color: '#B71C1C', url: 'https://tatacapital.com/home-loan',
    rates: {
      home: { f: [8.75, 11.00], x: [9.75, 12.00] },
      lap: { f: [9.25, 12.50], x: [10.25, 13.50] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'Tata Capital Housing Finance — part of the iconic Tata Group.',
    offer: '🏠 Balance transfer with top-up facility available.'
  },
  {
    name: 'PNB Housing Finance', short: 'PNBHFL', type: 'nbfc', emoji: '🏦', color: '#1A237E', url: 'https://pnbhousing.com',
    rates: {
      home: { f: [8.50, 10.95], x: [9.50, 11.95] },
      lap: { f: [9.25, 12.50], x: [10.25, 13.50] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'PNB Housing Finance Ltd — one of the largest HFCs in India.',
    offer: '🏦 Zero prepayment charges on floating rate loans.'
  },
  {
    name: 'Bajaj Housing Finance', short: 'BJF Housing', type: 'nbfc', emoji: '🏠', color: '#E65100', url: 'https://bajajfinserv.in/home-loan',
    rates: {
      home: { f: [8.50, 14.00], x: [9.50, 15.00] },
      lap: { f: [9.00, 14.50], x: [10.00, 15.50] },
      personal: { f: null, x: null },
      business: { f: null, x: [13.00, 22.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Bajaj Housing Finance Ltd — fast-growing HFC backed by Bajaj Finance.',
    offer: '🏠 Instant in-principle approval in 5 minutes online.'
  },
  {
    name: 'Motilal Oswal Home Finance', short: 'MOHFL', type: 'nbfc', emoji: '📈', color: '#880E4F', url: 'https://motilaloswalhomefinance.com',
    rates: {
      home: { f: [9.75, 13.50], x: [10.75, 14.50] },
      lap: { f: [10.25, 14.00], x: [11.25, 15.00] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'Motilal Oswal Home Finance — specialised in LAP against rented commercial property.',
    offer: '📈 Specialised LAP against rented commercial property.'
  },
  {
    name: 'Shriram Finance', short: 'Shriram', type: 'nbfc', emoji: '🏭', color: '#6A1B9A', url: 'https://shriramfinance.in',
    rates: {
      home: { f: [10.00, 14.00], x: [11.00, 15.00] },
      lap: { f: [10.50, 14.50], x: [11.50, 15.50] },
      personal: { f: null, x: [15.00, 26.00] },
      business: { f: null, x: [14.00, 24.00] },
      vehicle: { f: [10.00, 16.00], x: [11.00, 17.00] }
    },
    tc: 'Shriram Finance Ltd — India\'s largest vehicle financier. Strong in used CVs.',
    offer: '🏭 India\'s largest used CV and vehicle loan lender.'
  },
  {
    name: 'Manappuram Finance', short: 'Manappuram', type: 'nbfc', emoji: '🥇', color: '#F9A825', url: 'https://manappuram.com',
    rates: {
      home: { f: null, x: null },
      lap: { f: null, x: null },
      personal: { f: null, x: [12.00, 29.00] },
      business: { f: null, x: [14.00, 27.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Manappuram Finance Ltd — gold loan leader expanding into personal loans.',
    offer: '🥇 Gold-backed personal loan — lowest rates in segment.'
  },
  {
    name: 'IndoStar Capital Finance', short: 'IndoStar', type: 'nbfc', emoji: '⭐', color: '#1565C0', url: 'https://indostarcapital.com',
    rates: {
      home: { f: [9.50, 13.00], x: [10.50, 14.00] },
      lap: { f: [10.00, 14.00], x: [11.00, 15.00] },
      personal: { f: null, x: null },
      business: { f: null, x: [14.00, 22.00] },
      vehicle: { f: [10.50, 15.00], x: [11.50, 16.00] }
    },
    tc: 'IndoStar Capital Finance — pan-India NBFC with housing for self-employed NTC.',
    offer: '⭐ Specialised housing loans for self-employed NTC.'
  },
  {
    name: 'DBS Bank India', short: 'DBS', type: 'private', emoji: '🌏', color: '#E50000', url: 'https://dbsbank.in',
    rates: {
      home: { f: [8.75, 10.25], x: [9.75, 11.25] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: null, x: [12.00, 21.00] },
      business: { f: null, x: [13.00, 19.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'DBS Bank India — Singapore\'s DBS Group with full digital banking suite in India.',
    offer: '🌏 Fully digital home loan with dedicated Relationship Manager.'
  },
  {
    name: 'Bandhan Bank', short: 'Bandhan', type: 'private', emoji: '🤝', color: '#D50000', url: 'https://bandhanbank.com',
    rates: {
      home: { f: [9.16, 13.33], x: [10.16, 14.33] },
      lap: { f: [9.75, 13.50], x: [10.75, 14.50] },
      personal: { f: null, x: [15.00, 24.00] },
      business: { f: null, x: [16.00, 26.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Bandhan Bank — commercial bank with microfinance roots, strong in East India.',
    offer: '🤝 Affordable housing specialist — home loans from ₹2 lakh.'
  },
  {
    name: 'Karur Vysya Bank', short: 'KVB', type: 'private', emoji: '🏦', color: '#1B5E20', url: 'https://kvb.co.in',
    rates: {
      home: { f: [8.75, 11.00], x: [9.75, 12.00] },
      lap: { f: [9.25, 12.00], x: [10.25, 13.00] },
      personal: { f: null, x: [11.50, 18.00] },
      business: { f: null, x: [12.00, 19.00] },
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
      personal: { f: null, x: [12.00, 20.00] },
      business: { f: null, x: [12.00, 20.00] },
      vehicle: { f: [9.25, 12.00], x: [10.25, 13.00] }
    },
    tc: 'City Union Bank — premier private bank from Kumbakonam, Tamil Nadu.',
    offer: '🏛 Quick turnaround for SME and business loans.'
  },
  {
    name: 'Lakshmi Vilas Bank', short: 'LVB', type: 'private', emoji: '🏦', color: '#BF360C', url: 'https://lvbank.com',
    rates: {
      home: { f: [9.25, 11.75], x: [10.25, 12.75] },
      lap: { f: [9.75, 12.75], x: [10.75, 13.75] },
      personal: { f: null, x: [13.00, 20.00] },
      business: { f: null, x: [13.00, 20.00] },
      vehicle: { f: [9.50, 13.00], x: [10.50, 14.00] }
    },
    tc: 'Lakshmi Vilas Bank — South India focused private bank, now part of DBS.',
    offer: '🏦 Retail-first approach with fast document processing.'
  },
  {
    name: 'Aditya Birla Housing Finance', short: 'ABHFL', type: 'nbfc', emoji: '🏗', color: '#AD1457', url: 'https://www.adityabirlahomeloans.com',
    rates: {
      home: { f: [8.60, 11.50], x: [9.60, 12.50] },
      lap: { f: [9.10, 12.00], x: [10.10, 13.00] },
      personal: { f: null, x: null },
      business: { f: null, x: [13.00, 20.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Aditya Birla Housing Finance — flagship HFC of the Aditya Birla Group.',
    offer: '🏗 Flexible repayment with top-up loan facility.'
  },
  {
    name: 'LoanTap Financial', short: 'LoanTap', type: 'nbfc', emoji: '💡', color: '#0097A7', url: 'https://loantap.in',
    rates: {
      home: { f: null, x: null },
      lap: { f: null, x: null },
      personal: { f: null, x: [12.00, 24.00] },
      business: { f: null, x: [14.00, 26.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'LoanTap Credit Technologies — fintech NBFC for personal and business loans.',
    offer: '💡 Flexible EMI-free period and custom repayment terms.'
  },
  {
    name: 'Credit Access Grameen', short: 'CAG', type: 'nbfc', emoji: '🌾', color: '#F57F17', url: 'https://creditaccessgrameen.com',
    rates: {
      home: { f: null, x: null },
      lap: { f: null, x: null },
      personal: { f: null, x: [20.00, 26.00] },
      business: { f: null, x: [18.00, 26.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Credit Access Grameen — India\'s leading MFI-NBFC serving rural women entrepreneurs.',
    offer: '🌾 Serving rural women entrepreneurs since 1991.'
  },
  {
    name: 'Canara HSBC Life', short: 'CHL', type: 'private', emoji: '🛡', color: '#283593', url: 'https://canarahsbclife.com',
    rates: {
      home: { f: [8.80, 10.50], x: [9.80, 11.50] },
      lap: { f: [9.30, 12.00], x: [10.30, 13.00] },
      personal: { f: null, x: null },
      business: { f: null, x: null },
      vehicle: { f: null, x: null }
    },
    tc: 'Canara HSBC Life Insurance — bancassurance JV with bundled home loan insurance.',
    offer: '🛡 Free life insurance cover bundled with home loan.'
  },
  {
    name: 'Axis Finance', short: 'Axis Fin', type: 'nbfc', emoji: '🏦', color: '#800000', url: 'https://axisfinance.in',
    rates: {
      home: { f: [9.50, 12.50], x: [10.50, 13.50] },
      lap: { f: [9.75, 13.00], x: [10.75, 14.00] },
      personal: { f: null, x: [13.00, 22.00] },
      business: { f: null, x: [14.00, 24.00] },
      vehicle: { f: null, x: null }
    },
    tc: 'Axis Finance Ltd — NBFC subsidiary of Axis Bank with strong retail loan portfolio.',
    offer: '🏦 Preferred rates for existing Axis Bank account holders.'
  }
];
