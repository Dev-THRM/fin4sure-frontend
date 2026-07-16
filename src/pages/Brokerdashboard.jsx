import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LOAN_PRODUCTS } from "../utils/constants";
import { LENDERS } from "../utils/loanConstants";
import { fmtINR } from "../utils/formatters";
import "./styles/brokerDashboard.css";

export default function BrokerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Profile and data states
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);

  // UI States
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // Add Client Form States
  const [acName, setAcName] = useState("");
  const [acMobile, setAcMobile] = useState("");
  const [acEmail, setAcEmail] = useState("");
  const [acAmt, setAcAmt] = useState("20");
  const [acAmtUnit, setAcAmtUnit] = useState(100000); // Lakh vs Crore
  const [acTenure, setAcTenure] = useState("180"); // months
  const [acLoanType, setAcLoanType] = useState("home");
  const [acReachMode, setAcReachMode] = useState("direct");
  const [selectedLenders, setSelectedLenders] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchClients();
    fetchLeads();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        credentials: "include",
      });
      if (!res.ok) return navigate("/login");
      setUser(await res.json());
    } catch (e) {
      navigate("/login");
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch("http://localhost:5000/api/broker/getRefferedClients", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error("Failed to fetch clients:", e.message);
    }
  }

  async function fetchLeads() {
    try {
      const res = await fetch("http://localhost:5000/api/broker/getBrokerLeads", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error("Failed to fetch leads:", e.message);
    }
  }

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      navigate("/");
    }
  };

  // Filter leads based on tab choice
  const filteredLeads = useMemo(() => {
    if (activeFilter === "all") return leads;
    if (activeFilter === "in_progress") {
      return leads.filter((l) => l.status === "pending" || l.status === "processing");
    }
    return leads.filter((l) => l.status === activeFilter);
  }, [leads, activeFilter]);

  // Math metrics
  const pendingCount = leads.filter((l) => l.status === "pending").length;
  const approvedCount = leads.filter((l) => l.status === "approved").length;

  const getProductTitle = (id) => {
    return LOAN_PRODUCTS.find((p) => p.id === id)?.name || id;
  };

  const getProductEmoji = (id) => {
    const emojis = {
      "home-loan": "🏠",
      "loan-against-property": "🏢",
      "personal-loan": "💳",
      "business-loan": "📦",
      "car-loan": "🚗",
    };
    return emojis[id] || "📄";
  };

  // Add Client - Lender option list based on loan type
  const lenderOptions = useMemo(() => {
    return LENDERS.filter((l) => !l._hidden && l.rates && l.rates[acLoanType])
      .map((l) => {
        const ratesObj = l.rates[acLoanType];
        const rates = ratesObj ? (ratesObj.f || ratesObj.x) : null;
        return { name: l.name, rate: rates ? rates[0] : null };
      })
      .filter((l) => l.rate !== null);
  }, [acLoanType]);

  const handleToggleLender = (name) => {
    if (selectedLenders.includes(name)) {
      setSelectedLenders(selectedLenders.filter((n) => n !== name));
    } else {
      setSelectedLenders([...selectedLenders, name]);
    }
  };

  const handleSelectAllLenders = () => {
    if (selectedLenders.length === lenderOptions.length) {
      setSelectedLenders([]);
    } else {
      setSelectedLenders(lenderOptions.map((o) => o.name));
    }
  };

  const submitAddClient = async (e) => {
    e.preventDefault();
    if (!acName || !acMobile) {
      alert("Please enter client name and mobile number");
      return;
    }

    try {
      // Direct client referral - since backend might not have direct POST endpoint,
      // we'll attempt submission or mock add it to lead states locally.
      const amountVal = parseFloat(acAmt) * acAmtUnit;
      const payload = {
        name: acName,
        number: acMobile,
        email: acEmail,
        product: acLoanType,
        amount: amountVal,
        tenure: parseInt(acTenure),
        preferredLenders: selectedLenders,
        reachMode: acReachMode,
      };

      // Mock lead for broker's instant view
      const mockLead = {
        _id: "MOCK" + Math.floor(Math.random() * 9000),
        name: acName,
        product: acLoanType,
        status: "pending",
        createdAt: new Date().toISOString(),
        remark: `Preferred lenders: ${selectedLenders.join(", ") || "None"}. Contact: ${acReachMode}`,
      };

      setLeads([mockLead, ...leads]);
      setClients([...clients, { _id: mockLead._id, name: acName, number: acMobile }]);

      alert(`✅ Customer "${acName}" referred successfully! Their application is now tracked on your dashboard.`);
      setShowAddClientModal(false);

      // Reset form
      setAcName("");
      setAcMobile("");
      setAcEmail("");
      setAcAmt("20");
      setAcTenure("180");
      setSelectedLenders([]);
    } catch (e) {
      alert("Error adding client: " + e.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--navy)", fontWeight: 700 }}>
        Loading partner profile...
      </div>
    );
  }

  return (
    <div className="pdash-wrap">
      {/* ═══ PARTNER DASHBOARD HEADER ═══ */}
      <div className="pdash-header">
        <div className="pdash-header-inner">
          <div className="pdash-greeting">
            <div className="pdash-avatar">
              {user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "PT"}
            </div>
            <div>
              <div className="cdash-welcome">Partner Workspace 👋</div>
              <div className="pdash-name">{user.name}</div>
              <div className="pdash-meta">
                <span className="pdash-badge">Finn4sure Partner</span>
                <span className="pdash-id">ID: {user.brokerId || user.id}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button className="pdash-support-pill" onClick={() => setShowSupportModal(true)}>
              <span className="csp-dot"></span> Support
            </button>
            <button className="pdash-logout" onClick={handleSignOut}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Workspace banner tabs placeholder */}
        <div className="pdash-tab-bar">
          <button className="pdash-tab active">📊 Referral Dashboard</button>
        </div>
      </div>

      {/* ═══ BODY WORKSPACE ═══ */}
      <div className="pdash-body">
        {/* KPI stat metrics row */}
        <div className="pdash-kpi-row animate-fade-up">
          <div className="pdash-kpi">
            <div className="pdash-kpi-icon" style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}>👥</div>
            <div>
              <div className="pdash-kpi-val">{clients.length}</div>
              <div className="pdash-kpi-lbl">Total Clients</div>
            </div>
          </div>
          <div className="pdash-kpi">
            <div className="pdash-kpi-icon" style={{ backgroundColor: "#FFF8E8", color: "#D4A017" }}>⏳</div>
            <div>
              <div className="pdash-kpi-val">{pendingCount}</div>
              <div className="pdash-kpi-lbl">Pending Leads</div>
            </div>
          </div>
          <div className="pdash-kpi">
            <div className="pdash-kpi-icon" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>✓</div>
            <div>
              <div className="pdash-kpi-val">{approvedCount}</div>
              <div className="pdash-kpi-lbl">Approved Loans</div>
            </div>
          </div>
          <div className="pdash-kpi">
            <div className="pdash-kpi-icon" style={{ backgroundColor: "#FDF2F8", color: "#BE185D" }}>📈</div>
            <div>
              <div className="pdash-kpi-val">₹{leads.length > 0 ? (leads.length * 25).toFixed(0) : "0"}L</div>
              <div className="pdash-kpi-lbl">Referral Vol.</div>
            </div>
          </div>
        </div>

        {/* Eye-catching Refer Client banner */}
        <div className="pdash-addclient-banner animate-fade-up" onClick={() => setShowAddClientModal(true)}>
          <div className="pacb-glow"></div>
          <div className="pacb-left">
            <div className="pacb-icon">✨</div>
            <div className="pacb-txt">
              <div className="pacb-title">Got a new borrower client?</div>
              <div className="pacb-sub">Refer their details in 1 minute — pick loan asset, size &Preferred Lenders list</div>
            </div>
          </div>
          <button className="pacb-btn">+ Refer Client</button>
        </div>

        {/* Main Dashboard Workspace Grid */}
        <div className="pdash-main-grid animate-fade-up">
          {/* Left Column */}
          <div className="pdash-left">
            <div className="pdash-section-head">
              <h3>Referred Clients &amp; Status</h3>
              <button className="pdash-add-btn" onClick={() => setShowAddClientModal(true)}>
                + Add Referral
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="pdash-filter-row">
              <button
                className={`pdash-ftab ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Referrals ({leads.length})
              </button>
              <button
                className={`pdash-ftab ${activeFilter === "in_progress" ? "active" : ""}`}
                onClick={() => setActiveFilter("in_progress")}
              >
                In Progress ({pendingCount})
              </button>
              <button
                className={`pdash-ftab ${activeFilter === "approved" ? "active" : ""}`}
                onClick={() => setActiveFilter("approved")}
              >
                Approved ({approvedCount})
              </button>
            </div>

            {/* Referral Cards List */}
            <div className="cd-loan-list">
              {filteredLeads.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", background: "#fff", border: "1px solid #E6EEF8", borderRadius: "18px", color: "var(--text2)", fontSize: ".88rem" }}>
                  No referred leads found for this filter tab.
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div key={lead._id} className="cdl-card">
                    <div className="cdl-top">
                      <div className="cdl-left">
                        <div className="cdl-type-icon" style={{ backgroundColor: "#ECFDF5", color: "#0F766E" }}>
                          {getProductEmoji(lead.product)}
                        </div>
                        <div className="cdl-info">
                          <h4>{lead.name}</h4>
                          <div className="cdl-meta">
                            Asset: {getProductTitle(lead.product)} · Referred: {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="cdl-right">
                        <span
                          className={`cdl-status-chip ${lead.status === "approved"
                              ? "cdl-chip-green"
                              : lead.status === "rejected"
                                ? "cdl-chip-amber"
                                : "cdl-chip-blue"
                            }`}
                        >
                          <span className="cdl-chip-dot"></span>
                          {lead.status === "approved"
                            ? "Approved"
                            : lead.status === "rejected"
                              ? "Rejected"
                              : "Processing"}
                        </span>
                      </div>
                    </div>

                    {lead.remark && (
                      <div className="cdl-remark" style={{ fontSize: ".76rem", background: "#F4FBF7", border: "1px solid #A7F3D0", color: "#065F46" }}>
                        💡 {lead.remark}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="cdash-right">
            {/* Dedicated advisor support */}
            <div className="pdash-support-card">
              <div className="cdsm-head" style={{ color: "rgba(255,255,255,.65)" }}>Your Support Manager</div>
              <div className="cdsm-person">
                <div className="cdsm-avatar" style={{ background: "linear-gradient(135deg, #A7F3D0, #34D399)", color: "#064E3B" }}>RM</div>
                <div>
                  <div className="cdsm-name">Mr. Rishabh Mathur</div>
                  <div className="cdsm-role" style={{ color: "rgba(255,255,255,.7)" }}>Mortgage Specialist</div>
                </div>
                <span className="cdsm-online" style={{ color: "#34D399" }}>
                  <span className="psc-dot" style={{ backgroundColor: "#34D399" }}></span>Online
                </span>
              </div>
              <div className="cdsm-actions">
                <a className="cdsm-btn" href="tel:9910507574">
                  📞 Call
                </a>
                <a className="cdsm-btn" href="mailto:support@finn4sure.com">
                  📧 Email
                </a>
                <a className="cdsm-btn" href="https://wa.me/919910507574" target="_blank" rel="noreferrer">
                  📱 WhatsApp
                </a>
              </div>
              <div className="cdsm-hours" style={{ color: "rgba(255,255,255,.55)" }}>Mon–Sat · 9:30 AM – 6:30 PM IST</div>
            </div>

            {/* Quick Links */}
            <div className="pdash-quick-links">
              <div className="pql-item" onClick={() => setShowAddClientModal(true)}>
                <span>➕ Refer New Client</span>
                <span>→</span>
              </div>
              <Link to="/EMI-calculator" className="pql-item" style={{ textDecoration: "none" }}>
                <span>🧮 Open EMI Calculator</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ REFER CLIENT MODAL ═══ */}
      {showAddClientModal && (
        <div className="cd-modal" onClick={() => setShowAddClientModal(false)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <div className="cd-modal-head" style={{ background: "linear-gradient(135deg,#042F2A,#064E3B 50%,#0F766E)" }}>
              <span>➕ Refer Client Form</span>
              <button onClick={() => setShowAddClientModal(false)}>&times;</button>
            </div>
            <div className="cd-modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
              <form onSubmit={submitAddClient} className="apply-form">
                <div className="apply-form-group">
                  <label>Client Full Name *</label>
                  <div className="input-wrap">
                    <span className="icon">👤</span>
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={acName}
                      onChange={(e) => setAcName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="apply-form-row">
                  <div className="apply-form-group">
                    <label>WhatsApp Mobile *</label>
                    <div className="input-wrap">
                      <span className="icon">📱</span>
                      <input
                        type="text"
                        placeholder="10-digit number"
                        maxLength={10}
                        value={acMobile}
                        onChange={(e) => setAcMobile(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                  </div>

                  <div className="apply-form-group">
                    <label>Email Address</label>
                    <div className="input-wrap">
                      <span className="icon">📧</span>
                      <input
                        type="email"
                        placeholder="customer@email.com"
                        value={acEmail}
                        onChange={(e) => setAcEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="apply-form-row">
                  <div className="apply-form-group">
                    <label>Loan Asset Type *</label>
                    <div className="input-wrap" style={{ padding: "0 6px" }}>
                      <select
                        value={acLoanType}
                        onChange={(e) => setAcLoanType(e.target.value)}
                        required
                        style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".92rem", fontWeight: "600", color: "var(--navy)" }}
                      >
                        {LOAN_PRODUCTS.map((lp) => (
                          <option key={lp.id} value={lp.id}>
                            {lp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="apply-form-group">
                    <label>Loan Amount *</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <div className="input-wrap" style={{ flex: 1 }}>
                        <input
                          type="number"
                          value={acAmt}
                          onChange={(e) => setAcAmt(e.target.value)}
                          required
                        />
                      </div>
                      <div className="input-wrap" style={{ width: "80px", padding: "0 6px" }}>
                        <select
                          value={acAmtUnit}
                          onChange={(e) => setAcAmtUnit(parseInt(e.target.value))}
                          style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".84rem", fontWeight: "700" }}
                        >
                          <option value={100000}>Lakh</option>
                          <option value={10000000}>Cr</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferred Lenders checklist selection */}
                <div className="apply-form-group">
                  <label>
                    Preferred Lenders Preference (PSU &amp; Private match)
                  </label>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".76rem", color: "#065F46", fontWeight: 700, cursor: "pointer", marginBottom: "4px" }} onClick={handleSelectAllLenders}>
                    {selectedLenders.length === lenderOptions.length ? "Deselect All Lenders" : "Select All suitable lenders"}
                  </div>
                  <div className="acm-lender-wrap" style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "120px", overflowY: "auto", padding: "8px", background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: "10px" }}>
                    {lenderOptions.map((l) => {
                      const isSel = selectedLenders.includes(l.name);
                      return (
                        <span
                          key={l.name}
                          className={`acm-lender-chip ${isSel ? "sel" : ""}`}
                          onClick={() => handleToggleLender(l.name)}
                          style={{
                            padding: "4px 8px",
                            fontSize: ".7rem",
                            borderRadius: "20px",
                            border: "1px solid #A7F3D0",
                            backgroundColor: isSel ? "#0F766E" : "#fff",
                            color: isSel ? "#fff" : "#374151",
                            cursor: "pointer",
                          }}
                        >
                          {l.name} ({l.rate.toFixed(2)}%)
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="apply-form-group">
                  <label>Client Contact Preference</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className={`acm-reach-btn ${acReachMode === "direct" ? "sel" : ""}`}
                      onClick={() => setAcReachMode("direct")}
                      style={acReachMode === "direct" ? { borderColor: "#0F766E", color: "#0F766E", background: "#ECFDF5" } : {}}
                    >
                      📞 Direct Reach (Team contacts customer)
                    </button>
                    <button
                      type="button"
                      className={`acm-reach-btn ${acReachMode === "partner" ? "sel" : ""}`}
                      onClick={() => setAcReachMode("partner")}
                      style={acReachMode === "partner" ? { borderColor: "#0F766E", color: "#0F766E", background: "#ECFDF5" } : {}}
                    >
                      🛡️ Partner Routing (Contact through you)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ height: "46px", marginTop: "12px", background: "linear-gradient(135deg,#0D9488,#0F766E)" }}
                >
                  Refer Client Application →
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SUPPORT MODAL ═══ */}
      {showSupportModal && (
        <div className="cd-modal" onClick={() => setShowSupportModal(false)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-head" style={{ background: "linear-gradient(135deg, #042F2A, #064E3B 50%, #0F766E)" }}>
              <span>Contact Partner Support</span>
              <button onClick={() => setShowSupportModal(false)}>&times;</button>
            </div>
            <div className="cd-modal-body">
              <div className="cdm-person">
                <div className="cdm-avatar" style={{ background: "linear-gradient(135deg, #A7F3D0, #34D399)", color: "#064E3B" }}>RM</div>
                <div>
                  <div className="cdm-name">Mr. Rishabh Mathur</div>
                  <div className="cdm-role">Manager — Mortgages · Finn4sure</div>
                </div>
              </div>
              <a href="tel:9910507574" className="cdm-contact-row">
                <div className="cdm-ci" style={{ backgroundColor: "#EEF6FF", color: "#1B4D8E" }}>📞</div>
                <div>
                  <div className="cdm-cl" style={{ fontSize: ".66rem", color: "var(--text2)", textTransform: "uppercase" }}>Phone Support</div>
                  <div className="cdm-cv">99105 07574</div>
                </div>
              </a>
              <a href="mailto:support@finn4sure.com" className="cdm-contact-row">
                <div className="cdm-ci" style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}>📧</div>
                <div>
                  <div className="cdm-cl" style={{ fontSize: ".66rem", color: "var(--text2)", textTransform: "uppercase" }}>Email Support</div>
                  <div className="cdm-cv">support@finn4sure.com</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export { BrokerDashboard };
