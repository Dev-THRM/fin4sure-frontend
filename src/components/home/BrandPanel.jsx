import React from "react";

export default function BrandPanel({ mode = "borrower" }) {
  const isPartner = mode === "partner";

  return (
    <aside className={`brand-panel ${isPartner ? "partner-mode" : ""}`} id="brandPanel">
      {/* Brand logo */}
      <div className="b-logo">
        <div className="b-logo-name">
          <span className="nl-finn">Finn</span>
          <span className="nl-4">4</span>
          <span className="nl-sure">sure</span>
        </div>
      </div>

      {/* Brand hero text */}
      <div className="b-hero">
        <div className="b-eyebrow">
          {isPartner ? "✦ Partner Program" : "✦ Finn4sure Network"}
        </div>
        <h1>
          {isPartner ? (
            <>
              Grow <em>together.</em>
            </>
          ) : (
            <>
              Your loan journey, made <em>certain.</em>
            </>
          )}
        </h1>
        <p id="brandDesc">
          {isPartner
            ? "Join our growing network of 100+ distribution partners helping clients access the best loan products."
            : "Verify your identity and get matched with the best loan offers tailored to your needs."}
        </p>
      </div>

      {/* Brand feature bullet points */}
      <div className="b-features">
        {isPartner ? (
          <>
            <div className="b-feat">
              <span className="b-feat-ic">🤝</span> Direct Client Referral
            </div>
            <div className="b-feat">
              <span className="b-feat-ic">📊</span> Real-time Lead Tracking
            </div>
            <div className="b-feat">
              <span className="b-feat-ic">💰</span> High Payout Commission
            </div>
          </>
        ) : (
          <>
            <div className="b-feat">
              <span className="b-feat-ic">⚡</span> Live ROI Ticker
            </div>
            <div className="b-feat">
              <span className="b-feat-ic">🏦</span> Direct Lender Integrations
            </div>
            <div className="b-feat">
              <span className="b-feat-ic">🔒</span> Bank-grade Data Encryption
            </div>
            <div className="b-feat">
              <span className="b-feat-ic">💡</span> EMI Saver
            </div>
            <div className="b-feat">
              <span className="b-feat-ic">🔄</span> Home Loan Top-ups & Balance Transfer
            </div>
          </>
        )}
      </div>

      {/* Brand statistics card */}
      <div className="b-stats">
        <div className="stat">
          <div className="stat-val" id="sv1">
            {isPartner ? "₹50Cr+" : "₹100Cr+"}
          </div>
          <div className="stat-lbl" id="sl1">
            Disbursed
          </div>
        </div>
        <div className="stat">
          <div className="stat-val" id="sv2">
            {isPartner ? "100+" : "350+"}
          </div>
          <div className="stat-lbl" id="sl2">
            {isPartner ? "Partners" : "Borrowers"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-val" id="sv3">
            4.8★
          </div>
          <div className="stat-lbl" id="sl3">
            Rating
          </div>
        </div>
      </div>
      <div className="vault-arc"></div>
    </aside>
  );
}
export { BrandPanel };
