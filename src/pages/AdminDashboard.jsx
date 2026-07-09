import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/adminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Tab views state: "dash" | "brokers" | "leads" | "exports"
  const [activeTab, setActiveTab] = useState("dash");

  // Filter & Search states
  const [leadFilter, setLeadFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Backend fetched states
  const [stats, setStats] = useState({});
  const [brokers, setBrokers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedBroker, setSelectedBroker] = useState(null);

  // Export Range states
  const [exportFilter, setExportFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    fetchStats();
    fetchBrokers();
    fetchLeads();
  }, [leadFilter]);

  async function fetchStats() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        credentials: "include",
      });
      if (!res.ok) return navigate("/login");
      setStats(await res.json());
    } catch (e) {
      navigate("/login");
    }
  }

  async function fetchBrokers() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/brokers", {
        credentials: "include",
      });
      if (res.ok) setBrokers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLeads() {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/leads?status=${leadFilter}`,
        { credentials: "include" }
      );
      if (res.ok) setLeads(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function updateBrokerStatus(brokerId, status) {
    try {
      await fetch("http://localhost:5000/api/admin/broker-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerId, status }),
      });
      fetchBrokers();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  }

  async function updateLeadStatus(leadId, status) {
    try {
      await fetch("http://localhost:5000/api/admin/lead-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      fetchLeads();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  }

  // Export helpers
  function getDateRange() {
    const now = new Date();
    let from, to;

    if (exportFilter === "today") {
      from = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      to = new Date().toISOString();
    } else if (exportFilter === "7days") {
      from = new Date(Date.now() - 7 * 86400000).toISOString();
      to = new Date().toISOString();
    } else if (exportFilter === "1month") {
      from = new Date(Date.now() - 30 * 86400000).toISOString();
      to = new Date().toISOString();
    } else if (exportFilter === "3months") {
      from = new Date(Date.now() - 90 * 86400000).toISOString();
      to = new Date().toISOString();
    } else if (exportFilter === "custom") {
      from = customFrom ? new Date(customFrom).toISOString() : "";
      to = customTo ? new Date(customTo).toISOString() : "";
    }

    return { from, to };
  }

  function exportData(type) {
    const { from, to } = getDateRange();
    if (!from || !to) {
      alert("Please select a valid date range");
      return;
    }
    const url = `http://localhost:5000/api/admin/export?type=${type}&from=${from}&to=${to}`;
    window.open(url, "_blank");
  }

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      navigate("/");
    }
  };

  // Search filter
  const filteredBrokers = useMemo(() => {
    if (!searchTerm) return brokers;
    const term = searchTerm.toLowerCase();
    return brokers.filter(
      (b) =>
        b.name?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.brokerId?.toLowerCase().includes(term)
    );
  }, [brokers, searchTerm]);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter(
      (l) =>
        l.name?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.product?.toLowerCase().includes(term)
    );
  }, [leads, searchTerm]);

  return (
    <div className="adm-wrap animate-fade-up">
      {/* ═══ ADMIN SIDEBAR ═══ */}
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <div className="adm-logo-ic">⚙️</div>
          <div>
            <div className="adm-logo-name">Finn4sure</div>
            <div className="adm-logo-role">Control Panel</div>
          </div>
        </div>

        <nav className="adm-nav">
          <button
            className={`adm-nav-item ${activeTab === "dash" ? "active" : ""}`}
            onClick={() => setActiveTab("dash")}
          >
            📊 Dashboard
          </button>
          <button
            className={`adm-nav-item ${activeTab === "leads" ? "active" : ""}`}
            onClick={() => setActiveTab("leads")}
          >
            📄 Lead Applications
          </button>
          <button
            className={`adm-nav-item ${activeTab === "brokers" ? "active" : ""}`}
            onClick={() => setActiveTab("brokers")}
          >
            👥 Partners &amp; DSAs
          </button>
          <button
            className={`adm-nav-item ${activeTab === "exports" ? "active" : ""}`}
            onClick={() => setActiveTab("exports")}
          >
            📥 Platform Exports
          </button>
        </nav>

        <div className="adm-sidebar-foot">
          <button className="adm-exit-btn" onClick={handleSignOut}>
            Exit to Site
          </button>
        </div>
      </aside>

      {/* ═══ MAIN WORKSPACE AREA ═══ */}
      <div className="adm-main">
        {/* Topbar Details */}
        <div className="adm-topbar">
          <div className="adm-topbar-left">
            <h2 className="adm-section-title">
              {activeTab === "dash" && "Dashboard Overview"}
              {activeTab === "leads" && "Lead Applications"}
              {activeTab === "brokers" && "Partner Approvals"}
              {activeTab === "exports" && "Platform Data Exports"}
            </h2>
            <div className="adm-live-dot"></div>
            <span className="adm-live-lbl">Live Data</span>
          </div>

          <div className="adm-topbar-right">
            {(activeTab === "leads" || activeTab === "brokers") && (
              <div className="adm-search-wrap">
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            <div className="adm-avatar">AD</div>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="adm-panel">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dash" && (
            <div className="space-y-6">
              {/* Stat kpis grid */}
              <div className="adm-kpi-grid">
                <div className="adm-kpi-card">
                  <div className="adm-kpi-val">{stats.totalClients || 0}</div>
                  <div className="adm-kpi-lbl">Total Clients</div>
                </div>
                <div className="adm-kpi-card">
                  <div className="adm-kpi-val">{stats.totalBrokers || 0}</div>
                  <div className="adm-kpi-lbl">Total Partners</div>
                </div>
                <div className="adm-kpi-card" style={{ borderColor: "#FCD34D" }}>
                  <div className="adm-kpi-val" style={{ color: "#D97706" }}>
                    {stats.pendingBrokers || 0}
                  </div>
                  <div className="adm-kpi-lbl">Pending Partners</div>
                </div>
                <div className="adm-kpi-card" style={{ borderColor: "#818CF8" }}>
                  <div className="adm-kpi-val" style={{ color: "#4F46E5" }}>
                    {stats.pendingLeads || 0}
                  </div>
                  <div className="adm-kpi-lbl">Pending Leads</div>
                </div>
              </div>

              {/* Informative description summary */}
              <div
                style={{
                  background: "#fff",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "var(--shadow-sm)",
                  color: "var(--navy)",
                }}
              >
                <h3>Platform Overview</h3>
                <p style={{ fontSize: ".86rem", color: "var(--text2)", lineHeight: "1.6", marginTop: "8px" }}>
                  Use the left sidebar navigation panels to manage loan applications pipeline stages, review partner registrations KYC documents details, and export platform analytics data to CSV formats.
                </p>
              </div>
            </div>
          )}

          {/* 2. LEADS MANAGEMENT VIEW */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              {/* Filter controls row */}
              <div className="adm-filters">
                <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)" }}>
                  Lead Status:
                </label>
                <select
                  value={leadFilter}
                  onChange={(e) => setLeadFilter(e.target.value)}
                  className="adm-filter-sel"
                >
                  <option value="pending">Pending Verification</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Leads Table */}
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Borrower</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>PAN Card</th>
                      <th>Product</th>
                      <th>Source Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                          No leads matching this status found.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((l) => (
                        <tr key={l._id}>
                          <td style={{ fontWeight: 700 }}>{l.name}</td>
                          <td>{l.email}</td>
                          <td>{l.number}</td>
                          <td style={{ fontFamily: "monospace" }}>
                            {l.pan_hash ? `XXXXXX${l.pan_hash.slice(-4)}` : "-"}
                          </td>
                          <td>{l.product}</td>
                          <td>
                            {l.source === "direct" ? (
                              <span style={{ fontSize: ".68rem", padding: "2px 6px", background: "#E2E8F0", borderRadius: "4px" }}>
                                Direct
                              </span>
                            ) : (
                              <span style={{ fontSize: ".68rem", padding: "2px 6px", background: "#E0E7FF", color: "#4338CA", borderRadius: "4px" }}>
                                Partner ({l.broker?.name || "ID"})
                              </span>
                            )}
                          </td>
                          <td style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => setSelectedLead(l)}
                              style={{ padding: "4px 8px", fontSize: ".7rem", borderRadius: "6px", border: "1px solid #DCF5EC", cursor: "pointer" }}
                            >
                              View
                            </button>
                            {leadFilter === "pending" && (
                              <>
                                <button
                                  onClick={() => updateLeadStatus(l._id, "approved")}
                                  style={{ padding: "4px 8px", fontSize: ".7rem", borderRadius: "6px", border: "none", background: "#059669", color: "#fff", cursor: "pointer" }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateLeadStatus(l._id, "rejected")}
                                  style={{ padding: "4px 8px", fontSize: ".7rem", borderRadius: "6px", border: "none", background: "#DC2626", color: "#fff", cursor: "pointer" }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PARTNERS MANAGEMENT VIEW */}
          {activeTab === "brokers" && (
            <div className="space-y-6">
              {/* Partners Table */}
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Partner</th>
                      <th>Partner ID</th>
                      <th>Clients</th>
                      <th>Leads</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrokers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                          No partners found matching search terms.
                        </td>
                      </tr>
                    ) : (
                      filteredBrokers.map((b) => (
                        <tr key={b.brokerId}>
                          <td style={{ fontWeight: 700 }}>{b.name}</td>
                          <td>{b.brokerId}</td>
                          <td>{b.clientCount || 0}</td>
                          <td>{b.leadCount || 0}</td>
                          <td>
                            <span
                              style={{
                                fontSize: ".66rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "10px",
                                backgroundColor: b.status === "approved" ? "#DCFCE7" : b.status === "rejected" ? "#FEE2E2" : "#FEF3C7",
                                color: b.status === "approved" ? "#15803D" : b.status === "rejected" ? "#991B1B" : "#92400E",
                              }}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => setSelectedBroker(b)}
                              style={{ padding: "4px 8px", fontSize: ".7rem", borderRadius: "6px", border: "1px solid #DCF5EC", cursor: "pointer" }}
                            >
                              View
                            </button>
                            {b.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateBrokerStatus(b.brokerId, "approved")}
                                  style={{ padding: "4px 8px", fontSize: ".7rem", borderRadius: "6px", border: "none", background: "#059669", color: "#fff", cursor: "pointer" }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateBrokerStatus(b.brokerId, "rejected")}
                                  style={{ padding: "4px 8px", fontSize: ".7rem", borderRadius: "6px", border: "none", background: "#DC2626", color: "#fff", cursor: "pointer" }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. PLATFORM DATA EXPORTS VIEW */}
          {activeTab === "exports" && (
            <div
              className="space-y-6"
              style={{
                background: "#fff",
                border: "1.5px solid #E2E8F0",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "var(--shadow-sm)",
                maxWidth: "600px",
              }}
            >
              <h3>Data Exporter</h3>
              <p style={{ fontSize: ".84rem", color: "var(--text2)", marginBottom: "20px" }}>
                Generate downloadable CSV files for platform analytics.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: ".82rem", fontWeight: 700 }}>Timeframe Filter</label>
                  <select
                    value={exportFilter}
                    onChange={(e) => setExportFilter(e.target.value)}
                    style={{ padding: "8px 12px", border: "1.5px solid #E2E8F0", borderRadius: "8px" }}
                  >
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="1month">Last 1 Month</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                {exportFilter === "custom" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                      <label style={{ fontSize: ".72rem" }}>From Date</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        style={{ padding: "8px 12px", border: "1.5px solid #E2E8F0", borderRadius: "8px" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                      <label style={{ fontSize: ".72rem" }}>To Date</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        style={{ padding: "8px 12px", border: "1.5px solid #E2E8F0", borderRadius: "8px" }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button onClick={() => exportData("clients")} className="btn-primary" style={{ flex: 1 }}>
                    Export Clients
                  </button>
                  <button onClick={() => exportData("brokers")} className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg, #0D9488, #0F766E)" }}>
                    Export Partners
                  </button>
                  <button onClick={() => exportData("All")} className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg, #4F46E5, #3730A3)" }}>
                    Export All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ BROKER DETAILS MODAL ═══ */}
      {selectedBroker && (
        <div className="cd-modal" onClick={() => setSelectedBroker(null)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="cd-modal-head">
              <span>Partner KYC details</span>
              <button onClick={() => setSelectedBroker(null)}>&times;</button>
            </div>
            <div className="cd-modal-body" style={{ maxHeight: "78vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: ".84rem" }}>
                <div><strong>Name:</strong> {selectedBroker.name}</div>
                <div><strong>Email:</strong> {selectedBroker.email}</div>
                <div><strong>Phone:</strong> {selectedBroker.number}</div>
                <div><strong>Broker ID:</strong> {selectedBroker.brokerId}</div>
                <div><strong>Address:</strong> {selectedBroker.address || "-"}</div>
                <div><strong>DOB:</strong> {selectedBroker.dob || "-"}</div>
              </div>

              <div>
                <h4 style={{ margin: "10px 0 6px", borderBottom: "1px solid #E2E8F0", paddingBottom: "4px" }}>Linked Clients ({selectedBroker.clients?.length || 0})</h4>
                {selectedBroker.clients && selectedBroker.clients.length > 0 ? (
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", fontSize: ".78rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {selectedBroker.clients.map((c) => (
                      <li key={c._id}>
                        {c.name} ({c.email || c.number})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: ".76rem", color: "var(--text2)" }}>No clients linked yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LEAD DETAILS MODAL ═══ */}
      {selectedLead && (
        <div className="cd-modal" onClick={() => setSelectedLead(null)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="cd-modal-head">
              <span>Application Details</span>
              <button onClick={() => setSelectedLead(null)}>&times;</button>
            </div>
            <div className="cd-modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: ".84rem" }}>
              <div><strong>Name:</strong> {selectedLead.name}</div>
              <div><strong>Email:</strong> {selectedLead.email}</div>
              <div><strong>Phone:</strong> {selectedLead.number}</div>
              <div><strong>Asset Type:</strong> {selectedLead.product}</div>
              <div><strong>Address:</strong> {selectedLead.address || "-"}</div>
              <div><strong>DOB:</strong> {selectedLead.dob || "-"}</div>
              <div><strong>State:</strong> {selectedLead.state || "-"}</div>
              <div><strong>District:</strong> {selectedLead.district || "-"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export { AdminDashboard };
