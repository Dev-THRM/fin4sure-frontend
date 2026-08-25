import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { districtsByState, states } from "../components/Statedata";
import { fmtINR } from "../utils/formatters";
import "./styles/brokerDashboard.css";

export default function BrokerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Profile and data states
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);

  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(
      leads
        .map((lead) => lead.status)
        .filter(Boolean)
    )];

    return uniqueStatuses;
  }, [leads]);

  // UI States
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState("dashboard"); // "dashboard" | "profile"

  // Partner Profile States
  const [profName, setProfName] = useState("");
  const [profCity, setProfCity] = useState("");
  const [profNumber, setProfNumber] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profEditing, setProfEditing] = useState(false);
  const [profSaving, setProfSaving] = useState(false);
  const [profOtp, setProfOtp] = useState("");
  const [profOtpVerified, setProfOtpVerified] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Add Client Form States
  const [acName, setAcName] = useState("");
  const [acMobile, setAcMobile] = useState("");
  const [acEmail, setAcEmail] = useState("");
  const [acDob, setAcDob] = useState("");
  const [acGender, setAcGender] = useState("");
  const [acAmt, setAcAmt] = useState("");
  const [acLoanPurpose, setAcLoanPurpose] = useState("");
  const [acTenure, setAcTenure] = useState(""); // months
  const [acLoanType, setAcLoanType] = useState("");
  const [acReachMode, setAcReachMode] = useState("direct");
  const [acAddress, setAcAddress] = useState("");
  const [acPincode, setAcPincode] = useState("");
  const [acState, setAcState] = useState("");
  const [acDistrict, setAcDistrict] = useState("");
  const [acCity, setAcCity] = useState("");
  const [selectedLenders, setSelectedLenders] = useState([]);

  // DB-driven data
  const [loanTypes, setLoanTypes] = useState([]);
  const [allLenders, setAllLenders] = useState([]);

  useEffect(() => {
    const loadAllData = async () => {
      await fetchProfile();
      await fetchClients();
      await fetchLeads();
    };
    loadAllData();
  }, []);


  async function fetchProfile() {
    try {
      const res = await fetch("/api/auth/profile", {
        credentials: "include",
      });
      if (res.status === 429) {
        console.warn("Profile fetch rate-limited (429)");
        return;
      }
      if (res.status === 401 || res.status === 403) {
        return navigate("/login");
      }
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
      setProfName(data.name || "");
      setProfCity(data.city || data.district || data.address || "");
      setProfNumber(data.number || "");
      setProfEmail(data.email || "");
    } catch (e) {
      console.error("Fetch profile error:", e.message);
    }
  }

  const sendUpdateOTP = async () => {
    if (!/^\d{10}$/.test(profNumber)) {
      showToast("error", "Please enter a valid 10-digit number");
      return;
    }
    try {
      const res = await fetch("/api/auth/update-number-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: profNumber }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      showToast("success", "OTP sent to new WhatsApp number");
    } catch (e) {
      showToast("error", e.message);
    }
  };

  const verifyUpdateOTP = async () => {
    if (!profOtp) {
      showToast("error", "Please enter OTP");
      return;
    }
    try {
      const res = await fetch("/api/auth/verify-update-number-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: profNumber, otp: profOtp }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      setProfOtpVerified(true);
      showToast("success", "Phone number verified successfully!");
    } catch (e) {
      showToast("error", e.message);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profEditing) return;
    if (user && profNumber !== user.number && !profOtpVerified) {
      showToast("error", "You must verify the new WhatsApp number before saving");
      return;
    }
    setProfSaving(true);
    try {
      const res = await fetch("/api/auth/profileupdate", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profName,
          city: profCity,
          number: profNumber,
          email: profEmail,
        }),
      });

      if (res.status === 429) {
        showToast("error", "Server rate limit hit — please wait 1 minute and try again");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      showToast("success", "Profile updated successfully!");
      setProfEditing(false);

      // In-place state update without triggering another network request
      setUser((prev) => ({
        ...prev,
        name: data.name || profName,
        email: data.email || profEmail,
        number: data.number || profNumber,
        city: data.city || profCity,
      }));
      setProfName(data.name || profName);
      setProfCity(data.city || profCity);
      setProfNumber(data.number || profNumber);
      setProfEmail(data.email || profEmail);

      // Automatically redirect to Referral Dashboard tab
      setWorkspaceTab("dashboard");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setProfSaving(false);
    }
  };

  const openReferralModal = () => {
    if (loanTypes.length === 0) fetchLoanTypes();
    if (allLenders.length === 0) fetchLenders();
    setShowAddClientModal(true);
  };

  async function fetchClients() {
    try {
      const res = await fetch("/api/broker/getRefferedClients", {
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
      const res = await fetch("/api/broker/getBrokerLeads", {
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

  async function fetchLoanTypes() {
    try {
      const res = await fetch("/api/loan-types");
      if (res.ok) {
        const data = await res.json();
        const types = data.data || [];
        setLoanTypes(types);
        if (types.length > 0) setAcLoanType(String(types[0].id));
      }
    } catch (e) {
      console.error("Failed to fetch loan types:", e.message);
    }
  }

  async function fetchLenders() {
    try {
      const res = await fetch("/api/lenders");
      if (res.ok) {
        const data = await res.json();
        setAllLenders(data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch lenders:", e.message);
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

    return leads.filter(
      (lead) =>
        String(lead.status_id) === String(activeFilter) ||
        String(lead.status?.id) === String(activeFilter)
    );
  }, [leads, activeFilter]);

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

  // Add Client - Lender option list based on selected loan type (from DB)
  const lenderOptions = useMemo(() => {
    if (!acLoanType) return allLenders.map((l) => ({ id: l.id, name: l.name, rate: null }));
    return allLenders
      .map((l) => {
        const matchingRate = (l.loanRates || []).find(
          (r) => r.loan_type_id === parseInt(acLoanType)
        );
        return matchingRate
          ? { id: l.id, name: l.name, rate: matchingRate.min_rate }
          : null;
      })
      .filter(Boolean);
  }, [acLoanType, allLenders]);

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

  const selectedLoanTypeName = loanTypes.find((t) => String(t.id) === String(acLoanType))?.name || acLoanType;

  const [submitting, setSubmitting] = useState(false);

  const submitAddClient = async (e) => {
    e.preventDefault();
    if (!acName || !acMobile) {
      showToast("error", "Please enter client name and mobile number");
      return;
    }
    if (!acAmt || parseFloat(acAmt) <= 0) {
      showToast("error", "Please enter a valid loan amount");
      return;
    }
    if (!acAddress || !acPincode || acPincode.length !== 6) {
      showToast("error", "Please enter a valid address and 6-digit pincode");
      return;
    }

    setSubmitting(true);
    try {
      // Pick first selected lender's id (if any)
      const firstSelectedLender = lenderOptions.find((l) => selectedLenders.includes(l.name));

      const payload = {
        name: acName,
        number: acMobile,
        email: acEmail,
        loan_type_id: acLoanType,
        loan_amount: parseFloat(acAmt),
        loan_purpose: acLoanPurpose || selectedLoanTypeName,
        preferred_lender_id: firstSelectedLender?.id || null,
        client_preference: acReachMode,
        address: acAddress,
        pincode: acPincode,
        state: acState,
        district: acDistrict,
        city: acCity,
        tenure: acTenure,
        dob: acDob,
        gender: acGender,
      };

      const res = await fetch("/api/broker/referClient", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Failed to submit referral");
        return;
      }

      showToast("success", `Referral for "${acName}" submitted! Application saved to database.`);
      setShowAddClientModal(false);

      // Reset form
      if (data.waCredentials) {
        console.log(`[WHATSAPP SIMULATION] Message to 91${acMobile}`);
        console.log(`Your Fin4Sure account has been created.\nUsername: ${data.waCredentials.username}\nPassword: ${data.waCredentials.password}\n\nPlease log in and change your password if you want.`);
      }
      setAcName("");
      setAcMobile("");
      setAcEmail("");
      setAcDob("");
      setAcGender("");
      setAcAmt("");
      setAcLoanPurpose("");
      setAcTenure("");
      setAcAddress("");
      setAcPincode("");
      setAcState("");
      setAcDistrict("");
      setAcCity("");
      setSelectedLenders([]);
      if (loanTypes.length > 0) setAcLoanType(String(loanTypes[0].id));

      // Refresh dashboard data (stay on same page)
      fetchClients();
      fetchLeads();
    } catch (e) {
      showToast("error", "Network error: " + e.message);
    } finally {
      setSubmitting(false);
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
                <span className="pdash-id">ID: {user?.brokerId || user?.partner_id || user?.id || user?._id ? `F4S-P${String(user.brokerId || user.partner_id || user.id || user._id).padStart(3, '0')}` : 'F4S-P001'}</span>
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

        {/* Workspace banner tabs */}
        <div className="pdash-tab-bar">
          <button 
            className={`pdash-tab ${workspaceTab === "dashboard" ? "active" : ""}`}
            onClick={() => setWorkspaceTab("dashboard")}
          >
            📊 Referral Dashboard
          </button>
          <button 
            className={`pdash-tab ${workspaceTab === "profile" ? "active" : ""}`}
            onClick={() => setWorkspaceTab("profile")}
          >
            👤 Edit Profile
          </button>
        </div>
      </div>

      {/* ═══ BODY WORKSPACE ═══ */}
      <div className="pdash-body">
        {workspaceTab === "dashboard" ? (
          <>
            {/* KPI stat metrics row */}
            <div className="pdash-kpi-row animate-fade-up">
            </div>

            {/* Eye-catching Refer Client banner */}
            <div className="pdash-addclient-banner animate-fade-up" onClick={openReferralModal}>
              <div className="pacb-glow"></div>
              <div className="pacb-left">
                <div className="pacb-icon">✨</div>
                <div className="pacb-txt">
                  <div className="pacb-title">Got a new borrower client?</div>
                  <div className="pacb-sub">Refer their details in 1 minute — pick loan asset, size &amp; Preferred Lenders list</div>
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
                  <button className="pdash-add-btn" onClick={openReferralModal}>
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
                </div>
                {/* Referral Cards List */}
                <div className="cd-loan-list">
                  {filteredLeads.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", background: "#fff", border: "1px solid #E6EEF8", borderRadius: "18px", color: "var(--text2)", fontSize: ".88rem" }}>
                      No referred leads found for this filter tab.
                    </div>
                  ) : (
                    filteredLeads.map((lead) => {
                      const statusName = lead.status?.toLowerCase() || 'applied';
                      const steps = ['applied' , 'docs', 'credit', 'submitted', 'sanction', 'legal', 'disbursed'];
                      const currentStepIndex = steps.indexOf(statusName) !== -1 ? steps.indexOf(statusName) : 0;

                      return (
                      <div key={lead.id || lead._id} className="cdl-card">
                        <div className="cdl-top">
                          <div className="cdl-left">
                            <div className="cdl-type-icon" style={{ backgroundColor: "#ECFDF5", color: "#0F766E" }}>
                              {getProductEmoji(lead.product)}
                            </div>
                            <div className="cdl-info">
                              <h4>{lead.name}</h4>
                              <div className="cdl-meta">
                                {lead.product} · Referred: {new Date(lead.createdAt).toLocaleDateString()}
                                {lead.amount ? ` · ₹${Number(lead.amount).toLocaleString("en-IN")}` : ""}
                              </div>
                            </div>
                          </div>
                          <div className="cdl-right">
                            {lead.isApp ? (
                              <>
                                <div className="cdl-bank" style={{ textTransform: 'uppercase', fontSize: '.74rem', color: '#64748B', fontWeight: 'bold', marginBottom: '4px' }}>
                                  {lead.statusName === "disbursed"
                                    ? "COMPLETED"
                                    : lead.statusName === "rejected"
                                    ? "REJECTED"
                                    : "ACTIVE"}
                                </div>
                                <span
                                  className={`cdl-status-chip ${
                                    lead.statusName === "disbursed"
                                      ? "cdl-chip-green"
                                      : "cdl-chip-amber"
                                  }`}
                                >
                                  <span className="cdl-chip-dot"></span>
                                  <span>
                                    {lead.statusName === "disbursed"
                                      ? "Completed"
                                      : lead.statusName === "rejected"
                                      ? "Rejected"
                                      : "In Progress"}
                                  </span>
                                </span>
                              </>
                            ) : (
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
                            )}
                          </div>
                        </div>

                        {/* Journey tracker timeline visualization for referred apps */}
                        {lead.isApp && (
                          <div className="cdl-journey" style={{ marginTop: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                            <div className="cdl-jlabel">Loan Journey</div>
                            <div className="cdl-track">
                              {['applied' , 'docs', 'credit', 'submitted', 'sanction', 'legal', 'disbursed'].map((step, index) => {
                                const steps = ['applied' , 'docs', 'credit', 'submitted', 'sanction', 'legal', 'disbursed'];
                                let currentStepIndex = steps.indexOf(lead.statusName) !== -1 ? steps.indexOf(lead.statusName) : 0;
                                if (lead.statusName === 'applied') {
                                  currentStepIndex = 1;
                                }
                                const isDone = index < currentStepIndex;
                                const isActive = index === currentStepIndex;
                                
                                return (
                                  <div key={step} className={`cdl-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                                    <div className="cdl-dot">{isDone ? "✓" : (index + 1)}</div>
                                    <span className="cdl-step-lbl" style={{ textTransform: 'capitalize' }}>{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {lead.isApp && lead.client_preference !== 'direct_reach' && lead.client_preference !== 'direct' && (lead.statusName === 'applied' || lead.statusName === 'docs') && (
                          <div style={{ 
                            marginTop: '20px', 
                            paddingTop: '16px', 
                            borderTop: '1px solid #F1F5F9', 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            alignItems: 'center'
                          }}>
                            <Link 
                              to={`/upload-docs/${lead.appId}`} 
                              style={{ 
                                textDecoration: "none", 
                                background: "linear-gradient(135deg, #059669, #10B981)", 
                                color: "#fff",
                                fontSize: "0.82rem",
                                fontWeight: "700",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                                transition: "all 0.2s ease"
                              }}
                            >
                              📤 Upload Documents
                            </Link>
                          </div>
                        )}

                        {lead.client_preference && (
                          <div className="cdl-remark" style={{ fontSize: ".76rem", background: "#F4FBF7", border: "1px solid #A7F3D0", color: "#065F46" }}>
                            🛡️ {lead.client_preference === "partner_routing" ? "Partner Routing — you will be contacted" : "Direct Reach — team will contact client"}
                          </div>
                        )}
                        {lead.remark && (
                          <div className="cdl-remark" style={{ fontSize: ".76rem", background: "#F4FBF7", border: "1px solid #A7F3D0", color: "#065F46" }}>
                            💡 {lead.remark}
                          </div>
                        )}
                      </div>
                    )})
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
                  <div className="pql-item" onClick={openReferralModal}>
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
          </>
        ) : (
          /* Edit Profile Tab */
          <div className="cdPanelProfile animate-fade-up" style={{ maxWidth: "600px", margin: "0 auto", padding: "10px 0 30px" }}>
            <div className="cpro-card" style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E6EEF8", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div className="cpro-head" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: "1.8rem" }}>👤</span>
                <div>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--navy)" }}>Partner Profile</div>
                  <div style={{ fontSize: ".82rem", color: "var(--text2)" }}>Manage your partner account details</div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Full Name */}
                <div>
                  <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)", display: "block", marginBottom: "6px" }}>Full Name</label>
                  <div className="input-wrap">
                    <span className="icon">👤</span>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      disabled={!profEditing}
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)", display: "block", marginBottom: "6px" }}>City</label>
                  <div className="input-wrap">
                    <span className="icon">🏙️</span>
                    <input
                      type="text"
                      placeholder="City"
                      value={profCity}
                      onChange={(e) => setProfCity(e.target.value)}
                      disabled={!profEditing}
                      required
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)", display: "block", marginBottom: "6px" }}>WhatsApp Number</label>
                  <div className="input-wrap">
                    <span className="icon">📱</span>
                    <input
                      type="text"
                      placeholder="10-digit WhatsApp number"
                      maxLength={10}
                      value={profNumber}
                      onChange={(e) => {
                        setProfNumber(e.target.value.replace(/\D/g, ""));
                        setProfOtp("");
                        setProfOtpVerified(false);
                      }}
                      disabled={!profEditing}
                      required
                    />
                  </div>
                </div>

                {/* OTP Verification when phone number is changed */}
                {profEditing && user && profNumber !== user.number && (
                  <div className="apply-autofill-banner" style={{ background: "#FEF3C7", borderColor: "#FDE68A", padding: "12px", borderRadius: "10px" }}>
                    <label style={{ fontSize: ".76rem", fontWeight: "700", color: "#92400E", display: "block", marginBottom: "6px" }}>
                      Verify OTP for new WhatsApp number
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="4-digit OTP"
                        maxLength={4}
                        value={profOtp}
                        onChange={(e) => setProfOtp(e.target.value.replace(/\D/g, ""))}
                        style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #FCD34D", borderRadius: "8px", fontSize: ".88rem" }}
                      />
                      <button type="button" onClick={sendUpdateOTP} className="btn-primary" style={{ width: "auto", height: "36px", padding: "0 14px", fontSize: ".76rem" }}>
                        Send OTP
                      </button>
                      <button type="button" onClick={verifyUpdateOTP} className="btn-primary" style={{ width: "auto", height: "36px", padding: "0 14px", fontSize: ".76rem", background: "#059669" }}>
                        Verify
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)", display: "block", marginBottom: "6px" }}>Email Address</label>
                  <div className="input-wrap">
                    <span className="icon">📧</span>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      disabled={!profEditing}
                      required
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                  {profEditing ? (
                    <>
                      <button
                        type="submit"
                        disabled={profSaving}
                        className="btn-primary"
                        style={{ height: "42px", padding: "0 24px", background: "linear-gradient(135deg,#0D9488,#0F766E)" }}
                      >
                        {profSaving ? "Saving..." : "Save Profile Changes"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setProfEditing(false);
                          setProfName(user?.name || "");
                          setProfCity(user?.city || user?.district || "");
                          setProfNumber(user?.number || "");
                          setProfEmail(user?.email || "");
                        }}
                        style={{ height: "42px", padding: "0 20px" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProfEditing(true);
                      }}
                      style={{ height: "42px", padding: "0 24px" }}
                    >
                      ✏️ Edit Profile Details
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
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
                    <label>Date of Birth *</label>
                    <div className="input-wrap">
                      <span className="icon">📅</span>
                      <input
                        type="date"
                        value={acDob}
                        onChange={(e) => setAcDob(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="apply-form-group">
                    <label>Gender *</label>
                    <div className="input-wrap" style={{ padding: "0 10px" }}>
                      <select
                        value={acGender}
                        onChange={(e) => setAcGender(e.target.value)}
                        required
                        style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".88rem", fontWeight: 600, color: "var(--navy)" }}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="apply-form-row">
                  <div className="apply-form-group">
                    <label>Full Address *</label>
                    <div className="input-wrap">
                      <span className="icon">🏠</span>
                      <input
                        type="text"
                        placeholder="Client Address"
                        value={acAddress}
                        onChange={(e) => setAcAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="apply-form-group">
                    <label>Pincode *</label>
                    <div className="input-wrap">
                      <span className="icon">📍</span>
                      <input
                        type="text"
                        placeholder="6-digit Pincode"
                        maxLength={6}
                        value={acPincode}
                        onChange={(e) => setAcPincode(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="apply-form-row">
                  <div className="apply-form-group">
                    <label>State *</label>
                    <div className="input-wrap" style={{ padding: "0 10px" }}>
                      <select
                        value={acState}
                        onChange={(e) => {
                          setAcState(e.target.value);
                          setAcDistrict("");
                        }}
                        required
                        style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".88rem", fontWeight: 600, color: "var(--navy)" }}
                      >
                        <option value="">Select State</option>
                        {states.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="apply-form-group">
                    <label>District *</label>
                    <div className="input-wrap" style={{ padding: "0 10px" }}>
                      <select
                        value={acDistrict}
                        disabled={!acState}
                        onChange={(e) => setAcDistrict(e.target.value)}
                        required
                        style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".88rem", fontWeight: 600, color: "var(--navy)" }}
                      >
                        <option value="">Select District</option>
                        {acState && districtsByState[acState]?.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="apply-form-row">
                  <div className="apply-form-group">
                    <label>City *</label>
                    <div className="input-wrap">
                      <span className="icon">🏙️</span>
                      <input
                        type="text"
                        placeholder="City"
                        value={acCity}
                        onChange={(e) => setAcCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="apply-form-group">
                    <label>Loan Asset Type *</label>
                    <div className="input-wrap" style={{ padding: "0 6px" }}>
                      <select
                        value={acLoanType}
                        onChange={(e) => { setAcLoanType(e.target.value); setSelectedLenders([]); }}
                        required
                        style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".92rem", fontWeight: "600", color: "var(--navy)" }}
                      >
                        {loanTypes.length === 0 && (
                          <option value="">Loading...</option>
                        )}
                        {loanTypes.map((lt) => (
                          <option key={lt.id} value={lt.id}>
                            {lt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="apply-form-row">
                  <div className="apply-form-group">
                    <label>Loan Amount (₹) *</label>
                    <div className="input-wrap">
                      <input
                        type="number"
                        placeholder="Enter amount in ₹"
                        value={acAmt}
                        onChange={(e) => setAcAmt(e.target.value)}
                        required
                        min="1"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="apply-form-group">
                    <label>Tenure (Months) *</label>
                    <div className="input-wrap">
                      <span className="icon">⏱️</span>
                      <input
                        type="number"
                        placeholder="e.g. 180"
                        value={acTenure}
                        onChange={(e) => setAcTenure(e.target.value)}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="apply-form-group">
                  <label>Loan Purpose</label>
                  <div className="input-wrap">
                    <span className="icon">📝</span>
                    <input
                      type="text"
                      placeholder="e.g. Home purchase, Business expansion..."
                      value={acLoanPurpose}
                      onChange={(e) => setAcLoanPurpose(e.target.value)}
                    />
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
                          {l.name} {l.rate != null ? `(${Number(l.rate).toFixed(2)}%)` : ''}
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
                  disabled={submitting}
                  style={{ height: "46px", marginTop: "12px", background: submitting ? "#6B7280" : "linear-gradient(135deg,#0D9488,#0F766E)", cursor: submitting ? "not-allowed" : "pointer" }}
                >
                  {submitting ? "Submitting..." : "Refer Client Application →"}
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

      {/* ═══ CUSTOM TOAST NOTIFICATION ═══ */}
      {toast && (
        <div className={`pdash-toast pdash-toast--${toast.type}`}>
          <div className="pdash-toast-icon">
            {toast.type === "success" ? "✓" : "✕"}
          </div>
          <div className="pdash-toast-msg">{toast.message}</div>
          <button className="pdash-toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}
export { BrokerDashboard };
