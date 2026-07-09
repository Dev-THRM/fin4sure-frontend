import React from "react";
import { Link } from "react-router-dom";
import "./styles/loansRedirect.css";

export default function LoansRedirect() {
  return (
    <div className="loans-redirect-layout animate-fade-up">
      <div className="loans-redirect-wrap">
        <div className="loans-redirect-icon">📈</div>
        <h2 className="loans-redirect-title">Compare &amp; Apply for a Loan</h2>
        <p className="loans-redirect-sub">
          Use our EMI calculator to compare live rates from <strong>30+ lenders</strong> across all loan types — then apply in minutes.
        </p>
        <div className="loans-redirect-btns">
          <Link to="/EMI-calculator" className="btn-primary">
            📈 Open EMI Calculator
          </Link>
          <Link to="/apply" className="btn-secondary">
            Apply for a Loan →
          </Link>
        </div>
      </div>
    </div>
  );
}
export { LoansRedirect };
