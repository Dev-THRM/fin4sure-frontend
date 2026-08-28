import React from "react";
import { Link } from "react-router-dom";
import {
  Handshake,
  BarChart3,
  CircleDollarSign,
  Zap,
  Landmark,
  ShieldCheck,
  Lightbulb,
  RefreshCw,
  Star
} from "lucide-react";
import logo from "../../assets/images/brandlogo.png";

export default function BrandPanel({ mode = "borrower" }) {
  const isPartner = mode === "partner";

  return (
    <aside className={`brand-panel ${isPartner ? "partner-mode" : ""}`} id="brandPanel">
      {/* Brand logo */}
      <Link to="/" className="nav-logo">
        <img
          src={logo}
          className="brand-panel-logo"
          alt="Finn4sure Logo"
        />
      </Link>

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
              <span className="b-feat-ic"><Handshake size={15} /></span> Direct Client Referral
            </div>
            <div className="b-feat">
              <span className="b-feat-ic"><BarChart3 size={15} /></span> Real-time Lead Tracking
            </div>
            <div className="b-feat">
              <span className="b-feat-ic"><CircleDollarSign size={15} /></span> High Payout Commission
            </div>
          </>
        ) : (
          <>
            <div className="b-feat">
              <span className="b-feat-ic"><Zap size={15} /></span> Live ROI Ticker
            </div>
            <div className="b-feat">
              <span className="b-feat-ic"><Landmark size={15} /></span> Direct Lender Integrations
            </div>
            <div className="b-feat">
              <span className="b-feat-ic"><ShieldCheck size={15} /></span> Bank-grade Data Encryption
            </div>
            <div className="b-feat">
              <span className="b-feat-ic"><Lightbulb size={15} /></span> EMI Saver
            </div>
            <div className="b-feat">
              <span className="b-feat-ic"><RefreshCw size={15} /></span> Home Loan Top-ups & Balance Transfer
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
          <div className="stat-val" id="sv3" style={{ display: "inline-flex", alignItems: "center", gap: "2px", justifyContent: "center" }}>
            4.8<Star size={14} fill="currentColor" />
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
