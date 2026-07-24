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
  const [borrowers, setBorrowers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [rates, setRates] = useState([]);
  const [selectedLoanCategory, setSelectedLoanCategory] = useState("HL"); // HL, PL, BL, VL
  const [selectedRateType, setSelectedRateType] = useState("all_types");

  // Filters states
  const [leadStatusFilter, setLeadStatusFilter] = useState("all_statuses");
  const [leadTypeFilter, setLeadTypeFilter] = useState("all_loan_types");
  const [brokerStatusFilter, setBrokerStatusFilter] = useState("all_partners");
  const [borrowerStatusFilter, setBorrowerStatusFilter] = useState("all_statuses");

  // Custom alert popup notification state
  const [customAlert, setCustomAlert] = useState(null);

  // Settings states
  const [rmName, setRmName] = useState("");
  const [rmRole, setRmRole] = useState("");
  const [rmMob, setRmMob] = useState("");
  const [rmEmail, setRmEmail] = useState("");
  const [rmAvailability, setRmAvailability] = useState("");

  const [roiDisclaimer, setRoiDisclaimer] = useState("");
  const [announcementBanner, setAnnouncementBanner] = useState("");
  const [disbursedStat, setDisbursedStat] = useState("");
  const [borrowersStat, setBorrowersStat] = useState("");
  const [partnersStat, setPartnersStat] = useState("");
  const [ratingStat, setRatingStat] = useState("");

  const [adminUsername, setAdminUsername] = useState("");
  const [adminLastLogin, setAdminLastLogin] = useState("");
  const [adminSessionStatus, setAdminSessionStatus] = useState("");

  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [editingLead, setEditingLead] = useState(null); // lead being edited
  const [editForm, setEditForm] = useState({});

  const [editingBroker, setEditingBroker] = useState(null); // broker being edited
  const [editBrokerStatus, setEditBrokerStatus] = useState("active");

  function openEditBroker(broker) {
    setEditingBroker(broker);
    setEditBrokerStatus(broker.status?.toLowerCase() === "active" ? "active" : "inactive");
  }

  // Export Range states
  const [exportFilter, setExportFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    const loadAdminData = async () => {
      await fetchStats();
      await fetchLeads();
      await fetchBrokers();
      await fetchBorrowers();
      await fetchTimeline();
    };
    loadAdminData();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats", {
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        return navigate("/login");
      }
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error("fetchStats error:", e);
    }
  }

  async function fetchBrokers() {
    try {
      const res = await fetch("/api/admin/brokers", {
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
        `/api/admin/leads`,
        { credentials: "include" }
      );
      if (res.ok) setLeads(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchBorrowers() {
    try {
      const res = await fetch("/api/admin/clients", {
        credentials: "include",
      });
      if (res.ok) setBorrowers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchTimeline() {
    try {
      const res = await fetch("/api/admin/timeline", {
        credentials: "include",
      });
      if (res.ok) setTimeline(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLenderRates() {
    try {
      const res = await fetch(`/api/admin/lender-rates?loanTypeShortId=${selectedLoanCategory}`, {
        credentials: "include",
      });
      if (res.ok) setRates(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function saveLenderRates() {
    try {
      const res = await fetch("/api/admin/lender-rates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates, loanTypeShortId: selectedLoanCategory }),
      });
      if (res.ok) {
        setCustomAlert({ message: "Lender rates saved successfully!", type: "success" });
        fetchLenderRates();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSettings() {
    try {
      const resRM = await fetch("/api/admin/relationship-manager", {
        credentials: "include",
      });
      if (resRM.ok) {
        const data = await resRM.json();
        setRmName(data.name || "");
        setRmRole(data.role || "");
        setRmMob(data.mob || "");
        setRmEmail(data.email || "");
        setRmAvailability(data.availability || "");
      }

      const resAdmin = await fetch("/api/admin/admin-access-details", {
        credentials: "include",
      });
      if (resAdmin.ok) {
        const data = await resAdmin.json();
        setAdminUsername(data.username || "");
        setAdminLastLogin(data.lastLogin ? new Date(data.lastLogin).toLocaleString() : "Today, 10:32 AM");
        setAdminSessionStatus(data.sessionStatus || "Active");
      }

      const resPlat = await fetch("/api/admin/platform-settings", {
        credentials: "include",
      });
      if (resPlat.ok) {
        const data = await resPlat.json();
        setRoiDisclaimer(data.roi_disclaimer || "");
        setAnnouncementBanner(data.announcement_banner || "");
        setDisbursedStat(data.disbursed_stat || "");
        setBorrowersStat(data.borrowers_stat || "");
        setPartnersStat(data.partners_stat || "");
        setRatingStat(data.rating_stat || "");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveRM() {
    try {
      const res = await fetch("/api/admin/relationship-manager", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rmName,
          role: rmRole,
          mob: rmMob,
          email: rmEmail,
          availability: rmAvailability
        }),
      });
      if (res.ok) {
        setCustomAlert({ message: "Relationship Manager details saved successfully!", type: "success" });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveContent() {
    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roi_disclaimer: roiDisclaimer,
          announcement_banner: announcementBanner
        }),
      });
      if (res.ok) {
        setCustomAlert({ message: "ROI Disclaimer and Ticker Banner text saved successfully!", type: "success" });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleApplyStats() {
    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disbursed_stat: disbursedStat,
          borrowers_stat: borrowersStat,
          partners_stat: partnersStat,
          rating_stat: ratingStat
        }),
      });
      if (res.ok) {
        setCustomAlert({ message: "Platform Statistics saved and applied successfully!", type: "success" });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function updateBrokerStatus(brokerId, status) {
    try {
      const res = await fetch("/api/admin/broker-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerId, status }),
      });
      if (res.status === 429) {
        setCustomAlert({ message: "Server rate limit reached — please wait 1 minute and try again.", type: "error" });
        return;
      }
      if (res.ok) {
        setBrokers((prev) =>
          prev.map((b) =>
            String(b.brokerId) === String(brokerId) || String(b.id) === String(brokerId)
              ? { ...b, status: status }
              : b
          )
        );
        setCustomAlert({ message: "Partner status updated successfully!", type: "success" });
      } else {
        let errMsg = "Failed to update partner status";
        try {
          const errData = await res.json();
          if (errData?.message) errMsg = errData.message;
        } catch (_) {}
        setCustomAlert({ message: errMsg, type: "error" });
      }
    } catch (e) {
      console.error(e);
      setCustomAlert({ message: "Network error. Please try again.", type: "error" });
    }
  }

  async function updateLeadStatus(leadId, status) {
    try {
      const res = await fetch("/api/admin/lead-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((item) =>
            item.id === leadId ? { ...item, status, statusName: status } : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  function openEditLead(lead) {
    setEditingLead(lead);
    setEditForm({
      status: lead.status || "applied",
      loan_amount: lead.loan_amount || "",
      tenure: lead.tenure || "",
      loan_purpose: lead.loan_purpose || "",
    });
  }

  async function saveEditLead() {
    try {
      const res = await fetch(`/api/admin/leads/${editingLead.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.status === 429) {
        setCustomAlert({ message: "Server rate limit reached — please wait 1 minute and try again.", type: "error" });
        return;
      }
      if (res.ok) {
        setEditingLead(null);
        setEditForm({});
        setLeads((prev) =>
          prev.map((item) =>
            item.id === editingLead.id
              ? { ...item, ...editForm, statusName: editForm.status || item.statusName }
              : item
          )
        );
        setCustomAlert({ message: "Application updated successfully!", type: "success" });
      } else {
        let errMsg = "Failed to update application";
        try {
          const errData = await res.json();
          if (errData?.message) errMsg = errData.message;
        } catch (_) {}
        setCustomAlert({ message: errMsg, type: "error" });
      }
    } catch (e) {
      console.error(e);
      setCustomAlert({ message: "Network error. Please try again.", type: "error" });
    }
  }

  // Export helpers
  function getDateRange() {
    const now = new Date();
    let from = new Date(Date.now() - 365 * 86400000).toISOString();
    let to = new Date().toISOString();

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
      from = customFrom ? new Date(customFrom).toISOString() : from;
      to = customTo ? new Date(customTo).toISOString() : to;
    }

    return { from, to };
  }

  function exportData(type, format = "xlsx") {
    const { from, to } = getDateRange();
    if (!from || !to) {
      setCustomAlert({ message: "Please select a valid date range", type: "warning" });
      return;
    }
    const url = `/api/admin/export?type=${type}&from=${from}&to=${to}&format=${format}`;
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

  // Search and status filter
  const filteredBrokers = useMemo(() => {
    return brokers.filter((b) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        b.name?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.brokerId?.toLowerCase().includes(term);

      const matchesStatus =
        brokerStatusFilter === "all_partners" ||
        (brokerStatusFilter === "active" && b.status === "active") ||
        (brokerStatusFilter === "inactive" && b.status !== "active");

      return matchesSearch && matchesStatus;
    });
  }, [brokers, searchTerm, brokerStatusFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        l.name?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.product?.toLowerCase().includes(term);

      const matchesStatus =
        leadStatusFilter === "all_statuses" ||
        l.status?.toLowerCase() === leadStatusFilter.toLowerCase();

      const matchesType =
        leadTypeFilter === "all_loan_types" ||
        (leadTypeFilter === "home" && l.product?.toLowerCase().includes("home")) ||
        (leadTypeFilter === "personal" && l.product?.toLowerCase().includes("personal")) ||
        (leadTypeFilter === "business" && l.product?.toLowerCase().includes("business")) ||
        (leadTypeFilter === "vehicle" && l.product?.toLowerCase().includes("vehicle"));

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leads, searchTerm, leadStatusFilter, leadTypeFilter]);

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((b) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        b.name?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.number?.includes(term);

      const matchesStatus =
        borrowerStatusFilter === "all_statuses" ||
        (b.status || "active").toLowerCase() === borrowerStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [borrowers, searchTerm, borrowerStatusFilter]);

  const disbursedCount = leads.filter(l => ['disbursed', 'completed', 'approved'].includes(l.status)).length;
  const pendingCount = leads.filter(l => l.status === 'rejected').length;
  const inProgressCount = leads.length - disbursedCount - pendingCount;
  const totalLeadsCount = leads.length || 1;
  const disbursedPct = Math.round((disbursedCount / totalLeadsCount) * 100);
  const pendingPct = Math.round((pendingCount / totalLeadsCount) * 100);
  const inProgressPct = 100 - disbursedPct - pendingPct;

  return (
    <div className="adm-wrap animate-fade-up">
      {/* ═══ ADMIN SIDEBAR ═══ */}
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <div className="adm-logo-gear-box">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
            </svg>
          </div>
          <div>
            <div className="adm-logo-name">Finn4sure</div>
            <div className="adm-logo-role">ADMIN CONTROL PANEL</div>
          </div>
        </div>

        <nav className="adm-nav">
          <button
            className={`adm-nav-item ${activeTab === "dash" ? "active" : ""}`}
            onClick={() => setActiveTab("dash")}
          >
            <svg className="adm-nav-svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </button>

          <button
            className={`adm-nav-item ${activeTab === "leads" ? "active" : ""}`}
            onClick={() => setActiveTab("leads")}
          >
            <svg className="adm-nav-svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Applications
            <span className="adm-nav-badge">{leads.length}</span>
          </button>

          <button
            className={`adm-nav-item ${activeTab === "brokers" ? "active" : ""}`}
            onClick={() => setActiveTab("brokers")}
          >
            <svg className="adm-nav-svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Partners
          </button>

          <button
            className={`adm-nav-item ${activeTab === "borrowers" ? "active" : ""}`}
            onClick={() => setActiveTab("borrowers")}
          >
            <svg className="adm-nav-svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Borrowers
          </button>

          <button
            className={`adm-nav-item ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <svg className="adm-nav-svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Timeline
          </button>

          <button
            className={`adm-nav-item ${activeTab === "rates" ? "active" : ""}`}
            onClick={() => setActiveTab("rates")}
          >
            <svg className="adm-nav-svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Lender Rates
          </button>

          <button
            className={`adm-nav-item ${activeTab === "exports" ? "active" : ""}`}
            onClick={() => setActiveTab("exports")}
          >
            <svg className="adm-nav-svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>

        <div className="adm-sidebar-foot">
          <button className="adm-exit-btn" onClick={handleSignOut}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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
              {activeTab === "borrowers" && "Borrowers Management"}
              {activeTab === "timeline" && "System Timeline"}
              {activeTab === "rates" && "Lender Rates Panel"}
            </h2>
            <div className="adm-live-dot"></div>
            <span className="adm-live-lbl">Live Data</span>
          </div>

          <div className="adm-topbar-right">
            <div className="adm-search-wrap">
              <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search applications, partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="adm-avatar">AD</div>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="adm-panel">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dash" && (
            <div className="adm-dash-container">
              {/* Stat KPIs Grid */}
              <div className="adm-kpi-grid-redesigned">
                {/* 1. Total Applications */}
                <div className="adm-kpi-card-new c-blue">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">📋</span>
                  </div>
                  <div className="adm-kpi-card-value">{stats.totalApplications ?? leads.length}</div>
                  <div className="adm-kpi-card-label">TOTAL APPLICATIONS</div>
                  <div className="adm-kpi-card-subtext">across borrowers & partners</div>
                </div>

                {/* 2. In Progress */}
                <div className="adm-kpi-card-new c-orange">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">⏳</span>
                  </div>
                  <div className="adm-kpi-card-value">{stats.inProgressCount ?? 0}</div>
                  <div className="adm-kpi-card-label">IN PROGRESS</div>
                  <div className="adm-kpi-card-subtext">docs, credit, sanction, legal</div>
                </div>

                {/* 3. Completed */}
                <div className="adm-kpi-card-new c-green">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">✅</span>
                  </div>
                  <div className="adm-kpi-card-value">{stats.completedCount ?? 0}</div>
                  <div className="adm-kpi-card-label">COMPLETED</div>
                  <div className="adm-kpi-card-subtext">disbursed & paid out</div>
                </div>

                {/* 4. Rejected */}
                <div className="adm-kpi-card-new c-red">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">❌</span>
                  </div>
                  <div className="adm-kpi-card-value">{stats.rejectedCount ?? 0}</div>
                  <div className="adm-kpi-card-label">REJECTED</div>
                  <div className="adm-kpi-card-subtext">declined applications</div>
                </div>

                {/* 5. Disbursed Amount */}
                <div className="adm-kpi-card-new c-green">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">💸</span>
                  </div>
                  <div className="adm-kpi-card-value">
                    {stats.disbursedAmount != null
                      ? stats.disbursedAmount >= 10000000
                        ? `₹${(stats.disbursedAmount / 10000000).toFixed(2)}Cr`
                        : stats.disbursedAmount >= 100000
                          ? `₹${(stats.disbursedAmount / 100000).toFixed(1)}L`
                          : `₹${stats.disbursedAmount.toLocaleString('en-IN')}`
                      : "₹0"}
                  </div>
                  <div className="adm-kpi-card-label">DISBURSED AMOUNT</div>
                  <div className="adm-kpi-card-subtext">total paid out to borrowers</div>
                </div>

                {/* 6. Loan Volume */}
                <div className="adm-kpi-card-new c-purple">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">💰</span>
                  </div>
                  <div className="adm-kpi-card-value">
                    {stats.loanVolume != null
                      ? stats.loanVolume >= 10000000
                        ? `₹${(stats.loanVolume / 10000000).toFixed(2)}Cr`
                        : stats.loanVolume >= 100000
                          ? `₹${(stats.loanVolume / 100000).toFixed(1)}L`
                          : `₹${stats.loanVolume.toLocaleString('en-IN')}`
                      : "—"}
                  </div>
                  <div className="adm-kpi-card-label">LOAN VOLUME</div>
                  <div className="adm-kpi-card-subtext">total pipeline amount</div>
                </div>

                {/* 6. Active Partners */}
                <div className="adm-kpi-card-new c-teal">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">🤝</span>
                  </div>
                  <div className="adm-kpi-card-value">{stats.approvedBrokers ?? 0}</div>
                  <div className="adm-kpi-card-label">ACTIVE PARTNERS</div>
                  <div className="adm-kpi-card-subtext">of {stats.totalBrokers ?? 0} total partners</div>
                </div>

                {/* 7. Active Borrowers */}
                <div className="adm-kpi-card-new c-brown">
                  <div className="adm-kpi-card-top">
                    <span className="adm-kpi-card-icon">👥</span>
                  </div>
                  <div className="adm-kpi-card-value">{stats.activeBorrowers ?? 0}</div>
                  <div className="adm-kpi-card-label">ACTIVE BORROWERS</div>
                  <div className="adm-kpi-card-subtext">registered clients</div>
                </div>
              </div>

              {/* Lower Section: Recent Applications & Loan Type Breakdown */}
              <div className="adm-dash-row">
                {/* Left Card: Recent Applications */}
                <div className="adm-workspace-card w-65">
                  <div className="adm-wcard-header">
                    <h3>Recent Applications</h3>
                    <button className="adm-wcard-link" onClick={() => setActiveTab("leads")}>See all &rarr;</button>
                  </div>
                  <div className="adm-wcard-body" style={{ padding: 0 }}>
                    {leads.length === 0 ? (
                      <div className="empty-placeholder" style={{ minHeight: '120px' }}>
                        <p className="no-data-text">No recent applications found</p>
                      </div>
                    ) : (
                      <table className="lenders-table" style={{ fontSize: '0.8rem' }}>
                        <thead>
                          <tr>
                            <th>BORROWER</th>
                            <th>PRODUCT</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.slice(0, 5).map((l) => (
                            <tr key={l.id}>
                              <td style={{ fontWeight: 600 }}>{l.name}</td>
                              <td>{l.product}</td>
                              <td>
                                <span style={{ textTransform: 'capitalize' }} className={`rate-type-badge ${['completed', 'disbursed', 'approved'].includes(l.status) ? 'private' : l.status === 'rejected' ? 'nbfc-hfc' : 'psu'}`}>
                                  {l.status || 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Right Card: Loan Type Breakdown */}
                <div className="adm-workspace-card w-35">
                  <div className="adm-wcard-header">
                    <h3>Loan Type Breakdown</h3>
                  </div>
                  <div className="adm-wcard-body">
                    <h4 className="breakdown-subtitle">Pipeline by Status</h4>

                    <div className="breakdown-item">
                      <div className="breakdown-info">
                        <span>Completed</span>
                        <span>{disbursedCount}</span>
                      </div>
                      <div className="breakdown-progress-bar">
                        <div className="breakdown-progress bg-green" style={{ width: `${disbursedPct}%` }}></div>
                      </div>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-info">
                        <span>In Progress</span>
                        <span>{inProgressCount}</span>
                      </div>
                      <div className="breakdown-progress-bar">
                        <div className="breakdown-progress bg-orange" style={{ width: `${inProgressPct}%` }}></div>
                      </div>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-info">
                        <span>Rejected</span>
                        <span>{pendingCount}</span>
                      </div>
                      <div className="breakdown-progress-bar">
                        <div className="breakdown-progress bg-red" style={{ width: `${pendingPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card: Top Lenders */}
              <div className="adm-workspace-card mt-6">
                <div className="adm-wcard-header">
                  <h3>Top Lenders by Application Volume</h3>
                </div>
                <div className="adm-wcard-body">
                  <table className="lenders-table">
                    <thead>
                      <tr>
                        <th>LENDER</th>
                        <th>VOLUME BAR</th>
                        <th>COUNT</th>
                        <th>TYPE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!stats.topLenders || stats.topLenders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="no-data-cell">No lender volume data available</td>
                        </tr>
                      ) : (
                        stats.topLenders.map((lender, index) => {
                          const maxCount = Math.max(...stats.topLenders.map(l => Number(l.count))) || 1;
                          const barWidth = Math.round((Number(lender.count) / maxCount) * 100);
                          return (
                            <tr key={index}>
                              <td style={{ fontWeight: 600, color: '#0d2b6b' }}>{lender.name}</td>
                              <td style={{ verticalAlign: 'middle', width: '50%' }}>
                                <div className="breakdown-progress-bar" style={{ height: '8px', margin: 0 }}>
                                  <div className="breakdown-progress bg-blue" style={{ width: `${barWidth}%`, height: '100%', borderRadius: '4px' }}></div>
                                </div>
                              </td>
                              <td style={{ fontWeight: 700 }}>{lender.count}</td>
                              <td>
                                <span className={`rate-type-badge ${lender.type.toLowerCase().replace('/', '-')}`}>
                                  {lender.type.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. LEADS MANAGEMENT VIEW (Loan Applications) */}
          {activeTab === "leads" && (
            <div className="adm-subtab-container animate-fade-up">
              <div className="adm-controls-row">
                <select className="adm-filter-dropdown" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}>
                  <option value="all_statuses">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="docs">Docs</option>
                  <option value="credit">Credit</option>
                  <option value="submitted">Submitted</option>
                  <option value="sanction">Sanction</option>
                  <option value="legal">Legal</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select className="adm-filter-dropdown" value={leadTypeFilter} onChange={(e) => setLeadTypeFilter(e.target.value)}>
                  <option value="all_loan_types">All Loan Types</option>
                  <option value="home">Home Loan</option>
                  <option value="personal">Personal Loan</option>
                  <option value="business">Business Loan</option>
                  <option value="vehicle">Vehicle Loan</option>
                </select>

                <button className="adm-ctrl-btn btn-csv" onClick={() => exportData("clients", "csv")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV
                </button>

                <button className="adm-ctrl-btn btn-xls" onClick={() => exportData("clients", "xlsx")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  XLS
                </button>
              </div>

              <div className="adm-workspace-card">
                <div className="adm-wcard-body" style={{ padding: 0 }}>
                  <table className="lenders-table">
                    <thead>
                      <tr>
                        <th>APP ID</th>
                        <th>BORROWER</th>
                        <th>LOAN TYPE</th>
                        <th>AMOUNT</th>
                        <th>SOURCE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="no-data-cell" style={{ padding: '40px 20px' }}>No applications match</td>
                        </tr>
                      ) : (
                        filteredLeads.map((l) => (
                          <tr key={l.id}>
                            <td style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.8rem', letterSpacing: '0.02em' }}>
                              {l.application_no ?? `#${l.id}`}
                            </td>
                            <td style={{ fontWeight: 600 }}>{l.name}</td>
                            <td>{l.product}</td>
                            <td>{l.loan_amount ? `₹${Number(l.loan_amount).toLocaleString('en-IN')}` : "-"}</td>
                            <td>{l.source || "Direct"}</td>
                            <td>
                              <span style={{ textTransform: 'capitalize' }} className={`rate-type-badge ${['completed', 'disbursed', 'approved'].includes(l.status) ? 'private' : l.status === 'rejected' ? 'nbfc-hfc' : 'psu'}`}>
                                {l.status || 'Unknown'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => setSelectedLead(l)} className="settings-action-btn" style={{ padding: '4px 10px', fontSize: '.75rem', marginTop: 0 }}>View</button>
                                <button onClick={() => openEditLead(l)} className="settings-action-btn" style={{ padding: '4px 10px', fontSize: '.75rem', marginTop: 0, background: 'linear-gradient(135deg,#0d2b6b,#1a56db)' }}>Edit</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. PARTNERS MANAGEMENT VIEW */}
          {activeTab === "brokers" && (
            <div className="adm-subtab-container animate-fade-up">
              <div className="adm-controls-row">
                <select className="adm-filter-dropdown" value={brokerStatusFilter} onChange={(e) => setBrokerStatusFilter(e.target.value)}>
                  <option value="all_partners">All Partners</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>

                <div className="adm-search-input-wrapper">
                  <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24" className="search-icon-inside">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" placeholder="Search partner or borrower.." className="adm-inner-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <button className="adm-ctrl-btn btn-csv" onClick={() => exportData("brokers")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>

              <div className="adm-workspace-card">
                <div className="adm-wcard-body" style={{ padding: 0 }}>
                  {filteredBrokers.length === 0 ? (
                    <div className="empty-placeholder" style={{ minHeight: '240px' }}>
                      <p className="no-data-text">No partners match</p>
                    </div>
                  ) : (
                    <table className="lenders-table">
                      <thead>
                        <tr>
                          <th>Partner</th>
                          <th>Partner ID</th>
                          <th>Clients</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBrokers.map((b) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 700 }}>{b.name}</td>
                            <td>{b.brokerId}</td>
                            <td>{b.clientCount || 0}</td>
                            <td>
                              <span className={`rate-type-badge ${b.status === 'active' ? 'private' :
                                  b.status === 'suspended' ? 'nbfc-hfc' : 'psu'
                                }`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => setSelectedBroker(b)} className="settings-action-btn" style={{ padding: '4px 10px', fontSize: '.75rem', marginTop: 0 }}>View</button>
                                <button onClick={() => openEditBroker(b)} className="settings-action-btn" style={{ padding: '4px 10px', fontSize: '.75rem', marginTop: 0, background: 'linear-gradient(135deg,#0d2b6b,#1a56db)' }}>Edit</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. BORROWERS MANAGEMENT VIEW */}
          {activeTab === "borrowers" && (
            <div className="adm-subtab-container animate-fade-up">
              <div className="adm-controls-row">
                <select className="adm-filter-dropdown" value={borrowerStatusFilter} onChange={(e) => setBorrowerStatusFilter(e.target.value)}>
                  <option value="all_statuses">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button className="adm-ctrl-btn btn-csv" onClick={() => exportData("clients")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>

              <div className="adm-workspace-card">
                <div className="adm-wcard-body" style={{ padding: 0 }}>
                  <table className="lenders-table">
                    <thead>
                      <tr>
                        <th>BORROWER</th>
                        <th>MOBILE</th>
                        <th>EMAIL</th>
                        <th>LOCATION</th>
                        <th>JOINED</th>
                        <th>LOANS</th>
                        <th>APPLIED TO</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBorrowers.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="no-data-cell" style={{ padding: '40px 20px' }}>No borrowers found</td>
                        </tr>
                      ) : (
                        filteredBorrowers.map((b) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600, color: '#0d2b6b' }}>{b.name}</td>
                            <td>{b.number}</td>
                            <td>{b.email}</td>
                            <td>{b.address || b.district || b.state || "-"}</td>
                            <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                            <td>{b.loanCount || 0}</td>
                            <td>Direct</td>
                            <td>
                              <span style={{ 
                                textTransform: 'capitalize', 
                                fontWeight: 600, 
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: b.status === 'active' ? '#dcfce7' : b.status === 'inactive' ? '#fef3c7' : '#fee2e2',
                                color: b.status === 'active' ? '#166534' : b.status === 'inactive' ? '#92400e' : '#991b1b'
                              }}>
                                {b.status || 'Active'}
                              </span>
                            </td>
                            <td>
                              <button onClick={() => setSelectedBorrower(b)} className="settings-action-btn" style={{ padding: '4px 10px', fontSize: '.75rem', marginTop: 0 }}>View</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. TIMELINE VIEW */}
          {activeTab === "timeline" && (
            <div className="adm-subtab-container animate-fade-up">
              <div className="timeline-subtitle-legend">
                <span style={{ marginRight: '4px' }}>📅</span> Recent system activity and application status changes.
              </div>

              <div className="adm-workspace-card" style={{ marginTop: '16px' }}>
                <div className="adm-wcard-body" style={{ padding: 0 }}>
                  {timeline.length === 0 ? (
                    <div className="empty-placeholder" style={{ minHeight: '240px' }}>
                      <p className="no-data-text">No timeline activity found</p>
                    </div>
                  ) : (
                    <table className="lenders-table">
                      <thead>
                        <tr>
                          <th>DATE</th>
                          <th>EVENT</th>
                          <th>PRODUCT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeline.map((t) => (
                          <tr key={t.id}>
                            <td>{new Date(t.date).toLocaleString()}</td>
                            <td style={{ fontWeight: 600 }}>Application submitted by {t.borrower}</td>
                            <td>{t.product}</td>
                            <td>
                              <span style={{ textTransform: 'capitalize' }} className={`rate-type-badge ${t.status === 'approved' ? 'private' : t.status === 'rejected' ? 'nbfc-hfc' : 'psu'}`}>
                                {t.status || 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. LENDER RATES VIEW */}
          {activeTab === "rates" && (
            <div className="adm-subtab-container animate-fade-up">
              <div className="adm-controls-row">
                <select className="adm-filter-dropdown" value={selectedRateType} onChange={(e) => setSelectedRateType(e.target.value)}>
                  <option value="all_types">All Types</option>
                  <option value="psu">PSU</option>
                  <option value="private">Private</option>
                  <option value="nbfc_hfc">NBFC/HFC</option>
                </select>

                <select className="adm-filter-dropdown" value={selectedLoanCategory} onChange={(e) => setSelectedLoanCategory(e.target.value)}>
                  <option value="HL">Home Loan</option>
                  <option value="PL">Personal Loan</option>
                  <option value="BL">Business Loan</option>
                  <option value="VL">Vehicle Loan</option>
                </select>

                <button className="adm-ctrl-btn btn-csv" onClick={saveLenderRates}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                  </svg>
                  Save Rate Changes
                </button>
              </div>

              <div className="timeline-subtitle-legend" style={{ margin: '16px 0' }}>
                📝 Edit rates directly in the table. Click "Save Rate Changes" to apply. Changes update the EMI calculator and lender comparison in real time.
              </div>

              <div className="adm-workspace-card">
                <div className="adm-wcard-body" style={{ padding: 0, overflowX: 'auto' }}>
                  <table className="rates-editable-table">
                    <thead>
                      <tr>
                        <th>LENDER</th>
                        <th>TYPE</th>
                        <th>FLOATING - LOW</th>
                        <th>FLOATING - HIGH</th>
                        <th>FIXED - LOW</th>
                        <th>FIXED - HIGH</th>
                        <th>OFFER</th>
                        <th>VISIBLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rates.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="no-data-cell" style={{ padding: '40px 20px' }}>Loading lender rates..</td>
                        </tr>
                      ) : (
                        rates
                          .filter(r => selectedRateType === "all_types" || r.type.toLowerCase().replace('/', '_') === selectedRateType)
                          .map((rate, index) => (
                            <tr key={index}>
                              <td style={{ fontWeight: 600, color: '#0d2b6b' }}>{rate.name}</td>
                              <td>
                                <span className={`rate-type-badge ${rate.type.toLowerCase().replace('/', '-')}`}>
                                  {rate.type}
                                </span>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.flowLow}
                                  onChange={(e) => {
                                    const updated = [...rates];
                                    updated[index].flowLow = e.target.value;
                                    setRates(updated);
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.flowHigh}
                                  onChange={(e) => {
                                    const updated = [...rates];
                                    updated[index].flowHigh = e.target.value;
                                    setRates(updated);
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.fixLow}
                                  onChange={(e) => {
                                    const updated = [...rates];
                                    updated[index].fixLow = e.target.value;
                                    setRates(updated);
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.fixHigh}
                                  onChange={(e) => {
                                    const updated = [...rates];
                                    updated[index].fixHigh = e.target.value;
                                    setRates(updated);
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input offer-input"
                                  value={rate.offer}
                                  onChange={(e) => {
                                    const updated = [...rates];
                                    updated[index].offer = e.target.value;
                                    setRates(updated);
                                  }}
                                />
                              </td>
                              <td>
                                <label className="switch-toggle-container">
                                  <input
                                    type="checkbox"
                                    checked={rate.visible}
                                    onChange={(e) => {
                                      const updated = [...rates];
                                      updated[index].visible = e.target.checked;
                                      setRates(updated);
                                    }}
                                  />
                                  <span className="switch-slider"></span>
                                </label>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. SETTINGS VIEW (Platform Settings) */}
          {activeTab === "exports" && (
            <div className="adm-settings-container animate-fade-up">
              <div className="adm-settings-columns">
                {/* Left Column */}
                <div className="adm-settings-column">
                  {/* Card 1: Relationship Manager */}
                  <div className="adm-workspace-card">
                    <div className="adm-wcard-header">
                      <h3 style={{ color: '#0d2b6b' }}>👤 Relationship Manager</h3>
                    </div>
                    <div className="adm-wcard-body settings-card-body">
                      <div className="settings-field-group">
                        <label className="settings-field-label">NAME</label>
                        <input type="text" className="settings-field-input" value={rmName} onChange={(e) => setRmName(e.target.value)} />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">ROLE</label>
                        <input type="text" className="settings-field-input" value={rmRole} onChange={(e) => setRmRole(e.target.value)} />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">MOBILE</label>
                        <input type="text" className="settings-field-input" value={rmMob} onChange={(e) => setRmMob(e.target.value)} />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">EMAIL</label>
                        <input type="email" className="settings-field-input" value={rmEmail} onChange={(e) => setRmEmail(e.target.value)} />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">AVAILABILITY</label>
                        <input type="text" className="settings-field-input" value={rmAvailability} onChange={(e) => setRmAvailability(e.target.value)} />
                      </div>
                      <button className="settings-action-btn" onClick={handleSaveRM}>Save RM Details</button>
                    </div>
                  </div>

                  {/* Card 2: ROI Disclaimer Text & Announcement Banner */}
                  <div className="adm-workspace-card mt-6">
                    <div className="adm-wcard-body settings-card-body">
                      <div className="settings-field-group">
                        <h3 className="settings-section-heading">🔔 ROI Disclaimer Text</h3>
                        <textarea
                          className="settings-field-textarea"
                          value={roiDisclaimer}
                          onChange={(e) => setRoiDisclaimer(e.target.value)}
                          rows="3"
                        />
                      </div>

                      <div className="settings-field-group" style={{ marginTop: '20px' }}>
                        <h3 className="settings-section-heading">📣 Announcement Banner</h3>
                        <input
                          type="text"
                          className="settings-field-input"
                          placeholder="Optional — shows in ticker (leave blank to hide)"
                          value={announcementBanner}
                          onChange={(e) => setAnnouncementBanner(e.target.value)}
                        />
                      </div>

                      <button className="settings-action-btn" onClick={handleSaveContent}>Save Content</button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="adm-settings-column">
                  {/* Card 3: Platform Stats Display */}
                  <div className="adm-workspace-card">
                    <div className="adm-wcard-header">
                      <h3 style={{ color: '#0d2b6b' }}>📊 Platform Stats Display</h3>
                    </div>
                    <div className="adm-wcard-body settings-card-body">
                      <div className="settings-field-group">
                        <label className="settings-field-label">DISBURSED (SHOW ON HOMEPAGE)</label>
                        <input type="text" className="settings-field-input" value={disbursedStat} onChange={(e) => setDisbursedStat(e.target.value)} />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">BORROWERS COUNT</label>
                        <input type="text" className="settings-field-input" value={borrowersStat} onChange={(e) => setBorrowersStat(e.target.value)} />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">PARTNERS COUNT</label>
                        <input type="text" className="settings-field-input" value={partnersStat} onChange={(e) => setPartnersStat(e.target.value)} />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">RATING</label>
                        <input type="text" className="settings-field-input" value={ratingStat} onChange={(e) => setRatingStat(e.target.value)} />
                      </div>
                      <button className="settings-action-btn" onClick={handleApplyStats}>Apply Stats</button>
                    </div>
                  </div>

                  {/* Card 4: Admin Access */}
                  <div className="adm-workspace-card mt-6">
                    <div className="adm-wcard-header">
                      <h3 style={{ color: '#0d2b6b' }}>🔐 Admin Access</h3>
                    </div>
                    <div className="adm-wcard-body settings-card-body">
                      <div className="settings-field-group">
                        <label className="settings-field-label">ADMIN USERNAME</label>
                        <input type="text" className="settings-field-input disabled-style" value={adminUsername} readOnly />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">LAST LOGIN</label>
                        <input type="text" className="settings-field-input disabled-style" value={adminLastLogin} readOnly />
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">SESSION</label>
                        <div className="settings-session-badge-container">
                          <span className="session-status-badge">{adminSessionStatus}</span>
                        </div>
                      </div>
                      <div className="settings-field-group">
                        <label className="settings-field-label">PORTAL URL</label>
                        <input type="text" className="settings-field-input disabled-style" value="finn4sure.com/admin" readOnly />
                      </div>
                    </div>
                  </div>
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
                <h4 style={{ margin: "10px 0 10px", borderBottom: "1px solid #E2E8F0", paddingBottom: "4px" }}>Linked Clients ({selectedBroker.clients?.length || 0})</h4>
                {selectedBroker.clients && selectedBroker.clients.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".78rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1.5px solid #e2e8f0", color: "#64748b", textTransform: "uppercase" }}>
                          <th style={{ padding: "8px 4px", fontWeight: 600 }}>Name</th>
                          <th style={{ padding: "8px 4px", fontWeight: 600 }}>Email</th>
                          <th style={{ padding: "8px 4px", fontWeight: 600 }}>Mobile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBroker.clients.map((c) => (
                          <tr key={c.id || Math.random()} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "8px 4px", fontWeight: 500, color: "#0f172a" }}>{c.name || "-"}</td>
                            <td style={{ padding: "8px 4px", color: "#475569" }}>{c.email || "-"}</td>
                            <td style={{ padding: "8px 4px", color: "#475569" }}>{c.number || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

      {/* ═══ EDIT APPLICATION MODAL (Status only) ═══ */}
      {editingLead && (
        <div className="cd-modal" onClick={() => setEditingLead(null)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="cd-modal-head">
              <span>Update Status — {editingLead.application_no ?? `#${editingLead.id}`}</span>
              <button onClick={() => setEditingLead(null)}>&times;</button>
            </div>
            <div className="cd-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '.85rem' }}>
              {/* Read-only info */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '.8rem' }}>
                <div><strong>Borrower:</strong> {editingLead.name}</div>
                <div><strong>Loan Type:</strong> {editingLead.product}</div>
                <div><strong>Amount:</strong> {editingLead.loan_amount ? `₹${Number(editingLead.loan_amount).toLocaleString('en-IN')}` : '-'}</div>
                <div><strong>Source:</strong> {editingLead.source}</div>
              </div>

              {/* Status selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, color: '#0d2b6b', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Application Status</label>
                <select
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '.9rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
                >
                  <option value="applied">Applied</option>
                  <option value="docs">Docs</option>
                  <option value="credit">Credit</option>
                  <option value="submitted">Submitted</option>
                  <option value="sanction">Sanction</option>
                  <option value="legal">Legal</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={saveEditLead}
                  className="settings-action-btn"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '.85rem' }}
                >
                  Update Status
                </button>
                <button
                  onClick={() => setEditingLead(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '.85rem', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT PARTNER STATUS MODAL ═══ */}
      {editingBroker && (
        <div className="cd-modal" onClick={() => setEditingBroker(null)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="cd-modal-head">
              <span>Edit Partner Status — {editingBroker.name}</span>
              <button onClick={() => setEditingBroker(null)}>&times;</button>
            </div>
            <div className="cd-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '.85rem' }}>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '.8rem' }}>
                <div><strong>Partner ID:</strong> {editingBroker.brokerId}</div>
                <div><strong>Current Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 700, color: editingBroker.status === 'active' ? '#059669' : '#dc2626' }}>{editingBroker.status}</span></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, color: '#0d2b6b', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Partner Status</label>
                <select
                  value={editBrokerStatus}
                  onChange={(e) => setEditBrokerStatus(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '.9rem', outline: 'none', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={async () => {
                    await updateBrokerStatus(editingBroker.brokerId || editingBroker.id, editBrokerStatus);
                    setEditingBroker(null);
                  }}
                  className="settings-action-btn"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '.85rem' }}
                >
                  Save Status
                </button>
                <button
                  onClick={() => setEditingBroker(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '.85rem', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BORROWER MODAL ═══ */}
      {selectedBorrower && (
        <div className="cd-modal" onClick={() => setSelectedBorrower(null)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="cd-modal-head">
              <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0d2b6b", letterSpacing: ".02em" }}>Borrower Details</span>
              <button onClick={() => setSelectedBorrower(null)}>&times;</button>
            </div>
            <div className="cd-modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: ".84rem" }}>
              <div><strong>Name:</strong> {selectedBorrower.name}</div>
              <div><strong>Email:</strong> {selectedBorrower.email}</div>
              <div><strong>Mobile:</strong> {selectedBorrower.number}</div>
              <div><strong>Location:</strong> {selectedBorrower.address || selectedBorrower.district || selectedBorrower.state || "-"}</div>
              <div><strong>Joined:</strong> {new Date(selectedBorrower.createdAt).toLocaleDateString()}</div>
              <div><strong>Loans:</strong> {selectedBorrower.loanCount || 0}</div>
              <div><strong>Applied To:</strong> Direct</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CUSTOM ALERT MODAL ═══ */}
      {customAlert && (
        <div className="cd-modal" onClick={() => setCustomAlert(null)}>
          <div className="cd-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px", borderRadius: "12px" }}>
            <div className="cd-modal-head" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0d2b6b" }}>Notification</span>
              <button onClick={() => setCustomAlert(null)} style={{ fontSize: "1.5rem" }}>&times;</button>
            </div>
            <div className="cd-modal-body" style={{ textAlign: "center", padding: "20px 24px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
                {customAlert.type === "success" ? "✅" : "⚠️"}
              </div>
              <p style={{ fontSize: "0.95rem", color: "#334155", margin: 0, fontWeight: 500 }}>
                {customAlert.message}
              </p>
              <button
                onClick={() => setCustomAlert(null)}
                className="settings-action-btn"
                style={{ marginTop: "20px", width: "100%", borderRadius: "8px", padding: "10px" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export { AdminDashboard };
