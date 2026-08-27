import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Building2, 
  CreditCard, 
  Briefcase, 
  Car, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Percent
} from "lucide-react";
import "./styles/loansRedirect.css";

export default function LoansRedirect() {
  const navigate = useNavigate();

  const handleApplyClick = (productName) => {
    const typeMap = {
      "Home Loan": "home",
      "Loan Against Property": "lap",
      "Personal Loan": "personal",
      "Business Loan": "business",
      "Vehicle Loan": "vehicle",
      "Education Loan": "education"
    };
    const loanTypeId = typeMap[productName] || "home";
    navigate("/apply", { 
      state: { 
        loanType: loanTypeId, 
        selectedProduct: productName 
      } 
    });
  };

  const loanProducts = [
    {
      id: "home-loan",
      name: "Home Loan",
      icon: Home,
      iconColor: "#0284C7",
      iconBg: "#E0F2FE",
      tag: "MOST POPULAR",
      tagBg: "#EFF6FF",
      tagColor: "#1D4ED8",
      tagBorder: "#BFDBFE",
      headerBg: "linear-gradient(135deg, #F0F7FF 0%, #E0F2FE 100%)",
      rate: "8.50%",
      features: [
        "Up to ₹30 Crore loan amount",
        "Flexible tenure up to 30 years",
        "Lower interest balance transfer"
      ],
      btnBg: "linear-gradient(135deg, #0F2942 0%, #1E3A8A 100%)"
    },
    {
      id: "lap",
      name: "Loan Against Property",
      icon: Building2,
      iconColor: "#7C3AED",
      iconBg: "#EDE9FE",
      tag: "UNLOCK EQUITY",
      tagBg: "#FAF5FF",
      tagColor: "#6D28D9",
      tagBorder: "#DDD6FE",
      headerBg: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)",
      rate: "9.00%",
      features: [
        "Up to 75% of property market value",
        "Residential & commercial properties",
        "Overdraft facility available"
      ],
      btnBg: "linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)"
    },
    {
      id: "personal-loan",
      name: "Personal Loan",
      icon: CreditCard,
      iconColor: "#EA580C",
      iconBg: "#FFEDD5",
      tag: "INSTANT APPROVAL",
      tagBg: "#FFF7ED",
      tagColor: "#C2410C",
      tagBorder: "#FED7AA",
      headerBg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
      rate: "10.50%",
      features: [
        "Instant funding up to ₹50 Lakh",
        "100% paperless & no collateral",
        "Disbursal in 24–48 hours"
      ],
      btnBg: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)"
    },
    {
      id: "business-loan",
      name: "Business Loan",
      icon: Briefcase,
      iconColor: "#059669",
      iconBg: "#D1FAE5",
      tag: "MSME FRIENDLY",
      tagBg: "#ECFDF5",
      tagColor: "#047857",
      tagBorder: "#A7F3D0",
      headerBg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      rate: "11.00%",
      features: [
        "Capital credit up to ₹10 Crore",
        "Collateral-free SME options",
        "Customized repayment schedules"
      ],
      btnBg: "linear-gradient(135deg, #059669 0%, #047857 100%)"
    },
    {
      id: "vehicle-loan",
      name: "Vehicle Loan",
      icon: Car,
      iconColor: "#E11D48",
      iconBg: "#FFE4E6",
      tag: "NEW & USED",
      tagBg: "#FFF1F2",
      tagColor: "#BE123C",
      tagBorder: "#FECDD3",
      headerBg: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
      rate: "8.75%",
      features: [
        "Up to 100% on-road financing",
        "New & certified pre-owned cars",
        "Extended tenure up to 7 years"
      ],
      btnBg: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)"
    },
    {
      id: "education-loan",
      name: "Education Loan",
      icon: GraduationCap,
      iconColor: "#2563EB",
      iconBg: "#DBEAFE",
      tag: "TAX BENEFIT U/S 80E",
      tagBg: "#EFF6FF",
      tagColor: "#1D4ED8",
      tagBorder: "#BFDBFE",
      headerBg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      rate: "9.00%",
      features: [
        "Top universities in India & abroad",
        "Flexible course moratorium period",
        "100% tax deduction on interest paid"
      ],
      btnBg: "linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)"
    }
  ];

  return (
    <div className="loans-redirect-layout animate-fade-up">
      {/* Header Section */}
      <div className="loans-header-wrap">
        <div className="loans-badge-pill">
          <Sparkles size={13} className="sparkle-icon" />
          <span>LOAN PRODUCTS & SOLUTIONS</span>
        </div>
        <h1 className="loans-main-heading">Find the right loan for every need</h1>
        <p className="loans-sub-heading">
          Competitive interest rates from 60+ partner banks & NBFCs · Doorstep assistance · Sign in to apply in minutes
        </p>

        {/* Feature quick badges */}
        <div className="loans-trust-pills">
          <div className="trust-pill">
            <ShieldCheck size={14} color="#059669" />
            <span>RBI Compliant Rates</span>
          </div>
          <div className="trust-pill">
            <Percent size={14} color="#0284C7" />
            <span>Zero Brokerage Fees</span>
          </div>
          <div className="trust-pill">
            <Zap size={14} color="#D97706" />
            <span>Fast Digital Processing</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="loans-cards-grid">
        {loanProducts.map((p) => {
          const IconComp = p.icon;
          return (
            <div key={p.id} className="loan-product-card">
              <div className="loan-card-top" style={{ background: p.headerBg }}>
                <div className="loan-card-circle-bg"></div>
                <div className="loan-card-icon-container" style={{ background: p.iconBg, color: p.iconColor }}>
                  <IconComp size={22} strokeWidth={2.2} />
                </div>
                <div 
                  className="loan-card-tag" 
                  style={{ 
                    background: p.tagBg, 
                    color: p.tagColor,
                    border: `1px solid ${p.tagBorder}`
                  }}
                >
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
                      <CheckCircle2 size={15} className="check-icon" strokeWidth={2.2} />
                      <span>{feat}</span>
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
                  <span>Apply Now</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { LoansRedirect };

