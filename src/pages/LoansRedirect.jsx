import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/loansRedirect.css";

export default function LoansRedirect() {
  const navigate = useNavigate();

  const handleApplyClick = (productName) => {
    navigate("/", { state: { activeView: "borrowerStepper", selectedProduct: productName } });
  };

  const loanProducts = [
    {
      id: "home-loan",
      name: "Home Loan",
      icon: "🏠",
      tag: "MOST POPULAR",
      tagBg: "#E2E8F0",
      tagColor: "#475569",
      headerBg: "#FFF7ED",
      rate: "8.50%",
      features: [
        "Up to ₹30 Crore",
        "Up to 30 years tenure",
        "Balance transfer available"
      ],
      btnBg: "#0F2942"
    },
    {
      id: "lap",
      name: "Loan Against Property",
      icon: "🏢",
      tag: "UNLOCK EQUITY",
      tagBg: "#F3E8FF",
      tagColor: "#9333EA",
      headerBg: "#F5F3FF",
      rate: "9.00%",
      features: [
        "Up to 75% of property value",
        "Residential & commercial",
        "Overdraft facility available"
      ],
      btnBg: "#7C3AED"
    },
    {
      id: "personal-loan",
      name: "Personal Loan",
      icon: "💳",
      tag: "INSTANT APPROVAL",
      tagBg: "#FFEDD5",
      tagColor: "#EA580C",
      headerBg: "#FFF7ED",
      rate: "10.50%",
      features: [
        "Up to ₹50 Lakh",
        "No collateral required",
        "Disbursal in 24–48 hours"
      ],
      btnBg: "#EA580C"
    },
    {
      id: "business-loan",
      name: "Business Loan",
      icon: "💼",
      tag: "MSME FRIENDLY",
      tagBg: "#D1FAE5",
      tagColor: "#059669",
      headerBg: "#ECFDF5",
      rate: "11.00%",
      features: [
        "Up to ₹10 Crore",
        "Collateral-free options",
        "Flexible repayment schedule"
      ],
      btnBg: "#059669"
    },
    {
      id: "vehicle-loan",
      name: "Vehicle Loan",
      icon: "🚗",
      tag: "NEW & USED",
      tagBg: "#FFE4E6",
      tagColor: "#E11D48",
      headerBg: "#FFF1F2",
      rate: "8.75%",
      features: [
        "Up to 100% on-road funding",
        "New & pre-owned vehicles",
        "Up to 7-year tenure"
      ],
      btnBg: "#DC2626"
    },
    {
      id: "education-loan",
      name: "Education Loan",
      icon: "🎓",
      tag: "TAX BENEFIT U/S 80E",
      tagBg: "#E0E7FF",
      tagColor: "#4F46E5",
      headerBg: "#EEF2FF",
      rate: "9.00%",
      features: [
        "India & abroad studies",
        "Moratorium period available",
        "Tax deduction on interest"
      ],
      btnBg: "#1E40AF"
    }
  ];

  return (
    <div className="loans-redirect-layout animate-fade-up">
      <div className="loans-header-wrap">
        <div className="loans-badge-pill">
          <span>✦</span> LOAN PRODUCTS
        </div>
        <h1 className="loans-main-heading">Find the right loan for every need</h1>
        <p className="loans-sub-heading">
          Competitive rates from 60+ lenders · Doorstep service · Sign in to apply in minutes
        </p>
      </div>

      <div className="loans-cards-grid">
        {loanProducts.map((p) => (
          <div key={p.id} className="loan-product-card">
            <div className="loan-card-top" style={{ background: p.headerBg }}>
              <div className="loan-card-icon">{p.icon}</div>
              <div className="loan-card-tag" style={{ background: p.tagBg, color: p.tagColor }}>
                {p.tag}
              </div>
            </div>

            <div className="loan-card-body">
              <h3 className="loan-card-title">{p.name}</h3>
              <div className="loan-card-rate-row">
                <span className="loan-rate-val">{p.rate}</span>
                <span className="loan-rate-lbl">p.a. onwards</span>
              </div>

              <ul className="loan-card-features">
                {p.features.map((feat, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="loan-card-footer">
              <button
                className="loan-apply-btn"
                style={{ background: p.btnBg }}
                onClick={() => handleApplyClick(p.name)}
              >
                Apply Now →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { LoansRedirect };
