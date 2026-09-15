import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Coins,
  FileText,
  BadgeCheck,
  GraduationCap as GradIcon
} from "lucide-react";
import "./loanDocGuide.css";

const DOC_DATA = {
  home: {
    id: "home",
    name: "Home Loan",
    icon: Home,
    cards: [
      {
        title: "Identity & Address Proof",
        icon: UserCheck,
        headerBg: "#F0F9FF",
        iconBg: "#E0F2FE",
        iconColor: "#0284C7",
        items: [
          { text: "Aadhaar Card (both sides)", mandatory: true },
          { text: "PAN Card", mandatory: true },
          { text: "Passport / Voter ID / Driving Licence", mandatory: false },
          { text: "Recent utility bill or bank statement (address proof)", mandatory: false }
        ]
      },
      {
        title: "Income Documents",
        icon: Coins,
        headerBg: "#FEF9EE",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        items: [
          { text: "Last 3 months' salary slips", tag: "Salaried", mandatory: true },
          { text: "Form 16 / IT Returns (2 years)", tag: "Salaried", mandatory: true },
          { text: "ITR with P&L & Balance Sheet (2–3 years)", tag: "Self-Employed", mandatory: true },
          { text: "Bank statements — last 6 months", mandatory: true }
        ]
      },
      {
        title: "Property Documents",
        icon: Building2,
        headerBg: "#FAF5FF",
        iconBg: "#F3E8FF",
        iconColor: "#7C3AED",
        items: [
          { text: "Sale agreement / Allotment letter", mandatory: true },
          { text: "Title deed & chain of ownership", mandatory: true },
          { text: "Approved building plan", mandatory: true },
          { text: "Encumbrance certificate", mandatory: true },
          { text: "Latest property tax receipts", mandatory: true },
          { text: "NOC from builder / society", mandatory: true }
        ]
      },
      {
        title: "Additional (if applicable)",
        icon: FileText,
        headerBg: "#FFF7ED",
        iconBg: "#FFEDD5",
        iconColor: "#EA580C",
        items: [
          { text: "Co-applicant KYC & income docs", mandatory: false },
          { text: "Processing fee cheque", mandatory: false },
          { text: "Possession letter (resale property)", mandatory: false },
          { text: "Occupancy certificate (OC)", mandatory: false }
        ]
      }
    ]
  },
  lap: {
    id: "lap",
    name: "LAP",
    icon: Building2,
    cards: [
      {
        title: "Identity & Address Proof",
        icon: UserCheck,
        headerBg: "#F0F9FF",
        iconBg: "#E0F2FE",
        iconColor: "#0284C7",
        items: [
          { text: "Aadhaar Card (both sides)", mandatory: true },
          { text: "PAN Card", mandatory: true },
          { text: "Passport / Voter ID / Driving Licence", mandatory: false },
          { text: "Recent utility bill or bank statement (address proof)", mandatory: false }
        ]
      },
      {
        title: "Income Documents",
        icon: Coins,
        headerBg: "#FEF9EE",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        items: [
          { text: "Last 3 months' salary slips", tag: "Salaried", mandatory: true },
          { text: "Form 16 / IT Returns (2 years)", tag: "Salaried", mandatory: true },
          { text: "Audited Balance Sheet & P&L (3 years)", tag: "Self-Employed", mandatory: true },
          { text: "Primary bank statement — last 6 to 12 months", mandatory: true }
        ]
      },
      {
        title: "Property & Mortgaged Title",
        icon: Building2,
        headerBg: "#FAF5FF",
        iconBg: "#F3E8FF",
        iconColor: "#7C3AED",
        items: [
          { text: "Original Registered Sale / Title Deed", mandatory: true },
          { text: "Chain of past property conveyance deeds", mandatory: true },
          { text: "Approved architectural & sanction layout", mandatory: true },
          { text: "Latest property tax receipt & paid bills", mandatory: true },
          { text: "Updated Encumbrance Certificate (13–30 yrs)", mandatory: true },
          { text: "Mutation & Khata certificate", mandatory: true }
        ]
      },
      {
        title: "Additional (if applicable)",
        icon: FileText,
        headerBg: "#FFF7ED",
        iconBg: "#FFEDD5",
        iconColor: "#EA580C",
        items: [
          { text: "Co-borrower KYC & income proof", mandatory: false },
          { text: "Foreclosure letter (if balance transfer)", mandatory: false },
          { text: "Business registration (commercial asset)", mandatory: false },
          { text: "Processing fee cheque / receipt", mandatory: false }
        ]
      }
    ]
  },
  personal: {
    id: "personal",
    name: "Personal",
    icon: CreditCard,
    cards: [
      {
        title: "Identity & Address Proof",
        icon: UserCheck,
        headerBg: "#F0F9FF",
        iconBg: "#E0F2FE",
        iconColor: "#0284C7",
        items: [
          { text: "Aadhaar Card (both sides)", mandatory: true },
          { text: "PAN Card", mandatory: true },
          { text: "Passport / Voter ID / Driving Licence", mandatory: false },
          { text: "Current residence proof (utility bill / rent agreement)", mandatory: false }
        ]
      },
      {
        title: "Income Documents",
        icon: Coins,
        headerBg: "#FEF9EE",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        items: [
          { text: "Last 3 months' salary slips", tag: "Salaried", mandatory: true },
          { text: "Form 16 / ITR for last 2 years", tag: "Salaried", mandatory: true },
          { text: "ITR with computation sheet (2 years)", tag: "Self-Employed", mandatory: true },
          { text: "Bank statement — last 6 months (salary credit)", mandatory: true }
        ]
      },
      {
        title: "Employment & Professional Proof",
        icon: BadgeCheck,
        headerBg: "#FAF5FF",
        iconBg: "#F3E8FF",
        iconColor: "#7C3AED",
        items: [
          { text: "Official Employee ID card", mandatory: true },
          { text: "Official company email confirmation / Offer letter", mandatory: true },
          { text: "Form 26AS / EPFO service track", mandatory: false },
          { text: "Business vintage proof (min 2 yrs)", tag: "Self-Employed", mandatory: false }
        ]
      },
      {
        title: "Additional (if applicable)",
        icon: FileText,
        headerBg: "#FFF7ED",
        iconBg: "#FFEDD5",
        iconColor: "#EA580C",
        items: [
          { text: "Existing loan track / repayment record", mandatory: false },
          { text: "Registered rent agreement (if rented)", mandatory: false },
          { text: "Passport size photograph", mandatory: false },
          { text: "Processing fee debit consent", mandatory: false }
        ]
      }
    ]
  },
  business: {
    id: "business",
    name: "Business",
    icon: Briefcase,
    cards: [
      {
        title: "Identity & Promoters KYC",
        icon: UserCheck,
        headerBg: "#F0F9FF",
        iconBg: "#E0F2FE",
        iconColor: "#0284C7",
        items: [
          { text: "PAN Card of entity & all key promoters", mandatory: true },
          { text: "Aadhaar Card of all Partners / Directors", mandatory: true },
          { text: "Residential address proof of promoters", mandatory: true },
          { text: "Business premises proof (electricity / lease agreement)", mandatory: true }
        ]
      },
      {
        title: "Financial & Tax Documents",
        icon: Coins,
        headerBg: "#FEF9EE",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        items: [
          { text: "Audited Balance Sheet & P&L (last 2–3 yrs)", mandatory: true },
          { text: "ITR with computation sheets (last 2–3 yrs)", mandatory: true },
          { text: "Current bank account statements (last 12 months)", mandatory: true },
          { text: "CA certified Net Worth statement", mandatory: false }
        ]
      },
      {
        title: "Business Registration & Proofs",
        icon: Briefcase,
        headerBg: "#FAF5FF",
        iconBg: "#F3E8FF",
        iconColor: "#7C3AED",
        items: [
          { text: "GST Registration Certificate & 12 months GST returns", mandatory: true },
          { text: "Certificate of Incorporation / Partnership Deed", mandatory: true },
          { text: "MOA & AOA / Shop & Establishment License", mandatory: true },
          { text: "Udyam / MSME Registration Certificate", mandatory: true },
          { text: "Applicable trade & industrial licenses", mandatory: false }
        ]
      },
      {
        title: "Additional (if applicable)",
        icon: FileText,
        headerBg: "#FFF7ED",
        iconBg: "#FFEDD5",
        iconColor: "#EA580C",
        items: [
          { text: "Existing loan sanction letters & repayment track", mandatory: false },
          { text: "Major confirmed client work orders / contracts", mandatory: false },
          { text: "Collateral property title (secured SME loans)", mandatory: false },
          { text: "Board Resolution for loan borrowing authorization", mandatory: false }
        ]
      }
    ]
  },
  vehicle: {
    id: "vehicle",
    name: "Vehicle",
    icon: Car,
    cards: [
      {
        title: "Identity & Address Proof",
        icon: UserCheck,
        headerBg: "#F0F9FF",
        iconBg: "#E0F2FE",
        iconColor: "#0284C7",
        items: [
          { text: "Aadhaar Card (both sides)", mandatory: true },
          { text: "PAN Card", mandatory: true },
          { text: "Valid Driving Licence", mandatory: true },
          { text: "Current utility bill / residence proof", mandatory: false }
        ]
      },
      {
        title: "Income Documents",
        icon: Coins,
        headerBg: "#FEF9EE",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        items: [
          { text: "Last 3 months' salary slips", tag: "Salaried", mandatory: true },
          { text: "Form 16 / 1 year ITR", tag: "Salaried", mandatory: true },
          { text: "Latest 2 years ITR with P&L computation", tag: "Self-Employed", mandatory: true },
          { text: "Bank statement — last 6 months", mandatory: true }
        ]
      },
      {
        title: "Vehicle Quotation & Details",
        icon: Car,
        headerBg: "#FAF5FF",
        iconBg: "#F3E8FF",
        iconColor: "#7C3AED",
        items: [
          { text: "Proforma Invoice / Quotation from authorized dealer", mandatory: true },
          { text: "Margin money / Down-payment advance receipt", mandatory: true },
          { text: "Existing RC book copy (for used car)", mandatory: false },
          { text: "Certified Valuer Inspection Report (for used car)", mandatory: false },
          { text: "Valid Comprehensive Insurance policy (for used car)", mandatory: false }
        ]
      },
      {
        title: "Additional (if applicable)",
        icon: FileText,
        headerBg: "#FFF7ED",
        iconBg: "#FFEDD5",
        iconColor: "#EA580C",
        items: [
          { text: "Co-applicant KYC (for income clubbing)", mandatory: false },
          { text: "2 Passport size photographs", mandatory: false },
          { text: "Processing fee & documentation charges cheque", mandatory: false },
          { text: "Hypothecation endorsement Form 34/35", mandatory: false }
        ]
      }
    ]
  },
  education: {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    cards: [
      {
        title: "Student & Co-borrower KYC",
        icon: UserCheck,
        headerBg: "#F0F9FF",
        iconBg: "#E0F2FE",
        iconColor: "#0284C7",
        items: [
          { text: "Aadhaar & PAN Card of Student", mandatory: true },
          { text: "Aadhaar & PAN Card of Parent / Co-borrower", mandatory: true },
          { text: "Valid Passport of Student (study abroad)", mandatory: true },
          { text: "Residential address proof of co-borrower", mandatory: false }
        ]
      },
      {
        title: "Academic & Admission Docs",
        icon: GradIcon,
        headerBg: "#FEF9EE",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        items: [
          { text: "Official Admission Letter from University / College", mandatory: true },
          { text: "Detailed Course Fee Structure schedule", mandatory: true },
          { text: "10th, 12th, and Degree marksheets & certificates", mandatory: true },
          { text: "GRE / GMAT / IELTS / TOEFL / Entrance scorecard", mandatory: true },
          { text: "Scholarship or freeship award letter", mandatory: false }
        ]
      },
      {
        title: "Co-borrower Income Proof",
        icon: Coins,
        headerBg: "#FAF5FF",
        iconBg: "#F3E8FF",
        iconColor: "#7C3AED",
        items: [
          { text: "Last 3 months salary slips", tag: "Salaried Parent", mandatory: true },
          { text: "Form 16 / 2 years ITR with computation", tag: "Salaried Parent", mandatory: true },
          { text: "Last 2–3 years audited ITR & P&L", tag: "Self-Employed Parent", mandatory: true },
          { text: "Bank statement — last 6 months of co-borrower", mandatory: true }
        ]
      },
      {
        title: "Collateral & Additional (if applicable)",
        icon: FileText,
        headerBg: "#FFF7ED",
        iconBg: "#FFEDD5",
        iconColor: "#EA580C",
        items: [
          { text: "Property title deed (for secured loans > ₹7.5L)", mandatory: false },
          { text: "Student Visa copy / I-20 Form (overseas studies)", mandatory: false },
          { text: "Margin money proof / Bank statement", mandatory: false },
          { text: "Processing fee cheque", mandatory: false }
        ]
      }
    ]
  }
};

export default function LoanDocGuide() {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  const currentDoc = DOC_DATA[activeTab] || DOC_DATA.home;

  const handleApply = () => {
    navigate("/apply", {
      state: {
        loanType: activeTab
      }
    });
  };

  const tabsList = [
    { id: "home", label: "Home Loan", icon: Home },
    { id: "lap", label: "LAP", icon: Building2 },
    { id: "personal", label: "Personal", icon: CreditCard },
    { id: "business", label: "Business", icon: Briefcase },
    { id: "vehicle", label: "Vehicle", icon: Car },
    { id: "education", label: "Education", icon: GraduationCap }
  ];

  return (
    <section className="doc-guide-section" aria-label="Loan Documentation Guide">
      {/* Header */}
      <div className="doc-guide-head">
        <div className="doc-guide-pill">
          <Sparkles size={12} className="doc-guide-sparkle" />
          <span>Documentation Guide</span>
        </div>
        <h2 className="doc-guide-title">Documents Required for Your Loan</h2>
        <p className="doc-guide-sub">
          Know exactly what to keep ready before you apply — for every loan type
        </p>
      </div>

      {/* Tabs */}
      <div className="doc-tabs-row">
        {tabsList.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`doc-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="doc-tab-icon">
                <IconComp size={14} strokeWidth={2.2} />
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4 Cards Grid */}
      <div className="doc-cards-grid">
        {currentDoc.cards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div key={idx} className="doc-card">
              <div
                className="doc-card-head"
                style={{ backgroundColor: card.headerBg }}
              >
                <div
                  className="doc-card-icon-wrap"
                  style={{
                    backgroundColor: card.iconBg,
                    color: card.iconColor
                  }}
                >
                  <CardIcon size={16} strokeWidth={2.3} />
                </div>
                <div className="doc-card-head-title">{card.title}</div>
              </div>

              <ul className="doc-card-list">
                {card.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="doc-card-item">
                    {item.mandatory ? (
                      <span className="doc-item-icon" title="Mandatory">
                        <CheckCircle2 size={13} strokeWidth={2.5} color="#16A34A" />
                      </span>
                    ) : (
                      <span className="doc-item-icon" title="May be required">
                        <HelpCircle size={13} strokeWidth={2} color="#94A3B8" />
                      </span>
                    )}
                    <span className="doc-item-text-wrap">
                      <span>{item.text}</span>
                      {item.tag && (
                        <span
                          className={`doc-tag-badge ${
                            item.tag.toLowerCase().includes("self") ? "self-employed" : ""
                          }`}
                        >
                          {item.tag}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Legend Row */}
      <div className="doc-legend-row">
        <div className="doc-legend-item">
          <CheckCircle2 size={13} strokeWidth={2.5} color="#16A34A" />
          <span>Mandatory document</span>
        </div>
        <div className="doc-legend-item">
          <HelpCircle size={13} strokeWidth={2} color="#94A3B8" />
          <span>May be required (case-specific)</span>
        </div>
        <div className="doc-legend-item">
          <span className="doc-legend-tag">Label</span>
          <span>Applicable category</span>
        </div>
      </div>

      {/* Bottom Guidance CTA Box */}
      <div className="doc-cta-banner">
        <div className="doc-cta-text">
          Not sure what to gather? Our advisors can guide you step by step.
        </div>
        <button type="button" className="doc-cta-btn" onClick={handleApply}>
          <span>Apply Now</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}

export { LoanDocGuide };
