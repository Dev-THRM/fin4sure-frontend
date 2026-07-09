import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles/partner.css";

export default function PartnerInfo() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Who can become a Finn4sure partner?",
      a: "Any individual or business registered in India — DSAs, financial advisors, CA firms, real estate agents, insurance agents, and freelancers. You must be 21+ with a valid PAN and bank account."
    },
    {
      q: "How do I track my referrals?",
      a: "Once approved, you get a dedicated partner dashboard to track all submitted applications, their current loan journey stage, and real-time status updates."
    },
    {
      q: "Is there a minimum referral requirement?",
      a: "No minimum requirement. Refer as many or as few clients as you like — there's no pressure or quota."
    }
  ];

  return (
    <div className="partner-page-content animate-fade-up">
      {/* ═══ HERO SECTION ═══ */}
      <div className="partner-hero-section">
        <h2>
          Grow <em>together</em> with Finn4sure
        </h2>
        <p>
          Join India's fastest-growing loan distribution network. Get dedicated support and help your clients access competitive financing from 30+ lenders.
        </p>

        <div className="partner-perks">
          <div className="perk-box">
            <div className="pv">100+</div>
            <div className="pl">Active Partners</div>
          </div>
          <div className="perk-box">
            <div className="pv">₹100Cr+</div>
            <div className="pl">Loans Disbursed</div>
          </div>
          <div className="perk-box">
            <div className="pv">30+</div>
            <div className="pl">Lending Partners</div>
          </div>
          <div className="perk-box">
            <div className="pv">4.8★</div>
            <div className="pl">Partner Rating</div>
          </div>
        </div>
      </div>

      {/* ═══ HOW IT WORKS SECTION ═══ */}
      <div className="page-hero" style={{ marginBottom: "32px" }}>
        <h2>How It Works</h2>
        <p>Join in 4 simple steps and start helping clients get better loans</p>
      </div>

      <div className="steps-row">
        <div className="hw-step">
          <div className="hw-num">1</div>
          <h4>Register</h4>
          <p>
            Complete quick registration with basic KYC details. Instant approval for eligible applicants.
          </p>
        </div>
        <div className="hw-step">
          <div className="hw-num">2</div>
          <h4>Refer Clients</h4>
          <p>
            Share Finn4sure with clients who need loans. We handle the entire process from application to disbursal.
          </p>
        </div>
        <div className="hw-step">
          <div className="hw-num">3</div>
          <h4>Track Progress</h4>
          <p>
            Monitor all referred clients through your partner dashboard. Get real-time status updates at every stage.
          </p>
        </div>
        <div className="hw-step">
          <div className="hw-num">4</div>
          <h4>Get Rewarded</h4>
          <p>
            Sit back and let Finn4sure handle the rest. As your referred clients get disbursed, you earn rewards — a win for you and your clients.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: "center", margin: "36px 0" }}>
        <Link
          to="/broker-register"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            width: "auto",
            padding: "14px 36px",
            fontSize: "1rem",
            textDecoration: "none"
          }}
        >
          Join as a Partner →
        </Link>
      </div>

      {/* ═══ FAQ SECTION ═══ */}
      <div className="page-hero" style={{ marginBottom: "20px" }}>
        <h2>Frequently Asked Questions</h2>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div key={index} className="faq-item">
              <button
                className={`faq-q ${isOpen ? "open" : ""}`}
                onClick={() => toggleFaq(index)}
              >
                {faq.q}
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className={`faq-a ${isOpen ? "open" : ""}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export { PartnerInfo };
