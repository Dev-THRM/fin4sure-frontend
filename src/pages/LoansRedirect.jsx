import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/loansRedirect.css";

export default function LoansRedirect() {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    navigate("/", { state: { activeView: "borrowerStepper" } });
  };

  return (
    <div className="loans-redirect-layout animate-fade-up">
      <div className="loans-redirect-wrap">
        <div className="loans-icon-container">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="72" height="72" rx="18" fill="#E2E5F8" />
            <path d="M12 20H60M12 32H60M12 44H60M12 56H60" stroke="#C3C9E9" strokeWidth="1" />
            <path d="M20 12V60M32 12V60M44 12V60M56 12V60" stroke="#C3C9E9" strokeWidth="1" />
            <path d="M16 50L30 36L44 42L58 20" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        <h2 className="loans-redirect-title">Compare &amp; Apply for a Loan</h2>
        <p className="loans-redirect-sub">
          Use our EMI calculator to compare live rates from <strong>60+ lenders</strong><br/>
          across all loan types — then apply in minutes.
        </p>

        <div className="loans-redirect-btns">
          <button onClick={() => navigate("/EMI-calculator")} className="loans-btn-calc">
            <span className="btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
            </span>
            Open EMI Calculator
          </button>
          
          <button onClick={handleApplyClick} className="loans-btn-apply">
            Apply for a Loan →
          </button>
        </div>
      </div>
    </div>
  );
}
export { LoansRedirect };
