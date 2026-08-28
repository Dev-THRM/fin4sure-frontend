import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Car,
  Handshake,
  Phone,
  Mail,
  Clock,
  Rocket
} from "lucide-react";
import "./styles/about.css";

export default function About() {
  const [activeTab, setActiveTab] = useState("story");

  return (
    <div className="about-wrap">
      {/* ═══ HERO SECTION ═══ */}
      <div className="about-hero">
        <div className="about-hero-inner">
          <div className="about-tag">✦ About Finn4sure</div>
          <h1 className="about-h1">
            The loan market, <span>unlocked.</span>
          </h1>
          <p className="about-tagline">
            We are India's leading direct lender matchmaking engine, linking home buyers, business owners, and partners to the best institutional capital at minimal cost.
          </p>

          <div className="about-hero-stats">
            <div className="ahs">
              <div className="ahs-v">₹100Cr+</div>
              <div className="ahs-l">Disbursed</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">35+</div>
              <div className="ahs-l">Lending Partners</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">100+</div>
              <div className="ahs-l">Distributors</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">99.2%</div>
              <div className="ahs-l">Approval Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="about-tabs-wrap">
        <div className="about-tabs-nav">
          <button
            className={`atn-btn ${activeTab === "story" ? "active" : ""}`}
            onClick={() => setActiveTab("story")}
          >
            Our Story
          </button>
          <button
            className={`atn-btn ${activeTab === "do" ? "active" : ""}`}
            onClick={() => setActiveTab("do")}
          >
            What We Do
          </button>
          <button
            className={`atn-btn ${activeTab === "why" ? "active" : ""}`}
            onClick={() => setActiveTab("why")}
          >
            Why Finn4sure
          </button>
          <button
            className={`atn-btn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            Contact &amp; Support
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT CONTAINER ═══ */}
      <div className="about-body">
        {/* ── Tab Panel: Our Story ── */}
        <div className={`about-panel ${activeTab === "story" ? "active" : ""}`}>
          <div className="about-section-head">
            <h2>Transforming Credit Discovery in India</h2>
            <p className="about-section-sub">
              Empowering consumers and financial advisors with true institutional price transparency.
            </p>
          </div>

          <div className="about-story-card">
            <div className="about-story-badge">Our Mission</div>
            <h3>Democratizing loan access through data &amp; speed</h3>
            <p>
              Founded by a team of finance veterans and technologists, Finn4sure was born out of a simple observation: navigating the Indian loan ecosystem is unnecessarily complicated. Traditional brokers often recommend options based on high payout incentives, rather than the borrower's best interests.
              <br />
              <br />
              We built Finn4sure to flip the balance of power back to you. By combining directly integrated lender pricing logic with a robust, automated matchmaking engine, we display actual ROI rates upfront. Whether you are looking for a Home Loan, a LAP against commercial assets, or capital for business expansion, we match you directly to the correct credit policies in minutes.
            </p>
          </div>
        </div>

        {/* ── Tab Panel: What We Do ── */}
        <div className={`about-panel ${activeTab === "do" ? "active" : ""}`}>
          <div className="about-section-head">
            <h2>Tailored Credit Solutions</h2>
            <p className="about-section-sub">
              We process applications for multiple credit assets, checking parameters against the exact credit policies of over 30 leading banking partners.
            </p>
          </div>

          <div className="about-services-grid">
            <div className="about-service-item">
              <div className="asi-icon"><Home size={22} /></div>
              <div>
                <strong>Home Loans</strong>
                <span>New properties, builder projects & balance transfers</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon"><Building2 size={22} /></div>
              <div>
                <strong>Loan Against Property</strong>
                <span>Unlock capital from residential or commercial buildings</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon"><CreditCard size={22} /></div>
              <div>
                <strong>Personal Loans</strong>
                <span>Collateral-free instant emergency/lifestyle lines</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon"><Briefcase size={22} /></div>
              <div>
                <strong>Business Loans</strong>
                <span>Working capital, plant & machinery and MSME limits</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon"><Car size={22} /></div>
              <div>
                <strong>Vehicle Loans</strong>
                <span>Low-processing, high-disbursal new & used car loans</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon"><Handshake size={22} /></div>
              <div>
                <strong>Partner Program</strong>
                <span>Custom portal & lead pipelines for financial agents</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Panel: Why ── */}
        <div className={`about-panel ${activeTab === "why" ? "active" : ""}`}>
          <div className="about-section-head">
            <h2>Why Choose Finn4sure?</h2>
            <p className="about-section-sub">
              We bypass traditional brokerage roadblocks by putting direct data in your hands.
            </p>
          </div>

          <div className="about-why-grid">
            <div className="about-why-card">
              <div className="awc-num">01</div>
              <h4>Direct Matchmaking Engine</h4>
              <p>
                We do not use generic estimates. We calculate your eligibility based on specific parameters (CIBIL score, income proof, property location) mapped to active banking policies.
              </p>
            </div>
            <div className="about-why-card">
              <div className="awc-num">02</div>
              <h4>Absolute Price Transparency</h4>
              <p>
                Floating or fixed, we display the exact ranges side-by-side with zero hidden markups. You choose the lender you prefer, and we apply directly on your behalf.
              </p>
            </div>
            <div className="about-why-card">
              <div className="awc-num">03</div>
              <h4>Direct API Integrations</h4>
              <p>
                Our integration routes applications directly to bank processing pipelines, cutting out external agents, safeguarding your document security, and accelerating sanction turnaround.
              </p>
            </div>
            <div className="about-why-card">
              <div className="awc-num">04</div>
              <h4>Zero Fee Policy</h4>
              <p>
                Our service is free for borrowers. We earn directly from institutional partners, meaning our recommendations remain objective, transparent, and aligned to your rates.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tab Panel: Contact ── */}
        <div className={`about-panel ${activeTab === "contact" ? "active" : ""}`}>
          <div className="about-contact-card">
            {/* Left side: contact details */}
            <div className="acc-left">
              <h2>Get in Touch</h2>
              <p>Have questions about your application or need help comparing options? Speak to a loan specialist.</p>

              <div className="acc-rows">
                <a href="tel:9910507574" className="acc-row">
                  <div className="acc-ic"><Phone size={18} /></div>
                  <div>
                    <div className="acc-k">Phone Support</div>
                    <div className="acc-v">99105 07574</div>
                  </div>
                </a>
                <a href="mailto:support@finn4sure.com" className="acc-row">
                  <div className="acc-ic"><Mail size={18} /></div>
                  <div>
                    <div className="acc-k">Email Support</div>
                    <div className="acc-v">support@finn4sure.com</div>
                  </div>
                </a>
                <div className="acc-row">
                  <div className="acc-ic"><Clock size={18} /></div>
                  <div>
                    <div className="acc-k">Work Hours</div>
                    <div className="acc-v">Mon–Sat (9:30 AM – 6:30 PM)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: CTAs */}
            <div className="acc-right">
              <div className="acc-cta-icon"><Rocket size={28} /></div>
              <h3>Ready to get started?</h3>
              <p>Find the cheapest lender options for your parameters in 2 minutes.</p>

              <Link to="/" className="acc-cta-btn">
                Check Loan Options
              </Link>
              <Link to="/" state={{ activeView: "partnerStepper" }} className="acc-cta-btn partner-cta">
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export { About };
