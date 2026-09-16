import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  Users,
  BarChart3,
  Landmark,
  Globe,
  Coins,
  FileText,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import "./loanDocGuide.css";

const DOC_DATA = {
  home: {
    id: "home",
    name: "Home Loan",
    icon: Home,
    layout: "grid-2",
    cards: [
      {
        title: "Identity & Address Proof",
        icon: CreditCard,
        headerBg: "#EFF6FF",
        titleColor: "#0284C7",
        items: [
          { text: "Aadhaar Card (both sides)", mandatory: true },
          { text: "PAN Card", mandatory: true },
          { text: "Passport / Voter ID / Driving Licence", mandatory: true },
          { text: "Recent utility bill or bank statement (address proof)", mandatory: true }
        ]
      },
      {
        title: "Income Documents",
        icon: Coins,
        headerBg: "#F0FDF4",
        titleColor: "#16A34A",
        items: [
          { text: "Last 3 months' salary slips", tag: "Salaried", mandatory: true },
          { text: "Form 16 / IT Returns (2 years)", tag: "Salaried", mandatory: true },
          { text: "ITR with P&L & Balance Sheet (3 years)", tag: "Self Employed", mandatory: true },
          { text: "Bank statements — last 6 months", mandatory: true }
        ]
      },
      {
        title: "Property Documents",
        icon: Home,
        headerBg: "#FAF5FF",
        titleColor: "#7C3AED",
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
        titleColor: "#EA580C",
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
    layout: "grid-2",
    cards: [
      {
        title: "Identity & Address Proof",
        icon: CreditCard,
        headerBg: "#EFF6FF",
        titleColor: "#0284C7",
        items: [
          { text: "Aadhaar Card", mandatory: true },
          { text: "PAN Card", mandatory: true },
          { text: "Passport / Voter ID", mandatory: true },
          { text: "Address proof (utility bill / bank statement)", mandatory: true }
        ]
      },
      {
        title: "Income Documents",
        icon: Coins,
        headerBg: "#F0FDF4",
        titleColor: "#16A34A",
        items: [
          { text: "Bank statements — last 12 months", mandatory: true },
          { text: "ITR with computation (2–3 years)", mandatory: true },
          { text: "P&L statement & balance sheet", tag: "Business", mandatory: true },
          { text: "Salary slips + Form 16", tag: "Salaried", mandatory: true }
        ]
      },
      {
        title: "Property Documents",
        icon: Building2,
        headerBg: "#FAF5FF",
        titleColor: "#7C3AED",
        items: [
          { text: "Original title deed / sale deed", mandatory: true },
          { text: "Encumbrance certificate (EC)", mandatory: true },
          { text: "Latest property tax paid receipts", mandatory: true },
          { text: "Municipal approved building plan", mandatory: true },
          { text: "Khata / Patta (state-wise)", mandatory: true }
        ]
      },
      {
        title: "Additional",
        icon: FileText,
        headerBg: "#FFF7ED",
        titleColor: "#EA580C",
        items: [
          { text: "Valuation report from approved valuer", mandatory: false },
          { text: "Search report from advocate", mandatory: false },
          { text: "Co-applicant KYC", mandatory: false },
          { text: "Rental agreement (if rented out)", mandatory: false }
        ]
      }
    ]
  },
  personal: {
    id: "personal",
    name: "Personal",
    icon: CreditCard,
    layout: "grid-3",
    notice: "Personal loans are collateral-free — minimal documentation, fastest disbursal",
    cards: [
      {
        title: "Identity & Address Proof",
        icon: CreditCard,
        headerBg: "#EFF6FF",
        titleColor: "#0284C7",
        items: [
          { text: "Aadhaar Card", mandatory: true },
          { text: "PAN Card", mandatory: true },
          { text: "Passport / Voter ID / Driving Licence", mandatory: true },
          { text: "Recent utility bill (address)", mandatory: true }
        ]
      },
      {
        title: "Salaried Applicants",
        icon: Coins,
        headerBg: "#F0FDF4",
        titleColor: "#16A34A",
        items: [
          { text: "Last 3 months' salary slips", mandatory: true },
          { text: "Form 16 / IT return (1 year)", mandatory: true },
          { text: "Bank statements — last 3 months", mandatory: true },
          { text: "Employment ID / offer letter", mandatory: true }
        ]
      },
      {
        title: "Self Employed Applicants",
        icon: Briefcase,
        headerBg: "#FFF7ED",
        titleColor: "#EA580C",
        items: [
          { text: "ITR — last 2 years with computation", mandatory: true },
          { text: "Bank statements — last 6 months", mandatory: true },
          { text: "Business proof (GST / trade licence)", mandatory: true },
          { text: "Office address proof", mandatory: false }
        ]
      }
    ]
  },
  business: {
    id: "business",
    name: "Business",
    icon: Briefcase,
    layout: "grid-2",
    cards: [
      {
        title: "Promoter / Director KYC",
        icon: Users,
        headerBg: "#F0FDFA",
        titleColor: "#0D9488",
        items: [
          { text: "Aadhaar & PAN of all directors", mandatory: true },
          { text: "Address proof of promoters", mandatory: true },
          { text: "Passport-size photographs", mandatory: true }
        ]
      },
      {
        title: "Business Registration",
        icon: Building2,
        headerBg: "#F1F5F9",
        titleColor: "#334155",
        items: [
          { text: "Certificate of incorporation / MOA & AOA", mandatory: true },
          { text: "Partnership deed", tag: "Partnership", mandatory: true },
          { text: "Udyam / MSME registration certificate", mandatory: true },
          { text: "GST registration certificate", mandatory: true },
          { text: "Business PAN card", mandatory: true },
          { text: "Shop & Establishment licence", mandatory: true }
        ]
      },
      {
        title: "Financial Documents",
        icon: BarChart3,
        headerBg: "#FFFBEB",
        titleColor: "#D97706",
        items: [
          { text: "ITR — last 2–3 years (company + directors)", mandatory: true },
          { text: "Audited P&L & balance sheet (2 years)", mandatory: true },
          { text: "Business current account — last 12 months", mandatory: true },
          { text: "GST returns — last 12 months (GSTR-3B)", mandatory: true },
          { text: "Existing loan statements / sanction letters", mandatory: false }
        ]
      },
      {
        title: "Additional",
        icon: FileText,
        headerBg: "#FAF5FF",
        titleColor: "#7C3AED",
        items: [
          { text: "Office / business address proof", mandatory: false },
          { text: "Projected financials / business plan", mandatory: false },
          { text: "Purchase orders / invoices (for WC loans)", mandatory: false },
          { text: "Collateral documents (if secured)", mandatory: false }
        ]
      }
    ]
  },
  vehicle: {
    id: "vehicle",
    name: "Vehicle",
    icon: Car,
    layout: "grid-3",
    notice: "For used vehicles — vehicle age typically must be under 10 years at loan maturity",
    cards: [
      {
        title: "Identity & Address Proof",
        icon: CreditCard,
        headerBg: "#FFF1F2",
        titleColor: "#E11D48",
        items: [
          { text: "Aadhaar Card & PAN Card", mandatory: true },
          { text: "Valid Driving Licence", mandatory: true },
          { text: "Address proof (utility bill / bank statement)", mandatory: true }
        ]
      },
      {
        title: "Income Documents",
        icon: Coins,
        headerBg: "#F0FDF4",
        titleColor: "#16A34A",
        items: [
          { text: "Salary slips — last 3 months", tag: "Salaried", mandatory: true },
          { text: "ITR + bank statements (6 months)", tag: "Self Employed", mandatory: true },
          { text: "Form 16 / IT Returns (1 year)", mandatory: true }
        ]
      },
      {
        title: "Vehicle Documents",
        icon: Car,
        headerBg: "#FFF1F2",
        titleColor: "#E11D48",
        items: [
          { text: "Proforma invoice from dealer", tag: "New", mandatory: true },
          { text: "RC book & insurance certificate", tag: "Used", mandatory: true },
          { text: "Vehicle valuation report", tag: "Used", mandatory: true },
          { text: "Quotation / booking slip from showroom", mandatory: false }
        ]
      }
    ]
  },
  education: {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    layout: "grid-2",
    notice: "Interest on education loans is tax-deductible under Section 80E for up to 8 years",
    cards: [
      {
        title: "Student Documents",
        icon: GraduationCap,
        headerBg: "#EFF6FF",
        titleColor: "#0284C7",
        items: [
          { text: "Aadhaar & PAN of student", mandatory: true },
          { text: "Admission / conditional offer letter", mandatory: true },
          { text: "Fee structure from institution", mandatory: true },
          { text: "Mark sheets — 10th, 12th, Graduation", mandatory: true },
          { text: "Scholarship / fellowship proof (if any)", mandatory: false }
        ]
      },
      {
        title: "Co-Borrower (Parent/Guardian)",
        icon: Users,
        headerBg: "#F0FDF4",
        titleColor: "#16A34A",
        items: [
          { text: "Aadhaar & PAN of co-borrower", mandatory: true },
          { text: "Income proof (salary slips / ITR)", mandatory: true },
          { text: "Bank statements — last 6 months", mandatory: true },
          { text: "Form 16 or business financials", mandatory: true },
          { text: "Relationship proof with student", mandatory: true }
        ]
      },
      {
        title: "Collateral (Loans > ₹7.5 Lakh)",
        icon: Landmark,
        headerBg: "#FAF5FF",
        titleColor: "#7C3AED",
        items: [
          { text: "Property documents (title deed, EC)", mandatory: false },
          { text: "Fixed deposit certificate", mandatory: false },
          { text: "LIC policy / NSC / KVP documents", mandatory: false },
          { text: "Third-party guarantee documents", mandatory: false }
        ]
      },
      {
        title: "Abroad Studies (Additional)",
        icon: Globe,
        headerBg: "#FFF7ED",
        titleColor: "#EA580C",
        items: [
          { text: "Valid student visa (I-20 / CAS / CoE)", mandatory: true },
          { text: "Admission letter from foreign university", mandatory: true },
          { text: "Admission letter from foreign university", mandatory: false, hidden: true },
          { text: "GRE / GMAT / IELTS / TOEFL scores", mandatory: false },
          { text: "Forex requirement estimate", mandatory: false }
        ].filter(item => !item.hidden)
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
          <span>✦ DOCUMENTATION GUIDE</span>
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
                <IconComp size={15} strokeWidth={2.2} />
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className={`doc-cards-grid ${currentDoc.layout || "grid-2"}`}>
        {currentDoc.cards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div key={idx} className="doc-card">
              <div
                className="doc-card-head"
                style={{ backgroundColor: card.headerBg }}
              >
                <span
                  className="doc-card-icon-wrap"
                  style={{ color: card.titleColor || "#0F2942" }}
                >
                  <CardIcon size={16} strokeWidth={2.3} />
                </span>
                <span
                  className="doc-card-head-title"
                  style={{ color: card.titleColor || "#0F2942" }}
                >
                  {card.title}
                </span>
              </div>

              <ul className="doc-card-list">
                {card.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="doc-card-item">
                    {item.mandatory ? (
                      <span className="doc-check-icon" title="Mandatory document">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#16A34A"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    ) : (
                      <span className="doc-hollow-circle" title="May be required (case-specific)"></span>
                    )}
                    <div className="doc-item-text-wrap">
                      <span className="doc-item-label">{item.text}</span>
                      {item.tag && (
                        <span className="doc-tag-badge">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Notice bar */}
      {currentDoc.notice && (
        <div className="doc-notice-banner">
          <Lightbulb size={16} strokeWidth={2.2} className="doc-notice-icon" />
          <span className="doc-notice-text">{currentDoc.notice}</span>
        </div>
      )}

      {/* Legend Row */}
      <div className="doc-legend-row">
        <div className="doc-legend-item">
          <span className="doc-check-icon">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16A34A"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span>Mandatory document</span>
        </div>
        <div className="doc-legend-item">
          <span className="doc-hollow-circle"></span>
          <span>May be required (case-specific)</span>
        </div>
        <div className="doc-legend-item">
          <span className="doc-tag-badge legend">Label</span>
          <span>Applicable category</span>
        </div>
      </div>

      {/* Bottom Guidance CTA Box */}
      <div className="doc-cta-banner">
        <div className="doc-cta-text">
          Not sure what to gather? Our advisors can guide you step by step.
        </div>
        <div className="doc-cta-btn-wrap">
          <button type="button" className="doc-cta-btn" onClick={handleApply}>
            <span>Apply Now</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

export { LoanDocGuide };
