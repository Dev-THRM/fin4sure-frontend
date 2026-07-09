import React from "react";
import { useNavigate } from "react-router-dom";
import BrandPanel from "../components/home/BrandPanel";
import CompanyRibbon from "../components/home/CompanyRibbon";
import RoleCards from "../components/home/RoleCards";
import HomeEmiWidget from "../components/home/HomeEmiWidget";
import "./styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    if (role === "borrower") {
      // Redirect to Loans/Products comparison page
      navigate("/products");
    } else {
      // Redirect to Become a Partner page
      navigate("/broker-register");
    }
  };

  return (
    <div className="brand-form-layout animate-fade-up">
      {/* Left branding panel */}
      <BrandPanel mode="borrower" />

      {/* Right onboarding panel */}
      <main className="form-panel">
        <CompanyRibbon />

        <div className="form-container">
          <div className="rp-heading">Welcome to Finn4sure</div>
          <div className="rp-sub">How would you like to get started?</div>

          <RoleCards onSelectRole={handleSelectRole} />

          <HomeEmiWidget />

          {/* Security trust badges */}
          <div className="trust-row">
            <span className="trust-item">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              RBI Compliant
            </span>
            <span className="trust-item">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Bank-grade Security
            </span>
            <span className="trust-item">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              30+ Lenders
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}