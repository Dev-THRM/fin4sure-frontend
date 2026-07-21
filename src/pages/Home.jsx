import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BrandPanel from "../components/home/BrandPanel";
import CompanyRibbon from "../components/home/CompanyRibbon";
import RoleCards from "../components/home/RoleCards";
import HomeEmiWidget from "../components/home/HomeEmiWidget";
import BorrowerStepper from "../components/home/BorrowerStepper";
import PartnerStepper from "../components/home/PartnerStepper";
import "./styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState("roles");

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const view = searchParams.get("view");
      if (view === "borrower" || view === "borrowerStepper") {
        setActiveView("borrowerStepper");
      } else if (view === "partner" || view === "partnerStepper") {
        setActiveView("partnerStepper");
      }
    }
  }, [location]);

  const handleSelectRole = (role) => {
    if (role === "borrower") {
      setActiveView("borrowerStepper");
    } else if (role === "partner") {
      setActiveView("partnerStepper");
    }
  };

  return (
    <div className={`brand-form-layout animate-fade-up ${activeView === "partnerStepper" ? "partner-mode-active" : ""}`}>
      {/* Left branding panel */}
      <BrandPanel mode={activeView === "partnerStepper" ? "partner" : "borrower"} />

      {/* Right onboarding panel */}
      <main className="form-panel">
        <CompanyRibbon />

        <div className="form-container">
          {activeView === "roles" ? (
            <>
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
            </>
          ) : activeView === "borrowerStepper" ? (
            <BorrowerStepper onBack={() => setActiveView("roles")} />
          ) : (
            <PartnerStepper onBack={() => setActiveView("roles")} />
          )}
        </div>
      </main>
    </div>
  );
}
