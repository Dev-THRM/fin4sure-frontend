import React from "react";

export default function RoleCards({ onSelectRole }) {
  return (
    <div className="role-cards">
      {/* Borrower Role Card */}
      <div 
        className="role-card borrower" 
        onClick={() => onSelectRole("borrower")}
      >
        <div className="role-icon b-icon">🏠</div>
        <div className="role-body">
          <div className="role-title">Borrower</div>
          <div className="role-desc">Get matched with 30+ lenders for the best rates</div>
          <div className="role-cta">Check Now →</div>
        </div>
        <div className="role-arrow">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Partner Role Card */}
      <div 
        className="role-card partner" 
        onClick={() => onSelectRole("partner")}
      >
        <div className="role-icon p-icon">🤝</div>
        <div className="role-body">
          <div className="role-title">Partner</div>
          <div className="role-desc">Refer clients and grow your financial network</div>
          <div className="role-cta">Join Now →</div>
        </div>
        <div className="role-arrow">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
export { RoleCards };
