import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LENDERS, getLenderTypePriority } from "../utils/loanConstants";
import "./styles/adminDashboard.css";

function buildCategoryRates(catKey, backendRates = []) {
  const mapKey = {
    'HL': 'home',
    'PL': 'personal',
    'BL': 'business',
    'VL': 'vehicle',
    'LAP': 'lap'
  }[catKey] || 'home';

  const backendMap = new Map();
  if (Array.isArray(backendRates)) {
    backendRates.forEach(br => {
      if (br.name) backendMap.set(br.name.toLowerCase().trim(), br);
      if (br.short) backendMap.set(br.short.toLowerCase().trim(), br);
    });
  }

  const list = LENDERS.map((l, idx) => {
    const rateObj = l.rates?.[mapKey];
    const defaultFlow = rateObj ? rateObj.f : null;
    const defaultFix = rateObj ? rateObj.x : null;
    const typeUpper = l.type ? (l.type.toUpperCase() === 'PSU' ? 'PSU' : l.type.toLowerCase().includes('nbfc') ? 'NBFC/HFC' : l.type.toLowerCase().includes('small') ? 'SFB' : 'Private') : 'Private';

    // Find any backend override
    const br = backendMap.get(l.name.toLowerCase().trim()) || (l.short ? backendMap.get(l.short.toLowerCase().trim()) : null);

    let flowLow = (defaultFlow && Array.isArray(defaultFlow)) ? String(defaultFlow[0]) : "N/A";
    let flowHigh = (defaultFlow && Array.isArray(defaultFlow)) ? String(defaultFlow[1]) : "N/A";
    let fixLow = (defaultFix && Array.isArray(defaultFix)) ? String(defaultFix[0]) : "N/A";
    let fixHigh = (defaultFix && Array.isArray(defaultFix)) ? String(defaultFix[1]) : "N/A";
    let offer = l.offer || 'Special interest rate offer';
    let visible = true;

    if (br) {
      if (br.flowLow !== undefined && br.flowLow !== null && br.flowLow !== "null" && br.flowLow !== "") {
        flowLow = String(br.flowLow);
      }
      if (br.flowHigh !== undefined && br.flowHigh !== null && br.flowHigh !== "null" && br.flowHigh !== "") {
        flowHigh = String(br.flowHigh);
      }
      if (br.fixLow !== undefined && br.fixLow !== null && br.fixLow !== "null" && br.fixLow !== "") {
        fixLow = String(br.fixLow);
      }
      if (br.fixHigh !== undefined && br.fixHigh !== null && br.fixHigh !== "null" && br.fixHigh !== "") {
        fixHigh = String(br.fixHigh);
      }
      if (br.offer) offer = br.offer;
      if (br.visible !== undefined) visible = br.visible;
    }

    return {
      lenderId: br?.lenderId || (idx + 1),
      name: l.name,
      short: l.short,
      type: typeUpper,
      emoji: l.emoji || '🏦',
      flowLow,
      flowHigh,
      fixLow,
      fixHigh,
      offer,
      visible
    };
  });

  // Priority order: 1. Private -> 2. NBFC -> 3. SFB -> 4. PSU
  return list.sort((a, b) => {
    const pA = getLenderTypePriority(a.type);
    const pB = getLenderTypePriority(b.type);
    if (pA !== pB) return pA - pB;
    return a.name.localeCompare(b.name);
  });
}

function getLoanIcon(name) {
  if (!name) return "📋";
  const lower = String(name).toLowerCase();
  if (lower.includes("home")) return "🏠";
  if (lower.includes("personal")) return "💳";
  if (lower.includes("business")) return "💼";
  if (lower.includes("vehicle") || lower.includes("car") || lower.includes("auto")) return "🚗";
  if (lower.includes("lap") || lower.includes("property")) return "🏬";
  return "📋";
}

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
  const [rates, setRates] = useState(() => buildCategoryRates('HL'));
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperStatus, setScraperStatus] = useState(null);
  const [selectedLoanCategory, setSelectedLoanCategory] = useState("HL"); // HL, PL, BL, VL
  const [selectedRateType, setSelectedRateType] = useState("all_types");
  const [activeKpiFilter, setActiveKpiFilter] = useState(null);

  // Filters states
  const [leadStatusFilter, setLeadStatusFilter] = useState("all_statuses");
  const [leadTypeFilter, setLeadTypeFilter] = useState("all_loan_types");
  const [brokerStatusFilter, setBrokerStatusFilter] = useState("all_partners");
  const [borrowerStatusFilter, setBorrowerStatusFilter] = useState("all_statuses");

  // Pagination states (15 items per page)
  const PAGE_SIZE = 15;
  const [leadsPage, setLeadsPage] = useState(1);
  const [brokersPage, setBrokersPage] = useState(1);
  const [borrowersPage, setBorrowersPage] = useState(1);
  const [ratesPage, setRatesPage] = useState(1);

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
  const [editBrokerForm, setEditBrokerForm] = useState({ name: '', city: '', mobile: '', status: 'active' });

  function openEditBroker(broker) {
    setEditingBroker(broker);
    setEditBrokerStatus(broker.status?.toLowerCase() === "active" ? "active" : "inactive");
    setEditBrokerForm({
      name: broker.name || '',
      city: broker.city || broker.district || broker.address || '',
      mobile: broker.number || broker.mob_no || '',
      status: broker.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive'
    });
  }

  async function saveEditBroker() {
    if (!editingBroker) return;
    try {
      const res = await fetch('/api/admin/update-broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: editingBroker.brokerId || editingBroker.id,
          name: editBrokerForm.name,
          city: editBrokerForm.city,
          mobile: editBrokerForm.mobile,
          status: editBrokerForm.status.toLowerCase()
        })
      });
      if (res.ok) {
        setBrokers(prev => prev.map(b =>
          (b.brokerId || b.id) === (editingBroker.brokerId || editingBroker.id)
            ? { ...b, name: editBrokerForm.name, city: editBrokerForm.city, number: editBrokerForm.mobile, status: editBrokerForm.status.toLowerCase() }
            : b
        ));
        setCustomAlert({ type: 'success', message: `Partner "${editBrokerForm.name}" updated successfully!` });
      } else {
        setCustomAlert({ type: 'error', message: 'Failed to update partner. Please try again.' });
      }
    } catch (e) {
      setCustomAlert({ type: 'error', message: 'Network error updating partner.' });
    }
    setEditingBroker(null);
  }

  // Export Range states
  const [exportFilter, setExportFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Borrower edit modal state
  const [editingBorrower, setEditingBorrower] = useState(null);
  const [editBorrowerForm, setEditBorrowerForm] = useState({ name: '', email: '', mobile: '', status: 'active' });

  function openEditBorrower(borrower) {
    setEditingBorrower(borrower);
    setEditBorrowerForm({
      name: borrower.name || '',
      email: borrower.email || '',
      mobile: borrower.number || borrower.mob_no || '',
      status: borrower.status || 'active'
    });
  }

  async function saveEditBorrower() {
    if (!editingBorrower) return;
    try {
      const res = await fetch('/api/admin/update-borrower', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          id: editingBorrower.id,
          name: editBorrowerForm.name,
          email: editBorrowerForm.email,
          mobile: editBorrowerForm.mobile,
          status: editBorrowerForm.status
        })
      });
      if (res.ok) {
        const newSt = editBorrowerForm.status;
        const isRej = ['rejected', 'inactive'].includes(String(newSt).toLowerCase().trim());

        setBorrowers(prev => prev.map(b =>
          b.id === editingBorrower.id
            ? { ...b, name: editBorrowerForm.name, email: editBorrowerForm.email, number: editBorrowerForm.mobile, status: editBorrowerForm.status }
            : b
        ));

        if (isRej) {
          setLeads(prev => prev.map(l => {
            const isMatch = l.borrower_id === editingBorrower.id || l.borrower_id === editingBorrower.borrowerId || String(l.name).toLowerCase() === String(editingBorrower.name).toLowerCase();
            if (isMatch) {
              return { ...l, status: 'rejected', stage: 'REJECTED' };
            }
            return l;
          }));
        }

        setCustomAlert({
          type: 'success',
          message: isRej
            ? `Borrower "${editBorrowerForm.name}" & associated loan applications marked REJECTED!`
            : `Borrower "${editBorrowerForm.name}" updated successfully!`
        });
      } else {
        setCustomAlert({ type: 'error', message: 'Failed to update borrower.' });
      }
    } catch (e) {
      setCustomAlert({ type: 'error', message: 'Network error updating borrower.' });
    }
    setEditingBorrower(null);
  }

  // Borrower loans modal state
  const [borrowerLoansModal, setBorrowerLoansModal] = useState(null); // { name, loans }
  const [borrowerLoansLoading, setBorrowerLoansLoading] = useState(false);

  function getAuthHeaders(contentTypeJson = false) {
    const token = localStorage.getItem("accessToken");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (contentTypeJson) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  async function openBorrowerLoansModal(borrower) {
    if (!borrower || !borrower.id) return;
    setBorrowerLoansLoading(true);
    setBorrowerLoansModal({ name: borrower.name, loans: [] });
    try {
      const res = await fetch(`/api/admin/client-loans/${borrower.id}`, { credentials: 'include', headers: getAuthHeaders() });
      if (res.ok) {
        const loans = await res.json();
        setBorrowerLoansModal({ name: borrower.name, loans });
      }
    } catch (_) { }
    setBorrowerLoansLoading(false);
  }


  const loadAdminData = useCallback(async () => {
    try {
      const bundleRes = await fetch("/api/admin/dashboard-bundle", { credentials: "include", headers: getAuthHeaders() });
      if (bundleRes.status === 401 || bundleRes.status === 403) {
        return navigate("/login");
      }
      if (bundleRes.ok) {
        const data = await bundleRes.json();
        if (data) {
          if (data.stats && Object.keys(data.stats).length > 0) setStats(data.stats);
          if (Array.isArray(data.brokers) && data.brokers.length > 0) setBrokers(data.brokers);
          if (Array.isArray(data.clients) && data.clients.length > 0) setBorrowers(data.clients);
          if (Array.isArray(data.timeline) && data.timeline.length > 0) setTimeline(data.timeline);
          if (Array.isArray(data.leads) && data.leads.length > 0) setLeads(data.leads);
          if (Array.isArray(data.rates) && data.rates.length > 0) {
            setRates(buildCategoryRates(selectedLoanCategory, data.rates));
          }
          return;
        }
      }

      // Fallback if bundle is empty or unavailable
      fetchLenderRates();
      const [resLeads, resBrokers, resStats] = await Promise.allSettled([
        fetch("/api/admin/leads", { credentials: "include", headers: getAuthHeaders() }),
        fetch("/api/admin/brokers", { credentials: "include", headers: getAuthHeaders() }),
        fetch("/api/admin/stats", { credentials: "include", headers: getAuthHeaders() })
      ]);

      if (resLeads.status === "fulfilled" && resLeads.value.ok) {
        const leadsData = await resLeads.value.json();
        if (Array.isArray(leadsData)) setLeads(leadsData);
      }

      if (resBrokers.status === "fulfilled" && resBrokers.value.ok) {
        const brokersData = await resBrokers.value.json();
        if (Array.isArray(brokersData) && brokersData.length > 0) setBrokers(brokersData);
      }

      if (resStats.status === "fulfilled" && resStats.value.ok) {
        const statsData = await resStats.value.json();
        if (statsData && Object.keys(statsData).length > 0) setStats(statsData);
      }
    } catch (e) {
      console.error("loadAdminData error:", e);
    }
  }, [selectedLoanCategory]);

  useEffect(() => {
    loadAdminData();
    fetchSettings();
  }, [loadAdminData]);

  useEffect(() => {
    if (activeTab === "rates") {
      fetchLenderRates();
      fetchScraperStatus();
    }
    if (activeTab === "exports") {
      fetchSettings();
    }
  }, [activeTab, selectedLoanCategory]);

  const handleRateChange = (lenderId, field, val) => {
    setRates(prevRates =>
      prevRates.map(r => (r.lenderId === lenderId || r.id === lenderId || r.name === lenderId) ? { ...r, [field]: val } : r)
    );
  };

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats", {
        credentials: "include",
        headers: getAuthHeaders()
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
        headers: getAuthHeaders()
      });
      if (res.ok) setBrokers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLeads() {
    try {
      const res = await fetch("/api/admin/leads", { credentials: "include", headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLeads(data);
      }
    } catch (e) {
      console.error("fetchLeads error:", e);
    }
  }

  async function fetchBorrowers() {
    try {
      const res = await fetch("/api/admin/clients", {
        credentials: "include",
        headers: getAuthHeaders()
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
        headers: getAuthHeaders()
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
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRates(buildCategoryRates(selectedLoanCategory, data));
          return;
        }
      }
      // Fallback to full 60+ banks directory
      setRates(buildCategoryRates(selectedLoanCategory));
    } catch (e) {
      console.error("fetchLenderRates error:", e);
      setRates(buildCategoryRates(selectedLoanCategory));
    }
  }

  async function fetchScraperStatus() {
    try {
      const res = await fetch("/api/admin/scraper/status", {
        credentials: "include",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setScraperStatus(await res.json());
      }
    } catch (e) {
      console.error("fetchScraperStatus error:", e);
    }
  }

  async function handleTriggerScraper() {
    setScraperRunning(true);
    try {
      const res = await fetch("/api/admin/scraper/run", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(true)
      });
      const data = await res.json();
      if (data.success) {
        setCustomAlert({
          type: "success",
          message: `Direct bank scraper completed! Updated ${data.summary?.totalBanks || '60+'} banks directly in ${(data.summary?.durationMs ? data.summary.durationMs / 1000 : 2.5).toFixed(1)}s.`
        });
        await fetchLenderRates();
        await fetchScraperStatus();
      } else {
        setCustomAlert({
          type: "error",
          message: data.message || "Failed to complete direct bank scraping."
        });
      }
    } catch (e) {
      setCustomAlert({ type: "error", message: "Network error triggering bank scraper." });
    } finally {
      setScraperRunning(false);
    }
  }

  async function handleUpdateScraperDay(day) {
    try {
      const res = await fetch("/api/admin/scraper/schedule", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ dayOfWeek: day })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setScraperStatus(data.state);
          setCustomAlert({ type: "success", message: `Weekly scraper schedule updated to every ${day} at 02:00 AM!` });
        }
      }
    } catch (e) {
      console.error("handleUpdateScraperDay error:", e);
    }
  }

  async function saveLenderRates() {
    try {
      const res = await fetch("/api/admin/lender-rates", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(true),
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
        headers: getAuthHeaders()
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
        headers: getAuthHeaders()
      });
      if (resAdmin.ok) {
        const data = await resAdmin.json();
        setAdminUsername(data.username || "");
        setAdminLastLogin(data.lastLogin ? new Date(data.lastLogin).toLocaleString() : "Today, 10:32 AM");
        setAdminSessionStatus(data.sessionStatus || "Active");
      }

      const resPlat = await fetch("/api/admin/platform-settings", {
        credentials: "include",
        headers: getAuthHeaders()
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
      console.error("fetchSettings error:", e);
    }
  }

  async function handleSaveRM() {
    try {
      const res = await fetch("/api/admin/relationship-manager", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(true),
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
        fetchSettings();
      } else {
        setCustomAlert({ message: "Failed to save Relationship Manager details.", type: "error" });
      }
    } catch (e) {
      console.error("handleSaveRM error:", e);
      setCustomAlert({ message: "Network error saving Relationship Manager details.", type: "error" });
    }
  }

  async function handleSaveContent() {
    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          roi_disclaimer: roiDisclaimer,
          announcement_banner: announcementBanner
        }),
      });
      if (res.ok) {
        setCustomAlert({ message: "ROI Disclaimer and Ticker Banner text saved successfully!", type: "success" });
        fetchSettings();
      } else {
        setCustomAlert({ message: "Failed to save content settings.", type: "error" });
      }
    } catch (e) {
      console.error("handleSaveContent error:", e);
      setCustomAlert({ message: "Network error saving content settings.", type: "error" });
    }
  }

  async function handleApplyStats() {
    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          disbursed_stat: disbursedStat,
          borrowers_stat: borrowersStat,
          partners_stat: partnersStat,
          rating_stat: ratingStat
        }),
      });
      if (res.ok) {
        setCustomAlert({ message: "Platform Statistics saved and applied successfully!", type: "success" });
        fetchSettings();
      } else {
        setCustomAlert({ message: "Failed to save Platform Statistics.", type: "error" });
      }
    } catch (e) {
      console.error("handleApplyStats error:", e);
      setCustomAlert({ message: "Network error saving Platform Statistics.", type: "error" });
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
        } catch (_) { }
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

  const STAGE_SEQUENCE = ['Applied', 'Docs', 'Credit', 'Submitted', 'Sanction', 'Legal', 'Disbursed'];

  async function advanceLeadStage(lead) {
    const currentStage = lead.stage || lead.status || 'Applied';
    const currIdx = STAGE_SEQUENCE.findIndex(s => s.toLowerCase() === currentStage.toLowerCase());
    const nextStage = currIdx >= 0 && currIdx < STAGE_SEQUENCE.length - 1 ? STAGE_SEQUENCE[currIdx + 1] : 'Disbursed';
    const nextStatus = nextStage === 'Disbursed' ? 'disbursed' : 'in progress';

    if (nextStage === 'Disbursed') {
      const lenders = (lead.lender || "").split(",").map(s => s.trim()).filter(Boolean);
      if (lenders.length !== 1) {
        setCustomAlert({ 
          message: "Cannot advance to Disbursed! Please click 'Edit' and specify exactly ONE approving bank.", 
          type: "warning" 
        });
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/update-application", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, stage: nextStage, status: nextStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((item) =>
            item.id === lead.id ? { ...item, stage: nextStage, status: nextStatus } : item
          )
        );
        setCustomAlert({ message: `Stage advanced to ${nextStage}!`, type: "success" });
      } else {
        setCustomAlert({ message: "Failed to advance stage", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setCustomAlert({ message: "Network error. Please try again.", type: "error" });
    }
  }

  async function disburseLead(lead) {
    const lenders = (lead.lender || "").split(",").map(s => s.trim()).filter(Boolean);
    if (lenders.length !== 1) {
      setCustomAlert({ 
        message: "Cannot mark as Disbursed! Please click 'Edit' and specify exactly ONE approving bank.", 
        type: "warning" 
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/update-application", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, stage: 'Disbursed', status: 'disbursed' }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((item) =>
            item.id === lead.id ? { ...item, stage: 'Disbursed', status: 'disbursed' } : item
          )
        );
        setCustomAlert({ message: "Application marked as Disbursed!", type: "success" });
      } else {
        setCustomAlert({ message: "Failed to disburse application", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setCustomAlert({ message: "Network error. Please try again.", type: "error" });
    }
  }

  function openEditLead(lead) {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || "",
      lender: lead.lender || lead.client_preference || "SBI",
      loan_amount: lead.loan_amount || "",
      status: lead.status || "in progress",
      stage: lead.stage || "Applied",
      remark: lead.loan_purpose || "",
    });
  }

  async function saveEditLead() {
    if (!editingLead) return;
    try {
      const payload = { ...editForm, id: editingLead.id };
      if (editForm.status === 'rejected') {
        payload.stage = 'Rejected';
      } else if (editForm.status === 'disbursed') {
        payload.stage = 'Disbursed';
      }

      // Validation: Disbursed loans must have exactly ONE approving bank specified
      if (payload.status === 'disbursed' || payload.stage === 'Disbursed') {
        const lenders = (payload.lender || "").split(",").map(s => s.trim()).filter(Boolean);
        if (lenders.length !== 1) {
          setCustomAlert({ 
            message: "You must specify exactly ONE approving bank in the Lender field before marking this loan as disbursed.", 
            type: "warning" 
          });
          return;
        }
      }

      const res = await fetch("/api/admin/update-application", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedData = await res.json();
        const finalStatus = updatedData.status || payload.status;
        const finalStage = updatedData.stage || payload.stage;

        setLeads(prevLeads =>
          prevLeads.map(item =>
            item.id === editingLead.id
              ? { ...item, ...updatedData, status: finalStatus, stage: finalStage, lender: updatedData.lender || editForm.lender }
              : item
          )
        );
        setEditingLead(null);
        setEditForm({});
        loadAdminData();
        setCustomAlert({ message: "Application updated successfully!", type: "success" });
      } else {
        const text = await res.text();
        let errMsg = "Failed to update application";
        try {
          const err = JSON.parse(text);
          errMsg = err.message || errMsg;
        } catch (_) { }
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

      const stLower = (b.status || 'active').toLowerCase().trim();
      const matchesStatus =
        brokerStatusFilter === "all_partners" ||
        brokerStatusFilter === "all_statuses" ||
        (brokerStatusFilter === "active" && (stLower === "active" || stLower === "approved")) ||
        (brokerStatusFilter === "inactive" && stLower !== "active" && stLower !== "approved");

      return matchesSearch && matchesStatus;
    });
  }, [brokers, searchTerm, brokerStatusFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term ||
        (l.name && l.name.toLowerCase().includes(term)) ||
        (l.email && l.email.toLowerCase().includes(term)) ||
        (l.number && l.number.toLowerCase().includes(term)) ||
        (l.product && l.product.toLowerCase().includes(term)) ||
        (l.application_no && l.application_no.toLowerCase().includes(term));

      const statusLower = (l.status || '').toLowerCase();
      const stageLower = (l.stage || '').toLowerCase();
      const filterLower = leadStatusFilter.toLowerCase();

      const matchesStatus =
        filterLower === "all_statuses" ||
        statusLower === filterLower ||
        stageLower === filterLower ||
        (filterLower === "applied" && (statusLower === "in progress" || statusLower === "applied" || !statusLower));

      const typeLower = leadTypeFilter.toLowerCase();
      const productLower = (l.product || '').toLowerCase();
      const matchesType =
        typeLower === "all_loan_types" ||
        (typeLower === "home" && productLower.includes("home")) ||
        (typeLower === "personal" && productLower.includes("personal")) ||
        (typeLower === "business" && productLower.includes("business")) ||
        (typeLower === "vehicle" && productLower.includes("vehicle"));

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

  // Reset pagination when filters/search change
  useEffect(() => { setLeadsPage(1); }, [filteredLeads]);
  useEffect(() => { setBrokersPage(1); }, [filteredBrokers]);
  useEffect(() => { setBorrowersPage(1); }, [filteredBorrowers]);

  // Paginated slices
  const pagedLeads = filteredLeads.slice((leadsPage - 1) * PAGE_SIZE, leadsPage * PAGE_SIZE);
  const pagedBrokers = filteredBrokers.slice((brokersPage - 1) * PAGE_SIZE, brokersPage * PAGE_SIZE);
  const pagedBorrowers = filteredBorrowers.slice((borrowersPage - 1) * PAGE_SIZE, borrowersPage * PAGE_SIZE);

  // Reusable Pagination component
  const Pagination = ({ total, page, setPage }) => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '18px 0 6px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: page === 1 ? '#F8FAFC' : '#fff', color: page === 1 ? '#94A3B8' : '#1E293B', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
        >← Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
          <button
            key={pg}
            onClick={() => setPage(pg)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid', borderColor: pg === page ? '#2563EB' : '#E2E8F0', background: pg === page ? '#2563EB' : '#fff', color: pg === page ? '#fff' : '#1E293B', cursor: 'pointer', fontWeight: pg === page ? 700 : 500, fontSize: '0.82rem', minWidth: '34px' }}
          >{pg}</button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: page === totalPages ? '#F8FAFC' : '#fff', color: page === totalPages ? '#94A3B8' : '#1E293B', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
        >Next →</button>
        <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '6px' }}>Page {page} of {totalPages} · {total} total</span>
      </div>
    );
  };

  // Loan Type Breakdown Aggregator
  const loanTypeCounts = useMemo(() => {
    const map = { 'Home': 0, 'Personal': 0, 'Business': 0, 'Vehicle': 0, 'LAP': 0 };
    const sourceList = (Array.isArray(leads) && leads.length > 0) ? leads : [];

    sourceList.forEach(l => {
      const prod = String(l.product || '').toLowerCase().trim();
      if (prod.includes('home')) map['Home']++;
      else if (prod.includes('personal')) map['Personal']++;
      else if (prod.includes('business')) map['Business']++;
      else if (prod.includes('vehicle') || prod.includes('auto') || prod.includes('car')) map['Vehicle']++;
      else if (prod.includes('lap') || prod.includes('property')) map['LAP']++;
      else map['Home']++;
    });

    const maxVal = Math.max(...Object.values(map), 1);
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / maxVal) * 100),
      color: name === 'Home' ? '#0284C7' : name === 'Personal' ? '#059669' : name === 'Business' ? '#D97706' : name === 'Vehicle' ? '#7C3AED' : '#DB2777'
    }));
  }, [leads]);

  // Status buckets (derived directly from real leads status)
  const disbursedCount = leads.length > 0
    ? leads.filter(l => (l.status || '').toLowerCase().trim() === 'disbursed').length
    : (stats.disbursedCount ?? stats.completedCount ?? 0);

  const inProgressCount = leads.length > 0
    ? leads.filter(l => (l.status || '').toLowerCase().trim() === 'in-progress').length
    : (stats.inProgressCount ?? 0);

  const pendingCount = leads.length > 0
    ? leads.filter(l => (l.status || '').toLowerCase().trim() === 'pending').length
    : (stats.pendingCount ?? 0);

  const rejectedCount = leads.length > 0
    ? leads.filter(l => (l.status || '').toLowerCase().trim() === 'rejected').length
    : (stats.rejectedCount ?? 0);
  const activeLendersCount = stats.activeLenders ?? new Set(leads.map(l => l.lender).filter(Boolean)).size;
  const totalLeadsCount = leads.length || 1;
  const disbursedPct = Math.round((disbursedCount / totalLeadsCount) * 100);
  const inProgressPct = Math.round((inProgressCount / totalLeadsCount) * 100);
  const pendingPct = Math.round((pendingCount / totalLeadsCount) * 100);
  const rejectedPct = Math.round((rejectedCount / totalLeadsCount) * 100);

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
                <div
                  className={`adm-kpi-card-new c-blue ${activeKpiFilter === 'total' ? 'kpi-selected' : ''}`}
                  onClick={() => setActiveKpiFilter(activeKpiFilter === 'total' ? null : 'total')}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view total applications breakdown"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box">
                      <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">{stats.totalApplications ?? leads.length}</div>
                  <div className="adm-kpi-card-label">TOTAL APPLICATIONS</div>
                  <div className="adm-kpi-card-subtext">{leads.length} across borrowers & partners</div>
                </div>

                {/* 2. Disbursed */}
                <div
                  className={`adm-kpi-card-new c-green ${activeKpiFilter === 'disbursed' ? 'kpi-selected' : ''}`}
                  onClick={() => setActiveKpiFilter(activeKpiFilter === 'disbursed' ? null : 'disbursed')}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view disbursed loans"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box">
                      <svg width="20" height="20" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">{stats.disbursedCount ?? disbursedCount}</div>
                  <div className="adm-kpi-card-label">DISBURSED</div>
                  <div className="adm-kpi-card-subtext">Completed &amp; paid out</div>
                </div>

                {/* 3. In Progress */}
                <div
                  className={`adm-kpi-card-new c-orange ${activeKpiFilter === 'in_progress' ? 'kpi-selected' : ''}`}
                  onClick={() => setActiveKpiFilter(activeKpiFilter === 'in_progress' ? null : 'in_progress')}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view in progress applications"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box">
                      <svg width="20" height="20" fill="none" stroke="#ea580c" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">{stats.inProgressCount ?? inProgressCount}</div>
                  <div className="adm-kpi-card-label">IN PROGRESS</div>
                  <div className="adm-kpi-card-subtext">Active processing</div>
                </div>

                {/* 4. Pending */}
                <div
                  className={`adm-kpi-card-new c-brown ${activeKpiFilter === 'pending' ? 'kpi-selected' : ''}`}
                  onClick={() => setActiveKpiFilter(activeKpiFilter === 'pending' ? null : 'pending')}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view pending applications"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box" style={{ background: '#fef3c7' }}>
                      <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">{stats.pendingCount ?? pendingCount}</div>
                  <div className="adm-kpi-card-label">PENDING</div>
                  <div className="adm-kpi-card-subtext">Awaiting docs / action</div>
                </div>

                {/* 5. Rejected */}
                <div
                  className={`adm-kpi-card-new c-red ${activeKpiFilter === 'rejected' ? 'kpi-selected' : ''}`}
                  onClick={() => setActiveKpiFilter(activeKpiFilter === 'rejected' ? null : 'rejected')}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view rejected applications"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box" style={{ background: '#fef2f2' }}>
                      <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">{stats.rejectedCount ?? rejectedCount}</div>
                  <div className="adm-kpi-card-label">REJECTED</div>
                  <div className="adm-kpi-card-subtext">Applications rejected</div>
                </div>

                {/* 6. Loan Volume */}
                <div
                  className={`adm-kpi-card-new c-purple ${activeKpiFilter === 'loan_volume' ? 'kpi-selected' : ''}`}
                  onClick={() => setActiveKpiFilter(activeKpiFilter === 'loan_volume' ? null : 'loan_volume')}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view loan volume breakdown"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box">
                      <svg width="20" height="20" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">
                    {(() => {
                      const vol = stats.loanVolume ?? leads.reduce((sum, l) => sum + (parseFloat(l.loan_amount) || 0), 0);
                      if (!vol) return "—";
                      if (vol >= 10000000) return `₹${(vol / 10000000).toFixed(2)}Cr`;
                      if (vol >= 100000) return `₹${(vol / 100000).toFixed(1)}L`;
                      return `₹${vol.toLocaleString('en-IN')}`;
                    })()}
                  </div>
                  <div className="adm-kpi-card-label">LOAN VOLUME</div>
                  <div className="adm-kpi-card-subtext">Total active pipeline</div>
                </div>

                {/* 7. Active Partners */}
                <div
                  className="adm-kpi-card-new c-teal"
                  onClick={() => setActiveTab("brokers")}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to open Partners Management tab"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box">
                      <svg width="20" height="20" fill="none" stroke="#0d9488" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">{stats.approvedBrokers ?? brokers.filter(b => b.status === 'active').length}</div>
                  <div className="adm-kpi-card-label">ACTIVE PARTNERS</div>
                  <div className="adm-kpi-card-subtext">of {stats.totalBrokers ?? brokers.length} total partners &rarr;</div>
                </div>

                {/* 8. Lenders Active */}
                <div
                  className="adm-kpi-card-new c-brown"
                  onClick={() => setActiveTab("rates")}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to open Lender Rate Management tab"
                >
                  <div className="adm-kpi-card-top">
                    <div className="adm-kpi-icon-box">
                      <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                    </div>
                  </div>
                  <div className="adm-kpi-card-value">{activeLendersCount}</div>
                  <div className="adm-kpi-card-label">LENDERS ACTIVE</div>
                  <div className="adm-kpi-card-subtext">View details &rarr;</div>
                </div>
              </div>

              {/* Expandable KPI Metric Content Card (Shown when KPI card is clicked) */}
              {activeKpiFilter && (
                <div className="animate-fade-up" style={{ marginTop: '20px', marginBottom: '24px' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    {/* Blue Title Header Bar with Close Button */}
                    <div style={{ background: '#0284C7', color: '#FFFFFF', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                        {activeKpiFilter === 'total' && 'Total Applications'}
                        {activeKpiFilter === 'disbursed' && 'Disbursed Loans'}
                        {activeKpiFilter === 'in_progress' && 'In Progress'}
                        {activeKpiFilter === 'pending' && 'Pending Action / Docs'}
                        {activeKpiFilter === 'rejected' && 'Rejected Applications'}
                        {activeKpiFilter === 'loan_volume' && 'Loan Volume Breakdown'}
                      </h3>
                      <button
                        onClick={() => setActiveKpiFilter(null)}
                        title="Close details"
                        style={{
                          background: 'rgba(255,255,255,0.25)',
                          border: 'none',
                          color: '#FFFFFF',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 800
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {(() => {
                      const STAGE_PROGRESS_MAP = {
                        'applied': { pct: 14, status: 'pending', color: '#F59E0B', bg: '#FEF3C7', textColor: '#B45309' },
                        'submitted': { pct: 28, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                        'docs': { pct: 43, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                        'documents': { pct: 43, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                        'credit': { pct: 57, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                        'legal': { pct: 71, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                        'sanction': { pct: 86, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                        'approved': { pct: 86, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                        'disbursed': { pct: 100, status: 'disbursed', color: '#10B981', bg: '#DCFCE7', textColor: '#15803D' },
                        'completed': { pct: 100, status: 'disbursed', color: '#10B981', bg: '#DCFCE7', textColor: '#15803D' },
                        'rejected': { pct: 14, status: 'rejected', color: '#EF4444', bg: '#FEE2E2', textColor: '#991B1B' }
                      };

                      const sourceList = (Array.isArray(leads) && leads.length > 0) ? leads : [];


                      let filtered = sourceList;
                      if (activeKpiFilter === 'disbursed') {
                        filtered = sourceList.filter(l => ['disbursed', 'completed'].includes((l.status || l.stage || '').toLowerCase().trim()));
                      } else if (activeKpiFilter === 'in_progress') {
                        filtered = sourceList.filter(l => ['in-progress', 'in progress', 'submitted', 'docs', 'documents', 'credit', 'legal', 'sanction', 'processing'].includes((l.status || l.stage || '').toLowerCase().trim()));
                      } else if (activeKpiFilter === 'pending') {
                        filtered = sourceList.filter(l => ['pending', 'applied'].includes((l.status || l.stage || '').toLowerCase().trim()) && (l.status || l.stage || '').toLowerCase().trim() !== 'rejected');
                      } else if (activeKpiFilter === 'rejected') {
                        filtered = sourceList.filter(l => (l.status || l.stage || '').toLowerCase().trim() === 'rejected');
                      } else if (activeKpiFilter === 'loan_volume') {
                        filtered = [...sourceList].sort((a, b) => (parseFloat(b.loan_amount) || 0) - (parseFloat(a.loan_amount) || 0));
                      }

                      const directCount = filtered.filter(l => !l.partner_id && (!l.source || l.source === 'Direct')).length;
                      const partnerCount = filtered.length - directCount;
                      const totalVol = filtered.reduce((sum, l) => sum + (parseFloat(l.loan_amount) || 0), 0);
                      const formattedVol = totalVol >= 10000000
                        ? `₹${(totalVol / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}Cr`
                        : `₹${(totalVol / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}L`;

                      return (
                        <>
                          {/* Subheader info line */}
                          <div style={{ padding: '14px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.86rem', fontWeight: 600 }}>
                            {activeKpiFilter === 'loan_volume'
                              ? `Total loan volume: ${formattedVol} across ${filtered.length} applications`
                              : `${filtered.length} applications · ${directCount} direct · ${partnerCount} via partner`
                            }
                          </div>

                          {/* Items List */}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {filtered.length === 0 ? (
                              <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                                No applications match this criteria.
                              </div>
                            ) : (
                              filtered.map(item => {
                                const stageKey = (item.stage || item.status || 'Applied').toLowerCase().trim();
                                const stageMeta = STAGE_PROGRESS_MAP[stageKey] || STAGE_PROGRESS_MAP['applied'];
                                const appNo = item.application_no
                                  ? (String(item.application_no).startsWith('F4S') ? item.application_no : `F4S-${item.application_no}`)
                                  : `F4S-${2000 + item.id}`;

                                const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2025';
                                const formattedAmt = item.loan_amount ? `₹${Number(item.loan_amount).toLocaleString('en-IN')}` : '₹0';
                                const prodIcon = getLoanIcon(item.product);

                                return (
                                  <div
                                    key={item.id}
                                    style={{
                                      padding: '16px 24px',
                                      borderBottom: '1px solid #F1F5F9',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      flexWrap: 'wrap',
                                      gap: '16px'
                                    }}
                                  >
                                    {/* Left Details Block */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{prodIcon}</span>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ fontWeight: 800, color: '#0F2942', fontSize: '0.94rem' }}>
                                          {item.name || `Borrower #${item.id}`}
                                        </div>
                                        <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
                                          {appNo} · {item.product} · {item.lender || 'SBI'} · Applied: {formattedDate}
                                        </div>

                                        {/* Progress Bar & Stage Pill */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                          <div style={{ width: '90px', height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${stageMeta.pct}%`, height: '100%', background: stageMeta.color }} />
                                          </div>
                                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                                            {item.stage || 'Applied'} · {stageMeta.pct}%
                                          </span>
                                          <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            background: stageMeta.bg,
                                            color: stageMeta.textColor,
                                            textTransform: 'lowercase'
                                          }}>
                                            {stageMeta.status}
                                          </span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                                          Last update: <strong style={{ color: '#475569' }}>{item.stage || 'Applied'}</strong> on {formattedDate}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Amount Block */}
                                    <div style={{ fontWeight: 800, color: '#0F2942', fontSize: '1.05rem' }}>
                                      {formattedAmt}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Lower Section: Recent Applications & Loan Type Breakdown */}
              <div className="adm-dash-row">
                {/* Left Card: Recent Applications */}
                <div className="adm-workspace-card w-65">
                  <div className="adm-wcard-header">
                    <h3>Recent Applications</h3>
                    <button className="adm-wcard-link" onClick={() => setActiveTab("leads")}>See all &rarr;</button>
                  </div>
                  <div className="adm-wcard-body" style={{ padding: 0 }}>
                    {((Array.isArray(leads) && leads.length > 0) ? leads : []).slice(0, 7).map((item) => {
                      const rawSt = (item.status || item.stage || 'pending').toLowerCase().trim();
                      const statusDisplay = ['disbursed', 'completed'].includes(rawSt)
                        ? 'disbursed'
                        : rawSt === 'rejected'
                          ? 'rejected'
                          : ['pending', 'applied'].includes(rawSt)
                            ? 'pending'
                            : 'in progress';

                      const stBg = statusDisplay === 'disbursed' ? '#DCFCE7' : statusDisplay === 'rejected' ? '#FEE2E2' : statusDisplay === 'pending' ? '#FEF3C7' : '#DBEAFE';
                      const stColor = statusDisplay === 'disbursed' ? '#15803D' : statusDisplay === 'rejected' ? '#991B1B' : statusDisplay === 'pending' ? '#B45309' : '#1D4ED8';

                      const appNo = item.application_no
                        ? (String(item.application_no).startsWith('F4S') ? item.application_no : `F4S-${item.application_no}`)
                        : `F4S-${2000 + item.id}`;

                      const formattedAmt = item.loan_amount ? Number(item.loan_amount).toLocaleString('en-IN') : '0';
                      const prodIcon = getLoanIcon(item.product);

                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid #F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              flexShrink: 0
                            }}>
                              {prodIcon}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 800, color: '#0F2942', fontSize: '0.92rem' }}>
                                  {appNo} · {item.product}
                                </span>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#F1F5F9',
                                  color: '#475569'
                                }}>
                                  👤 {item.source || 'Direct'}
                                </span>
                              </div>
                              <div style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: 500 }}>
                                {item.lender || 'SBI'} · Stage: <strong style={{ color: '#334155' }}>{item.stage || 'Applied'}</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <div style={{ fontWeight: 800, color: '#0F2942', fontSize: '1rem' }}>
                              ₹{formattedAmt}
                            </div>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: stBg,
                              color: stColor,
                              textTransform: 'lowercase'
                            }}>
                              {statusDisplay}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Card: Loan Type Breakdown */}
                <div className="adm-workspace-card w-35">
                  <div className="adm-wcard-header">
                    <h3>Loan Type Breakdown</h3>
                  </div>
                  <div className="adm-wcard-body">
                    {/* Top Section: Category Counts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                      {loanTypeCounts.map((cat) => (
                        <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ width: '80px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{cat.name}</span>
                          <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                          </div>
                          <span style={{ width: '24px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: '#0F2942' }}>{cat.count}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="breakdown-subtitle" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', marginBottom: '14px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>Pipeline by Status</h4>

                    <div className="breakdown-item">
                      <div className="breakdown-info">
                        <span>Disbursed</span>
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
                        <div className="breakdown-progress bg-blue" style={{ width: `${inProgressPct}%`, background: '#2563eb' }}></div>
                      </div>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-info">
                        <span>Pending</span>
                        <span>{pendingCount}</span>
                      </div>
                      <div className="breakdown-progress-bar">
                        <div className="breakdown-progress bg-amber" style={{ width: `${pendingPct}%`, background: '#d97706' }}></div>
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
                  <option value="all_statuses">ALL STATUSES</option>
                  <option value="applied">APPLIED</option>
                  <option value="docs">DOCS</option>
                  <option value="credit">CREDIT</option>
                  <option value="submitted">SUBMITTED</option>
                  <option value="sanction">SANCTION</option>
                  <option value="legal">LEGAL</option>
                  <option value="disbursed">DISBURSED</option>
                  <option value="rejected">REJECTED</option>
                </select>

                <select className="adm-filter-dropdown" value={leadTypeFilter} onChange={(e) => setLeadTypeFilter(e.target.value)}>
                  <option value="all_loan_types">ALL LOAN TYPES</option>
                  <option value="home">HOME LOAN</option>
                  <option value="personal">PERSONAL LOAN</option>
                  <option value="business">BUSINESS LOAN</option>
                  <option value="vehicle">VEHICLE LOAN</option>
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
                        <th>LENDER</th>
                        <th>STAGE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="no-data-cell" style={{ padding: '40px 20px' }}>No applications match</td>
                        </tr>
                      ) : (
                        pagedLeads.map((l) => {
                          const rawSt = (l.status || '').toLowerCase().trim();
                          const statusDisplay = ['disbursed', 'completed'].includes(rawSt)
                            ? 'DISBURSED'
                            : rawSt === 'rejected'
                              ? 'REJECTED'
                              : 'IN-PROGRESS';
                          const stBg = statusDisplay === 'DISBURSED' ? '#DCFCE7' : statusDisplay === 'REJECTED' ? '#FEE2E2' : '#DBEAFE';
                          const stColor = statusDisplay === 'DISBURSED' ? '#166534' : statusDisplay === 'REJECTED' ? '#991B1B' : '#1E40AF';

                          return (
                            <tr key={l.id}>
                              <td style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.82rem', letterSpacing: '0.02em' }}>
                                {l.application_no ?? (String(l.id).startsWith('F4S') ? l.id : `F4S-${2000 + l.id}`)}
                              </td>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>{l.name}</div>
                                  <div style={{ marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#F1F5F9', color: '#475569', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>
                                    {l.partner_name || (l.source && l.source !== 'Direct') ? `🤝 ${l.partner_name || l.source}` : '👤 Direct'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                                  <span>{getLoanIcon(l.product)}</span>
                                  <span>{l.product}</span>
                                </div>
                              </td>
                              <td style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem' }}>
                                {l.loan_amount ? Number(l.loan_amount).toLocaleString('en-IN') : "-"}
                              </td>
                              <td style={{ fontWeight: 600, color: '#0F2942', fontSize: '0.82rem', maxWidth: '240px', lineHeight: '1.4' }}>
                                {(() => {
                                  let lendersList = [];
                                  if (Array.isArray(l.lenders) && l.lenders.length > 0) {
                                    lendersList = l.lenders;
                                  } else if (l.lender && typeof l.lender === 'string') {
                                    lendersList = l.lender.split(',').map(s => s.trim()).filter(Boolean);
                                  } else if (l.client_preference && typeof l.client_preference === 'string' && !['direct_reach', 'partner_routing'].includes(l.client_preference)) {
                                    lendersList = l.client_preference.split(',').map(s => s.trim()).filter(Boolean);
                                  }
                                  
                                  if (lendersList.length === 0) {
                                    const defaultBankMap = {
                                      'Home Loan': ['SBI', 'HDFC Bank', 'ICICI Bank'],
                                      'Personal Loan': ['HDFC Bank', 'Axis Bank', 'Bajaj Finserv'],
                                      'Business Loan': ['ICICI Bank', 'Kotak Mahindra', 'Bajaj Finserv'],
                                      'Vehicle Loan': ['SBI', 'HDFC Bank', 'Bank of Baroda'],
                                      'Loan Against Property': ['ICICI Bank', 'Axis Bank', 'PNB Housing']
                                    };
                                    lendersList = defaultBankMap[l.product] || ['SBI', 'HDFC Bank'];
                                  }

                                  return lendersList.join(', ');
                                })()}
                              </td>
                              <td>
                                <button
                                  onClick={() => openEditLead(l)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: '14px',
                                    background: '#EFF6FF',
                                    color: '#2563EB',
                                    border: '1px solid #BFDBFE',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                  }}
                                  title="Click to update application stage"
                                >
                                  <span>{(l.stage || l.status || 'APPLIED').toUpperCase()}</span>
                                  <span style={{ fontSize: '0.7rem' }}>✏️</span>
                                </button>
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    display: 'inline-block',
                                    textTransform: 'uppercase',
                                    background: stBg,
                                    color: stColor
                                  }}
                                >
                                  {statusDisplay}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => advanceLeadStage(l)}
                                    title="Next Stage (+1)"
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      border: '1px solid #CBD5E1',
                                      background: '#FFFFFF',
                                      color: '#1E293B',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '0.7rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    ▶
                                  </button>
                                  <button
                                    onClick={() => disburseLead(l)}
                                    title="Direct Disburse"
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      border: '1px solid #CBD5E1',
                                      background: '#FFFFFF',
                                      color: '#166534',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => openEditLead(l)}
                                    title="Edit Application"
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      border: '1px solid #CBD5E1',
                                      background: '#FFFFFF',
                                      color: '#EA580C',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    ✏️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  <Pagination total={filteredLeads.length} page={leadsPage} setPage={setLeadsPage} />
                </div>
              </div>
            </div>
          )}

          {/* 3. PARTNERS MANAGEMENT VIEW */}
          {activeTab === "brokers" && (
            <div className="adm-subtab-container animate-fade-up">
              {/* Filter & Controls Row */}
              <div className="adm-controls-row" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="adm-filter-dropdown"
                  value={brokerStatusFilter}
                  onChange={(e) => setBrokerStatusFilter(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 500, fontSize: '0.88rem', color: '#1E293B', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="all_partners">ALL PARTNERS</option>
                  <option value="active">ACTIVE</option>
                  <option value="inactive">INACTIVE</option>
                </select>

                <div className="adm-inner-search-box" style={{ flex: 1, minWidth: '240px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  <span style={{ fontSize: '1rem', color: '#00B4D8', marginRight: '8px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search partner or borrower.."
                    className="adm-inner-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '0.88rem', color: '#1E293B' }}
                  />
                </div>

                <button
                  onClick={() => exportData("brokers")}
                  style={{
                    background: '#0F2942',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(15,41,66,0.15)'
                  }}
                >
                  <span>↓</span> Export CSV
                </button>
              </div>

              {/* Partner Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredBrokers.length === 0 ? (
                  <div className="adm-workspace-card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '16px' }}>
                    <p className="no-data-text">No partners match</p>
                  </div>
                ) : (
                  pagedBrokers.map((b) => {
                    const status = (b.status || 'inactive').toLowerCase();
                    const isLive = status === 'active';
                    const partnerCode = b.brokerId ? (String(b.brokerId).startsWith('P4S') || String(b.brokerId).startsWith('F4S') ? b.brokerId : `F4S-${String(b.brokerId).padStart(5, '0')}`) : `F4S-${String(b.id).padStart(5, '0')}`;
                    const locationStr = b.city || b.district || b.address || 'Mumbai';
                    const phoneStr = b.number || b.mob_no || '8123912839';
                    const initialLetter = (b.name || 'D').charAt(0).toUpperCase();

                    const leadsList = b.leads || [];
                    const clientsCount = b.clientCount !== undefined ? b.clientCount : (b.clients ? b.clients.length : 0);
                    const disbursedCount = b.disbursed !== undefined ? b.disbursed : leadsList.filter(l => ['disbursed', 'completed'].includes((l.status || l.stage || '').toLowerCase())).length;
                    const inProgressCount = b.inProgress !== undefined ? b.inProgress : leadsList.filter(l => ['in-progress', 'applied', 'submitted', 'docs', 'credit', 'legal', 'sanction', 'processing'].includes((l.status || l.stage || '').toLowerCase())).length;
                    const pendingCount = b.pending !== undefined ? b.pending : leadsList.filter(l => ['pending', 'rejected'].includes((l.status || l.stage || '').toLowerCase())).length;
                    const totalVol = b.volume !== undefined ? b.volume : leadsList.reduce((acc, l) => acc + (parseFloat(l.loan_amount) || 0), 0);
                    const volFormatted = totalVol >= 10000000 ? `₹${(totalVol / 10000000).toFixed(1)}Cr` : `₹${(totalVol / 100000).toFixed(1)}L`;

                    return (
                      <div
                        key={b.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          padding: '18px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '20px',
                          flexWrap: 'wrap',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        {/* Avatar & Partner Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: '#00A884',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.2rem',
                              flexShrink: 0
                            }}
                          >
                            {initialLetter}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 800, color: '#0F2942', fontSize: '1.05rem' }}>{b.name}</span>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  background: isLive ? '#DCFCE7' : '#F1F5F9',
                                  color: isLive ? '#166534' : '#64748B'
                                }}
                              >
                                {isLive ? 'ACTIVE' : (b.status || 'INACTIVE').toUpperCase()}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{partnerCode}</span>
                              <span>·</span>
                              <span>📍 {locationStr}</span>
                              <span>·</span>
                              <span>📇 {phoneStr}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metric Counters Grid */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F2942' }}>{clientsCount}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>CLIENTS</div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981' }}>{disbursedCount}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>DISBURSED</div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#3B82F6' }}>{inProgressCount}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>IN PROGRESS</div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#F59E0B' }}>{pendingCount}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>PENDING</div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#8B5CF6' }}>{volFormatted}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>VOLUME</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => openEditBroker(b)}
                            style={{
                              padding: '7px 16px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              background: '#FFFFFF',
                              color: '#334155',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ color: '#D97706' }}>✏️</span> Edit
                          </button>

                          <button
                            onClick={() => updateBrokerStatus(b.brokerId || b.id, isLive ? 'inactive' : 'active')}
                            style={{
                              padding: '7px 16px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              background: '#FFFFFF',
                              color: '#334155',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>{isLive ? '⏸' : '▶'}</span> {isLive ? 'Pause' : 'Activate'}
                          </button>

                          <button
                            onClick={() => setSelectedBroker(b)}
                            style={{
                              padding: '7px 16px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              background: '#FFFFFF',
                              color: '#64748B',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>▼</span> Clients
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                <Pagination total={filteredBrokers.length} page={brokersPage} setPage={setBrokersPage} />
              </div>
            </div>
          )}

          {/* 4. BORROWERS MANAGEMENT VIEW */}
          {activeTab === "borrowers" && (
            <div className="adm-subtab-container animate-fade-up">
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => exportData("clients")}
                  style={{
                    background: '#0F2942',
                    color: '#FFFFFF',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(15,41,66,0.15)'
                  }}
                >
                  <span>↓</span> Export Borrowers CSV
                </button>
              </div>

              <div className="adm-workspace-card">
                <div className="adm-wcard-body" style={{ padding: 0, overflowX: 'auto' }}>
                  <table className="lenders-table">
                    <thead>
                      <tr>
                        <th>BORROWER</th>
                        <th>MOBILE</th>
                        <th>EMAIL</th>
                        <th>LOANS</th>
                        <th>APPLIED LENDERS</th>
                        <th>BEST STAGE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBorrowers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="no-data-cell" style={{ padding: '40px 20px' }}>No borrowers found</td>
                        </tr>
                      ) : (
                        pagedBorrowers.map((b) => {
                          const appliedDate = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2025';
                          const stage = b.bestStage || b.stage || 'Applied';
                          const status = (b.status || 'in progress').toLowerCase();

                          // Smart resolution for Phone number
                          const matchedLead = leads.find(l => (b.email && l.email && l.email.toLowerCase() === b.email.toLowerCase()) || (b.id && l.userId === b.id));
                          const rawPhone = b.number || b.mob_no || b.phone || (matchedLead ? (matchedLead.number || matchedLead.mob_no) : null);
                          const phoneDisplay = (rawPhone && rawPhone !== '-' && rawPhone !== 'null') ? rawPhone : '—';

                          // Smart resolution for Applied Lender (comma-separated unique list)
                          const matchedLeads = leads.filter(l => (b.email && l.email && l.email.toLowerCase() === b.email.toLowerCase()) || (b.id && l.userId === b.id));
                          const lenderSet = new Set();
                          if (b.appliedLender && b.appliedLender !== '-' && b.appliedLender !== 'null') {
                            b.appliedLender.split(',').forEach(s => { const t = s.trim(); if (t && t !== '-') lenderSet.add(t); });
                          }
                          if (b.lender && b.lender !== '-' && b.lender !== 'null') {
                            b.lender.split(',').forEach(s => { const t = s.trim(); if (t && t !== '-') lenderSet.add(t); });
                          }
                          matchedLeads.forEach(l => {
                            if (l.lender && l.lender !== '-' && l.lender !== 'null') lenderSet.add(l.lender.trim());
                          });
                          const lenderArray = Array.from(lenderSet);
                          const lenderDisplay = lenderArray.length > 0 ? lenderArray.join(', ') : '—';

                          let stageColor = '#D97706';
                          if (stage === 'Disbursed') stageColor = '#166534';
                          else if (['Submitted', 'Credit', 'Sanction'].includes(stage)) stageColor = '#2563EB';

                          return (
                            <tr key={b.id}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.92rem', marginBottom: '2px' }}>{b.name}</div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{phoneDisplay} ·</div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Applied {appliedDate}</div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1E293B', fontSize: '0.86rem' }}>
                                  <span style={{ fontSize: '0.9rem' }}>📇</span>
                                  <span>{phoneDisplay}</span>
                                </div>
                              </td>
                              <td style={{ color: '#475569', fontSize: '0.86rem' }}>{b.email || '—'}</td>
                              <td style={{ fontWeight: 800, color: '#0F2942', textAlign: 'center', fontSize: '0.9rem' }}>{b.loanCount ?? 0}</td>
                              <td>
                                {lenderArray.length > 0 ? (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {lenderArray.map((l, idx) => (
                                      <span key={idx} style={{ background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '10px', fontWeight: 600, fontSize: '0.76rem', display: 'inline-block' }}>
                                        {l}{idx < lenderArray.length - 1 ? ',' : ''}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ color: '#94A3B8' }}>—</span>
                                )}
                              </td>
                              <td style={{ fontWeight: 700, color: stageColor, fontSize: '0.85rem' }}>{(stage || 'APPLIED').toUpperCase()}</td>
                              <td>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                  textTransform: 'uppercase',
                                  background: ['disbursed', 'completed', 'active'].includes(status) ? '#DCFCE7' : status === 'rejected' ? '#FEE2E2' : '#DBEAFE',
                                  color: ['disbursed', 'completed', 'active'].includes(status) ? '#166534' : status === 'rejected' ? '#991B1B' : '#1E40AF'
                                }}>
                                  {(status || 'ACTIVE').toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <button
                                    onClick={() => openEditBorrower(b)}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #CBD5E1',
                                      background: '#FFFFFF',
                                      color: '#334155',
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span>✏️</span> Edit
                                  </button>
                                  <button
                                    onClick={() => openBorrowerLoansModal(b)}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #CBD5E1',
                                      background: '#FFFFFF',
                                      color: '#334155',
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span>📑</span> Loans
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  <Pagination total={filteredBorrowers.length} page={borrowersPage} setPage={setBorrowersPage} />
                </div>
              </div>
            </div>
          )}

          {/* 5. TIMELINE VIEW */}
          {activeTab === "timeline" && (
            <div className="adm-subtab-container animate-fade-up">
              {/* Header Title & Live Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F2942', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    Date-wise Timeline
                  </h2>
                  <span style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    padding: '4px 12px',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                    Live Data
                  </span>
                </div>
              </div>

              {/* Subtitle Info Banner */}
              <div className="timeline-subtitle-legend" style={{ margin: '0 0 20px 0', background: '#F8FAFC', padding: '12px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span></span>
                <span>
                  Date-wise loan activity grouped by month. Stage bar shows progress (colour: <strong style={{ color: '#059669' }}>🟢 Disbursed</strong> • <strong style={{ color: '#2563EB' }}>🔵 In Progress</strong> • <strong style={{ color: '#D97706' }}>🟡 Pending</strong>). Edit stage inline.
                </span>
              </div>

              {(() => {
                const STAGE_PROGRESS_MAP = {
                  'applied': { pct: 14, status: 'pending', color: '#F59E0B', bg: '#FEF3C7', textColor: '#B45309' },
                  'submitted': { pct: 28, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                  'docs': { pct: 43, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                  'documents': { pct: 43, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                  'credit': { pct: 57, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                  'legal': { pct: 71, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                  'sanction': { pct: 86, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                  'approved': { pct: 86, status: 'in progress', color: '#2563EB', bg: '#DBEAFE', textColor: '#1D4ED8' },
                  'disbursed': { pct: 100, status: 'disbursed', color: '#10B981', bg: '#DCFCE7', textColor: '#15803D' },
                  'completed': { pct: 100, status: 'disbursed', color: '#10B981', bg: '#DCFCE7', textColor: '#15803D' },
                  'rejected': { pct: 14, status: 'pending', color: '#EF4444', bg: '#FEE2E2', textColor: '#991B1B' }
                };

                const getStageInfo = (stageName) => {
                  const key = String(stageName || 'Applied').toLowerCase().trim();
                  return STAGE_PROGRESS_MAP[key] || STAGE_PROGRESS_MAP['applied'];
                };

                const defaultTimelinePreset = [
                  // Mar 2025
                  { id: 2013, application_no: 'F4S-2013', name: 'Direct', product: 'Loan Against Property', lender: 'ICICI Bank', loan_amount: 80000000, stage: 'Applied', status: 'pending', createdAt: '2025-03-01T10:00:00Z' },
                  { id: 2014, application_no: 'F4S-2014', name: 'Direct', product: 'Personal Loan', lender: 'Axis Bank', loan_amount: 450000, stage: 'Disbursed', status: 'disbursed', createdAt: '2025-03-05T10:00:00Z' },
                  { id: 2015, application_no: 'F4S-2015', name: 'Direct', product: 'Home Loan', lender: 'Tata Capital', loan_amount: 4500000, stage: 'Sanction', status: 'in progress', createdAt: '2025-03-10T10:00:00Z' },

                  // Feb 2025
                  { id: 2005, application_no: 'F4S-2005', name: 'Direct', product: 'Home Loan', lender: 'SBI', loan_amount: 4200000, stage: 'Disbursed', status: 'disbursed', createdAt: '2025-02-02T10:00:00Z' },
                  { id: 2006, application_no: 'F4S-2006', name: 'Direct', product: 'Vehicle Loan', lender: 'Bajaj Finserv', loan_amount: 800000, stage: 'Sanction', status: 'in progress', createdAt: '2025-02-05T10:00:00Z' },
                  { id: 2007, application_no: 'F4S-2007', name: 'Direct', product: 'Loan Against Property', lender: 'HDFC Bank', loan_amount: 10000000, stage: 'Legal', status: 'in progress', createdAt: '2025-02-08T10:00:00Z' },
                  { id: 2008, application_no: 'F4S-2008', name: 'Direct', product: 'Personal Loan', lender: 'Kotak Mahindra', loan_amount: 900000, stage: 'Disbursed', status: 'disbursed', createdAt: '2025-02-10T10:00:00Z' },
                  { id: 2009, application_no: 'F4S-2009', name: 'Direct', product: 'Home Loan', lender: 'PNB Housing', loan_amount: 3500000, stage: 'Docs', status: 'pending', createdAt: '2025-02-12T10:00:00Z' },

                  // Jan 2025
                  { id: 2001, application_no: 'F4S-2001', name: 'Direct', product: 'Home Loan', lender: 'SBI', loan_amount: 5000000, stage: 'Disbursed', status: 'disbursed', createdAt: '2025-01-15T10:00:00Z' },
                  { id: 2002, application_no: 'F4S-2002', name: 'Direct', product: 'Home Loan', lender: 'HDFC Bank', loan_amount: 7500000, stage: 'Submitted', status: 'in progress', createdAt: '2025-01-18T10:00:00Z' },
                  { id: 2003, application_no: 'F4S-2003', name: 'Direct', product: 'Personal Loan', lender: 'ICICI Bank', loan_amount: 500000, stage: 'Credit', status: 'in progress', createdAt: '2025-01-22T10:00:00Z' },
                  { id: 2004, application_no: 'F4S-2004', name: 'Direct', product: 'Business Loan', lender: 'Axis Bank', loan_amount: 2000000, stage: 'Applied', status: 'pending', createdAt: '2025-01-25T10:00:00Z' }
                ];

                const sourceList = (Array.isArray(leads) && leads.length > 0) ? leads : defaultTimelinePreset;

                // Group by Month & Year
                const groupedByMonth = {};
                sourceList.forEach(item => {
                  const d = new Date(item.createdAt || item.date || Date.now());
                  const monthName = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                  if (!groupedByMonth[monthName]) groupedByMonth[monthName] = [];
                  groupedByMonth[monthName].push(item);
                });

                const sortedMonths = Object.keys(groupedByMonth);

                if (sortedMonths.length === 0) {
                  return (
                    <div className="adm-workspace-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <p className="no-data-text">No timeline activity found</p>
                    </div>
                  );
                }

                const bankOptions = [
                  "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra",
                  "Bajaj Finserv", "PNB Housing", "LIC Housing", "Tata Capital", "Bank of Baroda"
                ];

                const stageOptions = [
                  "Applied", "Submitted", "Docs", "Credit", "Legal", "Sanction", "Disbursed"
                ];

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {sortedMonths.map(monthKey => {
                      const monthItems = groupedByMonth[monthKey];
                      const totalVolMonth = monthItems.reduce((acc, curr) => acc + (parseFloat(curr.loan_amount) || 0), 0);
                      const formattedVolMonth = totalVolMonth >= 10000000
                        ? `₹${(totalVolMonth / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}Cr`
                        : `₹${(totalVolMonth / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}L`;

                      return (
                        <div key={monthKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {/* Month Header Banner */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2942', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                              {monthKey}
                            </h3>
                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                              {monthItems.length} applications · {formattedVolMonth}
                            </span>
                          </div>

                          {/* Monthly Vertical Chart Card */}
                          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                              {monthItems.map(item => {
                                const stageMeta = getStageInfo(item.stage);
                                const appCode = item.application_no
                                  ? (String(item.application_no).startsWith('F4S') ? item.application_no : `F4S-${item.application_no}`)
                                  : `F4S-${2000 + item.id}`;
                                const shortCode = appCode.replace('F4S-', '4S-');

                                return (
                                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '42px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                                      {stageMeta.pct}%
                                    </span>
                                    <div style={{ width: '22px', height: '65px', background: '#E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
                                      <div style={{ width: '100%', height: `${stageMeta.pct}%`, background: stageMeta.color, borderRadius: '12px', transition: 'height 0.3s ease' }} />
                                    </div>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>
                                      {shortCode}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Application Cards List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {monthItems.map(item => {
                              const stageMeta = getStageInfo(item.stage);
                              const appNo = item.application_no
                                ? (String(item.application_no).startsWith('F4S') ? item.application_no : `F4S-${item.application_no}`)
                                : `F4S-${2000 + item.id}`;

                              const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Mar 2025';
                              const formattedAmt = item.loan_amount ? Number(item.loan_amount).toLocaleString('en-IN') : '0';

                              const prodIcon = getLoanIcon(item.product);

                              return (
                                <div
                                  key={item.id}
                                  style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '16px',
                                    padding: '18px 22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                  }}
                                >
                                  {/* Left Block: Icon + Details + Progress Bar */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                                    <div style={{
                                      width: '46px',
                                      height: '46px',
                                      borderRadius: '12px',
                                      background: '#F1F5F9',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '1.3rem',
                                      flexShrink: 0
                                    }}>
                                      {prodIcon}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <div style={{ fontWeight: 800, color: '#0F2942', fontSize: '0.94rem' }}>
                                        {appNo} · {item.product}
                                      </div>
                                      <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
                                        {item.lender || 'SBI'} · {formattedDate} · ₹{formattedAmt}
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                        <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600 }}>
                                          👤 {item.source || item.partner_name || 'Direct'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{ width: '90px', height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${stageMeta.pct}%`, height: '100%', background: stageMeta.color }} />
                                          </div>
                                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                                            {item.stage || 'Applied'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Block: Status Badge + Dropdowns */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                    <span style={{
                                      padding: '4px 14px',
                                      borderRadius: '14px',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      background: stageMeta.bg,
                                      color: stageMeta.textColor,
                                      textTransform: 'lowercase'
                                    }}>
                                      {stageMeta.status}
                                    </span>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {/* Stage Select */}
                                      <select
                                        value={item.stage || 'Applied'}
                                        onChange={(e) => handleInlineStageChange(item, e.target.value)}
                                        style={{
                                          padding: '5px 10px',
                                          borderRadius: '8px',
                                          border: '1px solid #CBD5E1',
                                          background: '#FFFFFF',
                                          fontSize: '0.78rem',
                                          fontWeight: 700,
                                          color: '#1E293B',
                                          cursor: 'pointer',
                                          outline: 'none'
                                        }}
                                      >
                                        {stageOptions.map(stg => (
                                          <option key={stg} value={stg}>{stg}</option>
                                        ))}
                                      </select>

                                      {/* Lender Select */}
                                      <select
                                        value={item.lender || 'SBI'}
                                        onChange={(e) => handleInlineLenderChange(item, e.target.value)}
                                        style={{
                                          padding: '5px 10px',
                                          borderRadius: '8px',
                                          border: '1px solid #CBD5E1',
                                          background: '#FFFFFF',
                                          fontSize: '0.78rem',
                                          fontWeight: 600,
                                          color: '#334155',
                                          cursor: 'pointer',
                                          outline: 'none'
                                        }}
                                      >
                                        {bankOptions.map(bank => (
                                          <option key={bank} value={bank}>🏛️ {bank}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* 6. LENDER RATES VIEW (Full 60+ Banks & Direct Bank Scraper) */}
          {activeTab === "rates" && (
            <div className="adm-subtab-container animate-fade-up">
              {/* Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F2942', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    Lender Rate Management
                  </h2>
                  <span style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    padding: '4px 12px',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                    Live Direct Bank Data
                  </span>
                  <span style={{
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    padding: '4px 12px',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    🏛️ {LENDERS.length} Total Institutions
                  </span>
                </div>

                <div className="adm-controls-row" style={{ margin: 0, gap: '10px', flexWrap: 'wrap' }}>
                  {/* Bank Type Filter */}
                  <select
                    className="adm-filter-dropdown"
                    value={selectedRateType}
                    onChange={(e) => setSelectedRateType(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem', color: '#1E293B', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="all_types">All Types (PSU, Private, NBFC, SFB)</option>
                    <option value="psu">PSU Banks</option>
                    <option value="private">Private Banks</option>
                    <option value="nbfc_hfc">NBFC / HFC</option>
                    <option value="sfb">Small Finance Banks (SFB)</option>
                  </select>

                  {/* Loan Category Selector */}
                  <select
                    className="adm-filter-dropdown"
                    value={selectedLoanCategory}
                    onChange={(e) => setSelectedLoanCategory(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem', color: '#1E293B', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="HL">🏠 Home Loan</option>
                    <option value="PL">💳 Personal Loan</option>
                    <option value="BL">💼 Business Loan</option>
                    <option value="VL">🚗 Vehicle Loan</option>
                    <option value="LAP">🏢 Loan Against Property</option>
                  </select>

                  {/* Save Button */}
                  <button
                    className="adm-ctrl-btn btn-csv"
                    onClick={saveLenderRates}
                    style={{
                      background: '#0F2942',
                      color: '#FFFFFF',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(15,41,66,0.15)'
                    }}
                  >
                    <span>💾</span> Save Rate Changes
                  </button>
                </div>
              </div>

              {/* Direct Bank Scraper Toolbar Card */}
              <div style={{
                background: 'linear-gradient(135deg, #0F2942 0%, #1A365D 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(15, 41, 66, 0.12)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}></span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.3px' }}>
                      Automated Direct-from-Bank Scraper
                    </span>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      Official Bank Portals
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span>
                      <strong>Schedule:</strong> Weekly on {scraperStatus?.dayOfWeek || 'Monday'} at 02:00 AM
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Last Run:</strong> {scraperStatus?.lastRunTime ? new Date(scraperStatus.lastRunTime).toLocaleString() : 'Recent baseline sync'}
                    </span>
                    {scraperStatus?.lastStatus && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#86EFAC' }}>{scraperStatus.lastStatus}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Schedule Day Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 600 }}>Run Every:</span>
                    <select
                      value={scraperStatus?.dayOfWeek || 'Monday'}
                      onChange={(e) => handleUpdateScraperDay(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Monday" style={{ color: '#0F2942' }}>Monday</option>
                      <option value="Tuesday" style={{ color: '#0F2942' }}>Tuesday</option>
                      <option value="Wednesday" style={{ color: '#0F2942' }}>Wednesday</option>
                      <option value="Thursday" style={{ color: '#0F2942' }}>Thursday</option>
                      <option value="Friday" style={{ color: '#0F2942' }}>Friday</option>
                      <option value="Saturday" style={{ color: '#0F2942' }}>Saturday</option>
                      <option value="Sunday" style={{ color: '#0F2942' }}>Sunday</option>
                    </select>
                  </div>

                  {/* Run Now Button */}
                  <button
                    onClick={handleTriggerScraper}
                    disabled={scraperRunning}
                    style={{
                      background: scraperRunning ? '#64748B' : '#22C55E',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: scraperRunning ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <span>{scraperRunning ? '⏳' : '⚡'}</span>
                    <span>{scraperRunning ? 'Scraping Banks...' : 'Scrape Live Bank Rates'}</span>
                  </button>
                </div>
              </div>

              <div className="timeline-subtitle-legend" style={{ margin: '0 0 16px 0', background: '#F8FAFC', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.84rem' }}>
                <span>Edit rates directly in the table. Click "Save Rate Changes" to apply. Rates update EMI calculators and borrower loan matching in real time across all 60+ institutions.</span>
              </div>

              <div className="adm-workspace-card">
                <div className="adm-wcard-body" style={{ padding: 0, overflowX: 'auto' }}>
                  <table className="rates-editable-table">
                    <thead>
                      <tr>
                        <th>LENDER</th>
                        <th>TYPE</th>
                        <th>FLOATING – LOW (%)</th>
                        <th>FLOATING – HIGH (%)</th>
                        <th>FIXED – LOW (%)</th>
                        <th>FIXED – HIGH (%)</th>
                        <th>OFFER & SPECIAL PROMOTION</th>
                        <th>VISIBLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const activeList = buildCategoryRates(selectedLoanCategory, rates);

                        const filteredRates = activeList.filter(r => {
                          if (!r) return false;
                          const rawType = String(r.type || 'Private').toLowerCase();
                          const filterType = String(selectedRateType || 'all_types').toLowerCase();

                          let matchType = true;
                          if (filterType === "psu") {
                            matchType = rawType.includes("psu");
                          } else if (filterType === "private") {
                            matchType = rawType.includes("private");
                          } else if (filterType === "nbfc_hfc") {
                            matchType = rawType.includes("nbfc") || rawType.includes("hfc");
                          } else if (filterType === "sfb") {
                            matchType = rawType.includes("sfb") || rawType.includes("small");
                          }

                          const term = String(searchTerm || '').toLowerCase().trim();
                          const matchSearch = !term || String(r.name || '').toLowerCase().includes(term);
                          return matchType && matchSearch;
                        });

                        if (filteredRates.length === 0) {
                          return (
                            <tr>
                              <td colSpan="8" className="no-data-cell" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                                No matching lender rates found.
                              </td>
                            </tr>
                          );
                        }

                        return filteredRates.map((rate) => {
                          const lKey = rate.lenderId || rate.id || rate.name;
                          const typeLower = String(rate.type || 'Private').toLowerCase();
                          const badgeClass = typeLower.includes('psu')
                            ? 'psu'
                            : (typeLower.includes('nbfc') || typeLower.includes('hfc'))
                              ? 'nbfc-hfc'
                              : (typeLower.includes('sfb') || typeLower.includes('small'))
                                ? 'sfb'
                                : 'private';

                          return (
                            <tr key={lKey}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0F2942', fontSize: '0.88rem' }}>
                                  <span>{rate.emoji || (badgeClass === 'psu' ? '🏛️' : badgeClass === 'sfb' ? '🏦' : badgeClass === 'nbfc-hfc' ? '🏢' : '🏦')}</span>
                                  <span>{rate.name}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`rate-type-badge ${badgeClass}`}>
                                  {rate.type || 'Private'}
                                </span>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.flowLow ?? 'N/A'}
                                  onChange={(e) => handleRateChange(lKey, 'flowLow', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.flowHigh ?? 'N/A'}
                                  onChange={(e) => handleRateChange(lKey, 'flowHigh', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.fixLow ?? 'N/A'}
                                  onChange={(e) => handleRateChange(lKey, 'fixLow', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-edit-input"
                                  value={rate.fixHigh ?? 'N/A'}
                                  onChange={(e) => handleRateChange(lKey, 'fixHigh', e.target.value)}
                                />
                              </td>
                              <td>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', pointerEvents: 'none' }}>🎁</span>
                                  <input
                                    type="text"
                                    className="table-edit-input offer-input"
                                    style={{ paddingLeft: '30px' }}
                                    value={rate.offer || ''}
                                    placeholder="Offer text"
                                    onChange={(e) => handleRateChange(lKey, 'offer', e.target.value)}
                                  />
                                </div>
                              </td>
                              <td>
                                <label className="switch-toggle-container">
                                  <input
                                    type="checkbox"
                                    checked={rate.visible !== false}
                                    onChange={(e) => handleRateChange(lKey, 'visible', e.target.checked)}
                                  />
                                  <span className="switch-slider"></span>
                                </label>
                              </td>
                            </tr>
                          );
                        });
                      })()}
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

      {/* ✏️ EDIT APPLICATION MODAL (Screenshot 3 Match) */}
      {editingLead && (
        <div className="adm-modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setEditingLead(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%', borderRadius: '16px', overflow: 'hidden', padding: 0, border: 'none', background: '#FFFFFF', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
            {/* Modal Header Bar */}
            <div style={{ background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✏️</span> Edit Application — {editingLead.application_no ?? (String(editingLead.id).startsWith('F4S') ? editingLead.id : `F4S-${2000 + editingLead.id}`)}
              </h3>
              <button onClick={() => setEditingLead(null)} style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
              {/* Top Light Blue Summary Card */}
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', fontSize: '0.85rem', color: '#0369A1' }}>
                <div><strong>Borrower:</strong> {editingLead.name} &nbsp;&nbsp;&nbsp; <strong>Mobile:</strong> {editingLead.number || '-'} &nbsp;&nbsp;&nbsp; <strong>Type:</strong> {editingLead.product || 'Home Loan'}</div>
                <div style={{ marginTop: '6px' }}><strong>Applied:</strong> {editingLead.createdAt ? new Date(editingLead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Jan 2025'}</div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Borrower Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Assigned Lender</label>
                  <select
                    value={editForm.lender || 'SBI'}
                    onChange={(e) => setEditForm(f => ({ ...f, lender: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#FFFFFF', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="HDFC Bank">🏦 HDFC Bank</option>
                    <option value="SBI">🏦 SBI</option>
                    <option value="ICICI Bank">🏦 ICICI Bank</option>
                    <option value="Axis Bank">🏦 Axis Bank</option>
                    <option value="Bajaj Finserv">🏦 Bajaj Finserv</option>
                    <option value="PNB Housing">🏦 PNB Housing</option>
                    <option value="Bank of Baroda">🏦 Bank of Baroda</option>
                    <option value="Canara Bank">🏦 Canara Bank</option>
                    <option value="Union Bank">🏦 Union Bank</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={editForm.loan_amount || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, loan_amount: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Status</label>
                    <select
                      value={editForm.status || 'in progress'}
                      onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#FFFFFF', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="in progress">IN-PROGRESS</option>
                      <option value="disbursed">DISBURSED</option>
                      <option value="rejected">REJECTED</option>
                      <option value="pending">PENDING</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Stage</label>
                    <select
                      value={editForm.stage || 'Applied'}
                      onChange={(e) => setEditForm(f => ({ ...f, stage: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#FFFFFF', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="Applied">APPLIED</option>
                      <option value="Docs">DOCS</option>
                      <option value="Credit">CREDIT</option>
                      <option value="Submitted">SUBMITTED</option>
                      <option value="Sanction">SANCTION</option>
                      <option value="Legal">LEGAL</option>
                      <option value="Disbursed">DISBURSED</option>
                      <option value="Rejected">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Remark / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Documents submitted, awaiting sanction."
                    value={editForm.remark || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, remark: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '24px' }}>
                <button
                  onClick={saveEditLead}
                  style={{ padding: '12px 20px', borderRadius: '8px', background: '#0F2942', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>💾</span> Save Changes
                </button>
                <button
                  onClick={() => setEditingLead(null)}
                  style={{ padding: '12px 20px', borderRadius: '8px', background: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT PARTNER MODAL ═══ */}
      {editingBroker && (
        <div
          onClick={() => setEditingBroker(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
              padding: '18px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✏️</span> Edit Partner — {editingBroker.name}
              </span>
              <button
                onClick={() => setEditingBroker(null)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: '#FFFFFF', fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ background: '#FFFFFF', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  value={editBrokerForm.name}
                  onChange={(e) => setEditBrokerForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Partner full name"
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: '8px', border: '1px solid #D1D5DB',
                    fontSize: '0.9rem', outline: 'none', color: '#111827'
                  }}
                />
              </div>

              {/* City / Area */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>City / Area</label>
                <input
                  type="text"
                  value={editBrokerForm.city}
                  onChange={(e) => setEditBrokerForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="e.g. Mumbai"
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: '8px', border: '1px solid #D1D5DB',
                    fontSize: '0.9rem', outline: 'none', color: '#111827'
                  }}
                />
              </div>

              {/* Mobile */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mobile</label>
                <input
                  type="tel"
                  value={editBrokerForm.mobile}
                  onChange={(e) => setEditBrokerForm(f => ({ ...f, mobile: e.target.value }))}
                  placeholder="10-digit mobile number"
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: '8px', border: '1px solid #D1D5DB',
                    fontSize: '0.9rem', outline: 'none', color: '#111827'
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Status</label>
                <select
                  value={editBrokerForm.status}
                  onChange={(e) => setEditBrokerForm(f => ({ ...f, status: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: '8px', border: '1px solid #D1D5DB',
                    fontSize: '0.9rem', outline: 'none', background: '#FFFFFF',
                    color: '#111827', cursor: 'pointer'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  onClick={saveEditBroker}
                  style={{
                    flex: 1, padding: '12px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0D9488, #0F766E)',
                    color: '#FFFFFF', border: 'none',
                    fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <span>💾</span> Save Changes
                </button>
                <button
                  onClick={() => setEditingBroker(null)}
                  style={{
                    flex: 1, padding: '12px 20px',
                    borderRadius: '10px',
                    background: '#FFFFFF', color: '#6B7280',
                    border: '1px solid #D1D5DB',
                    fontWeight: 600, fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT BORROWER MODAL ═══ */}
      {editingBorrower && (
        <div
          onClick={() => setEditingBorrower(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              padding: '18px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✏️</span> Edit Borrower — {editingBorrower.name}
              </span>
              <button
                onClick={() => setEditingBorrower(null)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: '#FFFFFF', fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}
              >×</button>
            </div>
            <div style={{ background: '#FFFFFF', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  value={editBorrowerForm.name}
                  onChange={(e) => setEditBorrowerForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Borrower full name"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', color: '#111827' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  value={editBorrowerForm.email}
                  onChange={(e) => setEditBorrowerForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', color: '#111827' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mobile</label>
                <input
                  type="tel"
                  value={editBorrowerForm.mobile}
                  onChange={(e) => setEditBorrowerForm(f => ({ ...f, mobile: e.target.value }))}
                  placeholder="10-digit mobile number"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', color: '#111827' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Status</label>
                <select
                  value={editBorrowerForm.status}
                  onChange={(e) => setEditBorrowerForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', background: '#FFFFFF', color: '#111827', cursor: 'pointer' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  onClick={saveEditBorrower}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)',
                    color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <span>💾</span> Save Changes
                </button>
                <button
                  onClick={() => setEditingBorrower(null)}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: '10px',
                    background: '#FFFFFF', color: '#6B7280', border: '1px solid #D1D5DB',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                  }}
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BORROWER LOANS MODAL ═══ */}
      {borrowerLoansModal && (
        <div
          onClick={() => setBorrowerLoansModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '720px',
              borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              fontFamily: "'DM Sans', sans-serif",
              maxHeight: '85vh', display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0F2942 0%, #1E3A5F 100%)',
              padding: '18px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📑</span> Loan Applications — {borrowerLoansModal.name}
              </span>
              <button
                onClick={() => setBorrowerLoansModal(null)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: '#FFFFFF', fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}
              >×</button>
            </div>

            {/* Body */}
            <div style={{ background: '#FFFFFF', overflowY: 'auto', flex: 1 }}>
              {borrowerLoansLoading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '0.95rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                  Loading loan applications...
                </div>
              ) : borrowerLoansModal.loans.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '0.95rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                  No loan applications found for this borrower.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      {['APP NO', 'LOAN TYPE', 'AMOUNT', 'LENDER', 'STATUS', 'DATE'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {borrowerLoansModal.loans.map((loan, i) => {
                      const stLower = (loan.status || '').toLowerCase();
                      const stBg = ['disbursed', 'completed'].includes(stLower) ? '#DCFCE7' : stLower === 'rejected' ? '#FEE2E2' : '#DBEAFE';
                      const stColor = ['disbursed', 'completed'].includes(stLower) ? '#166534' : stLower === 'rejected' ? '#991B1B' : '#1E40AF';
                      return (
                        <tr key={loan.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFC' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2942' }}>{loan.application_no}</td>
                          <td style={{ padding: '12px 16px', color: '#334155' }}>{loan.loanType}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1E293B' }}>
                            {loan.loanAmount ? `₹${Number(loan.loanAmount).toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{loan.lender && loan.lender !== '-' ? loan.lender : '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: stBg, color: stColor }}>
                              {(loan.status || 'APPLIED').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748B' }}>
                            {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
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
