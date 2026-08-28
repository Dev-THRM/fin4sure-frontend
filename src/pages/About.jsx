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
              <h2>What We Do</h2>
              <p className="about-section-sub">
                Finn4sure acts as your financial advisor — not just a marketplace. We evaluate your profile, match you with the most suitable lenders, and guide you from application to disbursement.
              </p>
            </div>

            <div className="about-services-grid">
              <div className="about-service-item">
                <div className="asi-icon asi-home"><Home size={22} color="#0284C7" /></div>
                <div>
                  <strong>Home Loans</strong>
                  <span>From 7.10% · up to ₹30Cr</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon asi-lap"><Building2 size={22} color="#4F46E5" /></div>
                <div>
                  <strong>Loan Against Property</strong>
                  <span>From 8.45% · up to ₹30Cr</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon asi-personal"><CreditCard size={22} color="#0D9488" /></div>
                <div>
                  <strong>Personal Loans</strong>
                  <span>From 9.99% · up to ₹50L</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon asi-business"><Briefcase size={22} color="#D97706" /></div>
                <div>
                  <strong>Business Loans</strong>
                  <span>From 10.75% · up to ₹2Cr</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon asi-vehicle"><Car size={22} color="#E11D48" /></div>
                <div>
                  <strong>Vehicle Loans</strong>
                  <span>From 8.75% · up to 100%</span>
                </div>
              </div>
              <div className="about-service-item">
                <div className="asi-icon asi-partner"><Handshake size={22} color="#CA8A04" /></div>
                <div>
                  <strong>Partner Network</strong>
                  <span>Earn by referring clients</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Panel: Why Finn4sure ── */}
        {activeTab === "why" && (
          <div className="about-panel active">
            <div className="about-section-head">
              <h2>Why Finn4sure</h2>
              <p className="about-section-sub">
                Four reasons borrowers and partners choose us over walking into a single bank.
              </p>
            </div>

            <div className="about-why-grid">
              <div className="about-why-card">
                <div className="awc-num">01</div>
                <h4>30+ Lenders, One Place</h4>
                <p>
                  Compare banks, NBFCs and HFCs side by side instead of settling for your current bank's rate.
                </p>
              </div>
              <div className="about-why-card">
                <div className="awc-num">02</div>
                <h4>Always Free</h4>
                <p>
                  Zero platform fees for borrowers. We're compensated by lenders, never by you.
                </p>
              </div>
              <div className="about-why-card">
                <div className="awc-num">03</div>
                <h4>Expert Guidance</h4>
                <p>
                  Dedicated advisors walk you through eligibility, documents and disbursement end to end.
                </p>
              </div>
              <div className="about-why-card">
                <div className="awc-num">04</div>
                <h4>RBI Compliant &amp; Secure</h4>
                <p>
                  Bank-grade data security and full regulatory compliance on every application.
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
