import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoMdCard,
  IoMdTimer,
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
} from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import { LOAN_PRODUCTS } from "../utils/constants";
import { states, districtsByState } from "../components/Statedata";
import "./styles/clientDashboard.css";
import { BASE_PATH } from "../config";

export default function ClientDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Local dashboard states
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("loans");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [rewardTcOpen, setRewardTcOpen] = useState(false);
  const [notification, setNotification] = useState(null); // { type, title, message, onClose }

  const showNotification = (title, message, type = "info", onClose = null) => {
    setNotification({ title, message, type, onClose });
  };

  // Profile Form States
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [number, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchApplications();
  }, []);

  const { user: authUser } = useAuth();

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/auth/profile`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setName(data.name || "Sahil");
        setEmail(data.email || "");
        setNumber(data.number || "");
        setAddress(data.address || "123 Green Avenue, Central Delhi");
        setPincode(data.pincode || "110001");
        setState(data.state || "Delhi");
        setDistrict(data.district || "Central");
      } else if (authUser) {
        setUser(authUser);
        setName(authUser.name || "Sahil");
        setEmail(authUser.email || "");
        setNumber(authUser.number || "8123123712");
        setAddress(authUser.address || "123 Green Avenue, Central Delhi");
        setPincode(authUser.pincode || "110001");
      } else if (res.status === 401) {
        navigate("/login");
      }
    } catch (e) {
      if (authUser) {
        setUser(authUser);
        setName(authUser.name || "Sahil");
        setEmail(authUser.email || "");
        setNumber(authUser.number || "8123123712");
        setAddress(authUser.address || "123 Green Avenue, Central Delhi");
        setPincode(authUser.pincode || "110001");
      }
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/client/my-applications`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error("Failed to fetch applications:", e.message);
    }
  };

  const sendOTP = async () => {
    try {
      if (!/^\d{10}$/.test(number)) {
        showNotification("Validation Error", "Please enter a valid 10-digit mobile number", "error");
        return;
      }
      const res = await fetch(
        `${BASE_PATH}/api/auth/update-number-otp`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to send OTP");
      }
      setOtpSent(true);
      showNotification("OTP Sent", "OTP sent successfully to your WhatsApp number. Please use 123456 as the verification code.", "success");
    } catch (e) {
      showNotification("Error", e.message, "error");
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      showNotification("Required", "Please enter OTP", "error");
      return;
    }
    try {
      const res = await fetch(
        `${BASE_PATH}/api/auth/verify-update-number-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ number, otp }),
        }
      );
      if (!res.ok) {
        throw new Error("Invalid OTP verification");
      }
      setOtpVerified(true);
      showNotification("OTP Verified", "WhatsApp number verified successfully!", "success");
    } catch (e) {
      showNotification("Error", e.message, "error");
    }
  };

  const handleUpdate = async () => {
    if (number !== user.number && !otpVerified) {
      showNotification("Verification Required", "You must verify the new phone number before saving", "error");
      return;
    }
    try {
      const res = await fetch(`${BASE_PATH}/api/auth/profileupdate`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          address,
          pincode,
          district,
          state,
          number,
          otp_verified: otpVerified,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Update profile failed");
      }

      showNotification("Profile Updated!", "Your profile details have been successfully saved to our system.", "success", () => {
        setActiveTab("loans");
      });
      setEditing(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      fetchProfile();
    } catch (err) {
      showNotification("Error", err.message, "error");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--navy)", fontWeight: 700 }}>
        Loading dashboard profile...
      </div>
    );
  }

  // Helpers
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

  // Status arrays
  const disbursedCount = applications.filter((app) => app.Status?.name?.toLowerCase() === "disbursed").length;
  const activeCount = applications.filter((app) => {
    const status = app.Status?.name?.toLowerCase();
    return status && status !== "disbursed" && status !== "rejected";
  }).length;
  const rejectedCount = applications.filter((app) => app.Status?.name?.toLowerCase() === "rejected").length;

  return (
    <div className="cdash-wrap">
      {/* ═══ DASHBOARD HEADER WITH TABS ═══ */}
      <div className="cdash-header">
        <div className="cdash-header-inner">
          <div className="cdash-greeting">
            <div className="cdash-avatar">
              {((user.name && user.name !== "Borrower Account") ? user.name : (authUser?.name || "Sahil")).split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="cdash-welcome">Welcome back 👋</div>
              <div className="cdash-name">{(user.name && user.name !== "Borrower Account") ? user.name : (authUser?.name || "Sahil")}</div>
              <div className="cdash-meta">
                <span className="cdash-badge">Borrower</span>
                <span>📱 {user.number || authUser?.number || "8123123712"}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button className="cdash-support-pill" onClick={() => setShowSupportModal(true)}>
              <span className="csp-dot"></span> Need Help?
            </button>
            <button className="cdash-logout" onClick={handleSignOut}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="cdash-tab-bar">
          <button
            className={`cdash-tab ${activeTab === "loans" ? "active" : ""}`}
            onClick={() => setActiveTab("loans")}
          >
            📊 My Dashboard
          </button>
          <button
            className={`cdash-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile & Security
          </button>
        </div>
      </div>

      {/* ═══ MAIN WORKSPACE ═══ */}
      <div className="cdash-body">
        {activeTab === "loans" ? (
          /* TAB 1: APPLICATIONS & STATS */
          <div className="cdash-cols animate-fade-up">
            {/* Left Column */}
            <div className="cdash-left">
              {/* Applications Card */}
              <div className="cdash-section">
                <div className="cdash-sec-head">
                  <h3>My Loan Applications</h3>
                  <Link to="/apply" className="cdash-new-btn" style={{ textDecoration: "none" }}>
                    + Apply New Loan
                  </Link>
                </div>

                <div className="cd-loan-list">
                  {applications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", background: "#fff", border: "1px solid #E6EEF8", borderRadius: "18px", color: "var(--text2)", fontSize: ".88rem" }}>
                      No applications submitted yet. Click "Apply New Loan" above to start.
                    </div>
                  ) : (
                    applications.map((app) => {
                      const rawStatus = (app.Status?.name || "").toLowerCase();
                      const statusId = Number(app.status_id || 1);

                      let currentStepIndex = 0; // 0: applied, 1: docs, 2: credit, 3: submitted, 4: sanction, 5: legal, 6: disbursed

                      if (statusId === 1 || rawStatus.includes("applied") || rawStatus.includes("new")) {
                        currentStepIndex = 0;
                      } else if (statusId === 2 || rawStatus.includes("doc")) {
                        currentStepIndex = 1;
                      } else if (statusId === 3 || rawStatus.includes("credit") || rawStatus.includes("under review")) {
                        currentStepIndex = 2;
                      } else if (statusId === 4 || rawStatus.includes("submit")) {
                        currentStepIndex = 3;
                      } else if (statusId === 5 || rawStatus.includes("sanction")) {
                        currentStepIndex = 4;
                      } else if (statusId === 6 || rawStatus.includes("legal")) {
                        currentStepIndex = 5;
                      } else if (statusId === 7 || rawStatus.includes("disburs")) {
                        currentStepIndex = 6;
                      } else {
                        currentStepIndex = Math.min(Math.max(statusId - 1, 0), 6);
                      }

                      const steps = ['applied' , 'docs', 'credit', 'submitted', 'sanction', 'legal', 'disbursed'];
                      
                      return (
                      <div key={app.id || app.application_no} className="cdl-card">
                        <div className="cdl-top">
                          <div className="cdl-left">
                            <div className="cdl-type-icon" style={{ backgroundColor: "#F0F6FF", color: "#1E3A5F" }}>
                              {getProductEmoji(app.Loan_type?.short_id || "document")}
                            </div>
                            <div className="cdl-info">
                              <h4>{app.Loan_type?.name || "Loan Application"}</h4>
                              <div className="cdl-meta">
                                Submitted: {new Date(app.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="cdl-right">
                            <div className="cdl-bank" style={{ textTransform: 'uppercase', fontSize: '.74rem', color: '#64748B', fontWeight: 'bold', marginBottom: '4px' }}>
                              {statusId === 7 || rawStatus.includes("disburs")
                                ? "COMPLETED"
                                : rawStatus.includes("reject")
                                ? "REJECTED"
                                : "ACTIVE"}
                            </div>
                            <span
                              className={`cdl-status-chip ${
                                statusId === 7 || rawStatus.includes("disburs")
                                  ? "cdl-chip-green"
                                  : rawStatus.includes("reject")
                                  ? "cdl-chip-amber"
                                  : "cdl-chip-blue"
                              }`}
                            >
                              <span className="cdl-chip-dot"></span>
                              <span>
                                {statusId === 7 || rawStatus.includes("disburs")
                                  ? "Completed"
                                  : rawStatus.includes("reject")
                                  ? "Rejected"
                                  : "In Progress"}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Journey tracker timeline visualization */}
                        <div className="cdl-journey">
                          <div className="cdl-jlabel">Application Progress</div>
                          <div className="cdl-track">
                            {steps.map((step, index) => {
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

                        {(statusId === 1 || statusId === 2) && (
                          <div style={{ 
                            marginTop: '20px', 
                            paddingTop: '16px', 
                            borderTop: '1px solid #E6EEF8', 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            alignItems: 'center'
                          }}>
                            <Link 
                              to={`/upload-docs/${app.id}`} 
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
                      </div>
                    )})
                  )}
                </div>
              </div>

              {/* Reward Almirah Panel */}
              <div className="cdash-section">
                <div className="cdash-sec-head">
                  <h3>🏆 Finn4sure Reward Cabinet</h3>
                  <span className="cd-reward-live-tag">✨ Live Rewards</span>
                </div>

                <div className="reward-almirah">
                  <div className="almirah-arch">
                    <div className="aa-logo">🎁</div>
                    <div className="aa-title">Your Reward Cabinet</div>
                    <div className="aa-sub">Earn vouchers & exclusive perks after disbursals</div>
                  </div>

                  <div className="almirah-tiles">
                    <div className="almirah-tile tile-gold">
                      <div className="at-glow"></div>
                      <div className="at-icon">💰</div>
                      <div className="at-badge">Locked</div>
                      <div className="at-title">Disbursal Reward</div>
                      <div className="at-amount">—</div>
                      <div className="at-desc">Complete your loan disbursement to unlock</div>
                      <div className="at-status">
                        <span className="ats-pill ats-pending">⏳ Pending</span>
                      </div>
                    </div>

                    <Link to="/partner" className="almirah-tile tile-teal" style={{ textDecoration: "none" }}>
                      <div className="at-glow"></div>
                      <div className="at-icon">🤝</div>
                      <div className="at-badge at-badge-earn">Earn Now</div>
                      <div className="at-title">Referral Reward</div>
                      <div className="at-amount">₹2k – ₹10k</div>
                      <div className="at-desc">Refer a friend or join as a partner.</div>
                      <div className="at-status">
                        <button className="ats-cta">Partner →</button>
                      </div>
                    </Link>

                    <div className="almirah-tile tile-purple">
                      <div className="at-glow"></div>
                      <div className="at-icon">⭐</div>
                      <div className="at-badge at-badge-soon">Soon</div>
                      <div className="at-title">Loyalty Reward</div>
                      <div className="at-amount">Up to ₹5k</div>
                      <div className="at-desc">Vouchers after 12 on-time EMI repayments.</div>
                      <div className="at-status">
                        <span className="ats-pill ats-soon">🔒 Locked</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms Accordion */}
                  <div className="almirah-tc" style={{ marginTop: "20px" }}>
                    <div className="atc-head" onClick={() => setRewardTcOpen(!rewardTcOpen)}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4" />
                        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6z" />
                      </svg>
                      Terms & Conditions
                      <svg
                        className={`atc-chevron ${rewardTcOpen ? "open" : ""}`}
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{ marginLeft: "auto", transition: "transform .3s", transform: rewardTcOpen ? "rotate(180deg)" : "none" }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                    {rewardTcOpen && (
                      <div className="atc-body open" style={{ padding: "0 16px 16px 32px" }}>
                        <ul className="atc-list" style={{ listStyleType: "disc", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                          <li style={{ fontSize: ".74rem", color: "rgba(255,255,255,.65)" }}>Rewards credited as Amazon/Flipkart vouchers.</li>
                          <li style={{ fontSize: ".74rem", color: "rgba(255,255,255,.65)" }}>Determined by final disbursed amount.</li>
                          <li style={{ fontSize: ".74rem", color: "rgba(255,255,255,.65)" }}>Sent to registered email and mobile number.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="cdash-right">
              {/* Stats Card */}
              <div className="cd-stats-card">
                <div className="cdsc-row">
                  <span>Active Applications</span>
                  <span className="cdsc-val cdsc-amber">{activeCount}</span>
                </div>
                <div className="cdsc-row">
                  <span>Disbursed Loans</span>
                  <span className="cdsc-val cdsc-green">{disbursedCount}</span>
                </div>
                <div className="cdsc-row">
                  <span>Rejected Loans</span>
                  <span className="cdsc-val cdsc-amber" style={{ color: "#DC2626" }}>{rejectedCount}</span>
                </div>
                <div className="cdsc-divider"></div>
                <div className="cdsc-row">
                  <span>Rewards Earned</span>
                  <span className="cdsc-val cdsc-gold">₹0</span>
                </div>
              </div>

              {/* Dedicated Support advisor */}
              <div className="cd-support-mini">
                <div className="cdsm-head">Your Dedicated Advisor</div>
                <div className="cdsm-person">
                  <div className="cdsm-avatar">RM</div>
                  <div>
                    <div className="cdsm-name">Mr. Rishabh Mathur</div>
                    <div className="cdsm-role">Manager — Mortgages</div>
                  </div>
                  <span className="cdsm-online">
                    <span className="psc-dot"></span>Online
                  </span>
                </div>
                <div className="cdsm-actions">
                  <a className="cdsm-btn cdsm-call" href="tel:9910507574">
                    📞 Call
                  </a>
                  <a className="cdsm-btn cdsm-email" href="mailto:support@finn4sure.com">
                    📧 Email
                  </a>
                  <a className="cdsm-btn cdsm-wa" href="https://wa.me/919910507574" target="_blank" rel="noreferrer">
                    📱 WhatsApp
                  </a>
                </div>
                <div className="cdsm-hours">Mon–Sat · 9:30 AM – 6:30 PM IST</div>
              </div>


            </div>
          </div>
        ) : (
          /* TAB 2: PROFILE & SECURITY EDITOR */
          <div className="cdPanelProfile animate-fade-up" style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div className="cpro-card">
              <div className="cpro-head">
                <span className="cpro-head-ic">👤</span>
                <div>
                  <div className="cpro-head-title">Personal Details</div>
                  <div className="cpro-head-sub">Review and edit your details below</div>
                </div>
              </div>

              <div className="cpro-fields">
                <div className="cpro-field">
                  <label htmlFor="pname">Full Name</label>
                  <div className="input-wrap">
                    <span className="icon">👤</span>
                    <input
                      id="pname"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="cpro-field">
                  <label htmlFor="pemail">Email Address</label>
                  <div className="input-wrap">
                    <span className="icon">📧</span>
                    <input
                      id="pemail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="cpro-field">
                  <label htmlFor="paddress">Address</label>
                  <div className="input-wrap">
                    <span className="icon">🏠</span>
                    <input
                      id="paddress"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>


                <div className="cpro-field">
                  <label htmlFor="ppincode">Pincode</label>
                  <div className="input-wrap">
                    <span className="icon">📍</span>
                    <input
                      id="ppincode"
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="cpro-field">
                  <label htmlFor="pphone">Phone Number (WhatsApp)</label>
                  <div className="input-wrap">
                    <span className="icon">📱</span>
                    <input
                      id="pphone"
                      type="text"
                      value={number}
                      onChange={(e) => {
                        setNumber(e.target.value);
                        setOtp("");
                        setOtpVerified(false);
                      }}
                      disabled={!editing}
                    />
                  </div>
                </div>

                {/* OTP Verification on Phone change */}
                {editing && number !== user.number && (
                  <div className="apply-autofill-banner" style={{ background: "#FEF3C7", borderColor: "#FDE68A" }}>
                    <label style={{ fontSize: ".76rem", fontWeight: "700", color: "#92400E", display: "block", marginBottom: "8px" }}>
                      Verify WhatsApp OTP to update number
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="OTP Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #FCD34D", borderRadius: "8px" }}
                      />
                      <button type="button" onClick={sendOTP} className="btn-primary" style={{ width: "auto", height: "36px", padding: "0 14px", fontSize: ".76rem" }}>
                        Send OTP
                      </button>
                      <button type="button" onClick={verifyOTP} className="btn-primary" style={{ width: "auto", height: "36px", padding: "0 14px", fontSize: ".76rem", background: "#059669" }}>
                        Verify
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ marginTop: "16px" }}>
                  {editing ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" onClick={(e) => { e.preventDefault(); handleUpdate(); }} className="btn-primary" style={{ flex: 1 }}>
                        Save Details
                      </button>
                      <button type="button" onClick={(e) => { e.preventDefault(); setEditing(false); fetchProfile(); }} className="btn-secondary" style={{ flex: 1 }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={(e) => { e.preventDefault(); setEditing(true); }} className="btn-primary">
                      Edit Profile Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ SUPPORT MODAL ═══ */}
      {showSupportModal && (
        <div className="cd-modal" onClick={() => setShowSupportModal(false)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-head">
              <span>Contact Support</span>
              <button onClick={() => setShowSupportModal(false)}>&times;</button>
            </div>
            <div className="cd-modal-body">
              <div className="cdm-person">
                <div className="cdm-avatar">RM</div>
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
              <a href="https://wa.me/919910507574" target="_blank" rel="noreferrer" className="cdm-contact-row">
                <div className="cdm-ci" style={{ backgroundColor: "#ECFDF5", color: "#059669" }}>📱</div>
                <div>
                  <div className="cdm-cl" style={{ fontSize: ".66rem", color: "var(--text2)", textTransform: "uppercase" }}>WhatsApp Chat</div>
                  <div className="cdm-cv">Chat Live Now</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CUSTOM NOTIFICATION MODAL ═══ */}
      {notification && (
        <div className="cd-modal" onClick={() => {
          const cb = notification.onClose;
          setNotification(null);
          if (cb) cb();
        }}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ fontSize: "3.2rem", marginBottom: "16px" }}>
              {notification.type === "success" ? "🎉" : notification.type === "error" ? "⚠️" : "ℹ️"}
            </div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.45rem", fontWeight: "700", color: "var(--navy)", marginBottom: "8px" }}>
              {notification.title}
            </h3>
            <p style={{ fontSize: ".84rem", color: "var(--text2)", lineHeight: "1.5", marginBottom: "22px" }}>
              {notification.message}
            </p>
            <button 
              type="button" 
              onClick={() => {
                const cb = notification.onClose;
                setNotification(null);
                if (cb) cb();
              }} 
              className="btn-primary" 
              style={{ width: "100%", height: "42px" }}
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export { ClientDashboard };
