import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Star,
  Mail,
  Target,
  Rocket,
  Handshake,
  Home,
  Building2,
  CreditCard,
  Car,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import "./styles/about.css";

export default function About() {
  const [activeTab, setActiveTab] = useState("story");

  return (
    <div className="about-wrap">
      {/* ═══ HERO SECTION ═══ */}
      <div className="about-hero">
        <div className="about-hero-inner">
          <div className="about-tag">✦ ABOUT FINN4SURE</div>
          <h1 className="about-h1">
            The loan market, <span>unlocked.</span>
          </h1>
          <p className="about-tagline">
            India's smart loan distribution network — connecting borrowers with the right lenders, and partners with the right opportunities.
          </p>

          <div className="about-hero-stats">
            <div className="ahs">
              <div className="ahs-v">₹100Cr+</div>
              <div className="ahs-l">DISBURSED</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">350+</div>
              <div className="ahs-l">BORROWERS</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">100+</div>
              <div className="ahs-l">PARTNERS</div>
            </div>
            <div className="ahs">
              <div className="ahs-v">30+</div>
              <div className="ahs-l">LENDERS</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT CONTAINER ═══ */}
      <div className="about-content">
        {/* Floating Centered Tab Navigation */}
        <div className="about-tabs-container">
          <div className="about-tabs">
            <button
              className={`about-tab ${activeTab === "story" ? "active" : ""}`}
              onClick={() => setActiveTab("story")}
            >
              <BookOpen size={16} className="at-icon" />
              <span>Our Story</span>
            </button>
            <button
              className={`about-tab ${activeTab === "do" ? "active" : ""}`}
              onClick={() => setActiveTab("do")}
            >
              <Briefcase size={16} className="at-icon" />
              <span>What We Do</span>
            </button>
            <button
              className={`about-tab ${activeTab === "why" ? "active" : ""}`}
              onClick={() => setActiveTab("why")}
            >
              <Star size={16} className="at-icon" />
              <span>Why Finn4sure</span>
            </button>
            <button
              className={`about-tab ${activeTab === "contact" ? "active" : ""}`}
              onClick={() => setActiveTab("contact")}
            >
              <Mail size={16} className="at-icon" />
              <span>Get in Touch</span>
            </button>
          </div>
        </div>

        {/* ── Tab Panel: Our Story ── */}
        {activeTab === "story" && (
          <div className="about-panel active">
            {/* Top 3 Cards Row (Vision, Mission, Values) */}
            <div className="about-vm-grid">
              <div className="about-vm-card about-vision">
                <div className="avm-icon-wrapper vision-icon">
                  <Target size={26} />
                </div>
                <h3>Our Vision</h3>
                <p>
                  To be India's most reliable financial intermediary — where every borrower gets the right loan at the right rate, and every partner grows alongside us.
                </p>
              </div>

              <div className="about-vm-card about-mission">
                <div className="avm-icon-wrapper mission-icon">
                  <Rocket size={26} />
                </div>
                <h3>Our Mission</h3>
                <p>
                  Simplify access to credit by leveraging technology, expert advisory, and a curated network of 30+ lending partners across India.
                </p>
              </div>

              <div className="about-vm-card about-values">
                <div className="avm-icon-wrapper values-icon">
                  <Handshake size={26} />
                </div>
                <h3>Our Values</h3>
                <p>
                  Transparency in every interaction. Client-first advice. Zero hidden charges. Long-term relationships built on trust, not transactions.
                </p>
              </div>
            </div>

            {/* Bottom Full-Width Card (How it started) */}
            <div className="about-story-block">
              <h2>How it started</h2>
              <p>
                Most borrowers walk into their existing bank and accept whatever rate they're offered — unaware that dozens of other lenders might give them a far better deal. Finn4sure was built to close that gap. We bring the entire loan market to one place, compare it transparently, and guide you to the option that genuinely fits your profile.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab Panel: What We Do ── */}
        {activeTab === "do" && (
          <div className="about-panel active">
            <div className="about-section-head">
              <h2>Tailored Credit Solutions</h2>
              <p className="about-section-sub">
                We process applications across multiple credit products, matching parameters against the exact credit policies of over 30 leading banks and NBFCs.
              </p>
            </div>

            <div className="about-services-grid">
              <div className="about-service-item">
                <div className="asi-icon"><Home size={22} color="#0284C7" /></div>
                <div>
                  <strong>Home Loans</strong>
                  <span>New properties, builder purchases &amp; balance transfers</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon"><Building2 size={22} color="#0D9488" /></div>
                <div>
                  <strong>Loan Against Property</strong>
                  <span>Unlock high-value liquidity against residential or commercial properties</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon"><CreditCard size={22} color="#8B5CF6" /></div>
                <div>
                  <strong>Personal Loans</strong>
                  <span>Instant collateral-free funds for personal emergencies &amp; lifestyle</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon"><Briefcase size={22} color="#D97706" /></div>
                <div>
                  <strong>Business Loans</strong>
                  <span>Working capital, term loans, and MSME machinery financing</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon"><Car size={22} color="#E11D48" /></div>
                <div>
                  <strong>Vehicle Loans</strong>
                  <span>Competitive interest rates on new and pre-owned car financing</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon"><Handshake size={22} color="#2563EB" /></div>
                <div>
                  <strong>Partner Program</strong>
                  <span>Dedicated broker portal, real-time tracking &amp; instant payouts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Panel: Why Finn4sure ── */}
        {activeTab === "why" && (
          <div className="about-panel active">
            <div className="about-section-head">
              <h2>Why Choose Finn4sure?</h2>
              <p className="about-section-sub">
                We bypass traditional brokerage friction by putting real-time rates and direct matching in your hands.
              </p>
            </div>

            <div className="about-why-grid">
              <div className="about-why-card">
                <div className="awc-num">01</div>
                <h4>Direct Matchmaking Engine</h4>
                <p>
                  No generic estimates. We calculate exact eligibility based on your financial parameters (CIBIL score, income proof, property location) mapped to live banking policies.
                </p>
              </div>
              <div className="about-why-card">
                <div className="awc-num">02</div>
                <h4>Absolute Price Transparency</h4>
                <p>
                  Floating or fixed, we display verified interest rates side-by-side with zero hidden markups. You choose the lender you prefer, and we apply directly on your behalf.
                </p>
              </div>
              <div className="about-why-card">
                <div className="awc-num">03</div>
                <h4>Direct Bank Integrations</h4>
                <p>
                  Our system routes applications directly to bank sanctioning desks, cutting out sub-agents, safeguarding document security, and accelerating turnaround times.
                </p>
              </div>
              <div className="about-why-card">
                <div className="awc-num">04</div>
                <h4>Zero Cost to Borrowers</h4>
                <p>
                  Our advisory and application services are completely free for borrowers. We earn transparently from institutional partners, keeping our advice 100% objective.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Panel: Get in Touch ── */}
        {activeTab === "contact" && (
          <div className="about-panel active">
            <div className="about-contact-card">
              {/* Left side: contact details */}
              <div className="acc-left">
                <h2>Get in Touch</h2>
                <p>Have questions about your loan application or need personalized advice? Speak directly to our loan specialists.</p>

                <div className="acc-rows">
                  <a href="tel:9910507574" className="acc-row">
                    <div className="acc-ic"><Phone size={18} color="#0284C7" /></div>
                    <div>
                      <div className="acc-k">Phone Support</div>
                      <div className="acc-v">99105 07574</div>
                    </div>
                  </a>
                  <a href="mailto:support@finn4sure.com" className="acc-row">
                    <div className="acc-ic"><Mail size={18} color="#0D9488" /></div>
                    <div>
                      <div className="acc-k">Email Support</div>
                      <div className="acc-v">support@finn4sure.com</div>
                    </div>
                  </a>
                  <div className="acc-row">
                    <div className="acc-ic"><Clock size={18} color="#8B5CF6" /></div>
                    <div>
                      <div className="acc-k">Working Hours</div>
                      <div className="acc-v">Mon–Sat (9:30 AM – 6:30 PM)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: CTAs */}
              <div className="acc-right">
                <div className="acc-cta-icon">
                  <Rocket size={36} color="#A5F3FC" />
                </div>
                <h3>Ready to get started?</h3>
                <p>Compare pre-qualified offers from 30+ top banks in under 2 minutes.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '240px', position: 'relative', zIndex: 2 }}>
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
        )}
      </div>
    </div>
  );
}
export { About };
