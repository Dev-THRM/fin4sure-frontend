import React, { useState } from "react";
import { Link } from "react-router-dom";
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
              <div className="ahs-v">350+</div>
              <div className="ahs-l">Borrowers</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">100+</div>
              <div className="ahs-l">Partners</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">30+</div>
              <div className="ahs-l">Lenders</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT AREA WITH STICKY TABS ═══ */}
      <div className="about-content">
        <div className="about-tabs">
          <button
            className={`about-tab ${activeTab === "story" ? "active" : ""}`}
            onClick={() => setActiveTab("story")}
          >
            <span className="at-ic">📖</span> Our Story
          </button>
          <button
            className={`about-tab ${activeTab === "do" ? "active" : ""}`}
            onClick={() => setActiveTab("do")}
          >
            <span className="at-ic">💼</span> What We Do
          </button>
          <button
            className={`about-tab ${activeTab === "why" ? "active" : ""}`}
            onClick={() => setActiveTab("why")}
          >
            <span className="at-ic">🌟</span> Why Finn4sure
          </button>
          <button
            className={`about-tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <span className="at-ic">📞</span> Contact Us
          </button>
        </div>

        {/* ── Tab Panel: Story ── */}
        <div className={`about-panel ${activeTab === "story" ? "active" : ""}`}>
          <div className="about-vm-grid">
            <div className="about-vm-card about-vision">
              <div className="avm-icon">👁️‍🗨️</div>
              <h3>Our Vision</h3>
              <p>
                To create a seamless, digitized lending marketplace where borrowing is transparent, immediate, and fully tailored to the needs of every client.
              </p>
            </div>
            <div className="about-vm-card about-mission">
              <div className="avm-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To empower borrowers with real-time institutional comparisons and automated applications, bypass middlemen delays, and guarantee pricing certainty.
              </p>
            </div>
            <div className="about-vm-card about-values">
              <div className="avm-icon">💎</div>
              <h3>Our Values</h3>
              <p>
                Absolute integrity, pricing transparency, bank-grade customer privacy, and commitment to serving first-time home buyers and SMEs across India.
              </p>
            </div>
          </div>

          <div className="about-story-block">
            <h2>How it started</h2>
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
              <div className="asi-icon">🏠</div>
              <div>
                <strong>Home Loans</strong>
                <span>New properties, builder projects & balance transfers</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon">🏢</div>
              <div>
                <strong>Loan Against Property</strong>
                <span>Unlock capital from residential or commercial buildings</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon">💳</div>
              <div>
                <strong>Personal Loans</strong>
                <span>Collateral-free instant emergency/lifestyle lines</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon">📦</div>
              <div>
                <strong>Business Loans</strong>
                <span>Working capital, plant & machinery and MSME limits</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon">🚗</div>
              <div>
                <strong>Vehicle Loans</strong>
                <span>Low-processing, high-disbursal new & used car loans</span>
              </div>
            </div>
            <div className="about-service-item">
              <div className="asi-icon">🤝</div>
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
                  <div className="acc-ic">📞</div>
                  <div>
                    <div className="acc-k">Phone Support</div>
                    <div className="acc-v">99105 07574</div>
                  </div>
                </a>
                <a href="mailto:support@finn4sure.com" className="acc-row">
                  <div className="acc-ic">📧</div>
                  <div>
                    <div className="acc-k">Email Support</div>
                    <div className="acc-v">support@finn4sure.com</div>
                  </div>
                </a>
                <div className="acc-row">
                  <div className="acc-ic">⏰</div>
                  <div>
                    <div className="acc-k">Work Hours</div>
                    <div className="acc-v">Mon–Sat (9:30 AM – 6:30 PM)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: CTAs */}
            <div className="acc-right">
              <div className="acc-cta-icon">🚀</div>
              <h3>Ready to get started?</h3>
              <p>Find the cheapest lender options for your parameters in 2 minutes.</p>

              <Link to="/loans" className="acc-cta-btn">
                Compare Loans
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
