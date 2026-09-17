import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fmtINR } from "../utils/formatters";
import { LOAN_PRODUCTS } from "../utils/constants";
import {
  Users,
  Check,
  Clock,
  AlertCircle,
  Shield,
  Sparkles,
  Phone,
  PhoneCall,
  Mail,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  LogOut,
  MapPin,
  Plus,
  X,
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  Coins,
  FileText,
  UserCheck,
  Heart,
  ChevronDown,
  User,
  Edit3,
  Lock,
  Key,
  Smartphone,
  AtSign,
  Pencil,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Navigation,
  Calculator
} from "lucide-react";
import "./styles/brokerDashboard.css";

const REFERENCE_LENDERS = [
  { name: "HDFC Bank", rate: 7.20 },
  { name: "ICICI Bank", rate: 7.25 },
  { name: "Bajaj Finserv", rate: 7.25 },
  { name: "Axis Bank", rate: 7.30 },
  { name: "Kotak Mahindra", rate: 7.40 },
  { name: "Yes Bank", rate: 7.45 },
  { name: "PNB Housing", rate: 7.50 },
  { name: "LIC Housing", rate: 7.50 },
  { name: "IndusInd Bank", rate: 7.55 },
  { name: "State Bank of India", rate: 7.60 },
  { name: "Bank of Baroda", rate: 7.65 },
  { name: "Tata Capital", rate: 7.75 },
  { name: "IDFC First Bank", rate: 7.80 },
  { name: "Federal Bank", rate: 7.85 },
  { name: "Union Bank", rate: 7.90 },
];

const getLoanIcon = (name = "", size = 16, color = "#0D7A68") => {
  const n = (name || "").toLowerCase();
  if (n.includes("home")) return <Home size={size} color={color} />;
  if (n.includes("property") || n.includes("lap")) return <Building2 size={size} color={color} />;
  if (n.includes("personal")) return <CreditCard size={size} color={color} />;
  if (n.includes("business")) return <Briefcase size={size} color={color} />;
  if (n.includes("car") || n.includes("vehicle") || n.includes("auto")) return <Car size={size} color={color} />;
  if (n.includes("education")) return <GraduationCap size={size} color={color} />;
  if (n.includes("gold")) return <Coins size={size} color={color} />;
  return <FileText size={size} color={color} />;
};

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

  // Advisor business hours: Mon-Sat, 9:30 AM to 6:30 PM IST (Offline on Sunday, before 9:30 AM, or after 6:30 PM)
  const getAdvisorOnlineStatus = () => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23"
      }).formatToParts(new Date());

      const partMap = {};
      parts.forEach((p) => { partMap[p.type] = p.value; });

      // Offline on Sunday
      if (partMap.weekday === "Sun") return false;

      const hour = parseInt(partMap.hour, 10);
      const minute = parseInt(partMap.minute, 10);
      const totalMinutes = hour * 60 + minute;

      const startMinutes = 9 * 60 + 30; // 9:30 AM IST (570)
      const endMinutes = 18 * 60 + 30;  // 6:30 PM IST (1110)

      return totalMinutes >= startMinutes && totalMinutes < endMinutes;
    } catch (e) {
      const now = new Date();
      // IST is UTC + 5:30 (330 minutes)
      const istMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % 1440;
      const istDaysFromEpoch = Math.floor((now.getTime() + 19800000) / 86400000);
      const istDayOfWeek = (istDaysFromEpoch + 4) % 7; // 0 = Sunday
      if (istDayOfWeek === 0) return false;
      return istMinutes >= 570 && istMinutes < 1110;
    }
  };

  const [isAdvisorOnline, setIsAdvisorOnline] = useState(getAdvisorOnlineStatus);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAdvisorOnline(getAdvisorOnlineStatus());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Partner Profile States
  const [profName, setProfName] = useState("");
  const [profCity, setProfCity] = useState("");
  const [profNumber, setProfNumber] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profEditing, setProfEditing] = useState(false);
  const [profSaving, setProfSaving] = useState(false);
  const [profOtp, setProfOtp] = useState("");
  const [profOtpVerified, setProfOtpVerified] = useState(false);

  // Change Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Add Client Form States (matching 2nd image design)
  const [acLoanType, setAcLoanType] = useState("1");
  const [acAmt, setAcAmt] = useState("20");
  const [acAmtUnit, setAcAmtUnit] = useState("Lakh");
  const [acTenureYears, setAcTenureYears] = useState("15");
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [acName, setAcName] = useState("");
  const [acMobile, setAcMobile] = useState("");
  const [acEmail, setAcEmail] = useState("");
  const [acReachMode, setAcReachMode] = useState("direct");

  // DB-driven data
  const [loanTypes, setLoanTypes] = useState([]);
  const [allLenders, setAllLenders] = useState([]);

  useEffect(() => {
    const loadAllData = async () => {
      await fetchProfile();
      await fetchClients();
      await fetchLeads();
      await fetchLoanTypes();
      await fetchLenders();
    };
    loadAllData();
  }, []);


  async function fetchProfile() {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/auth/profile", {
        credentials: "include",
        headers,
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      showToast("error", "Password must be at least 6 characters");
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to change password");
      }
      showToast("success", "Password changed successfully!");
      setIsChangingPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setPassLoading(false);
    }
  };

  const openReferralModal = () => {
    if (loanTypes.length === 0) fetchLoanTypes();
    if (allLenders.length === 0) fetchLenders();
    setShowAddClientModal(true);
  };

  async function fetchClients() {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/broker/getRefferedClients", {
        credentials: "include",
        headers,
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
      const token = localStorage.getItem("accessToken");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/broker/getBrokerLeads", {
        credentials: "include",
        headers,
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

  // KPI Metrics Calculation from referred leads
  const totalReferrals = leads.length;

  const disbursedCount = useMemo(() => {
    return leads.filter((l) => {
      const s = (l.statusName || l.status || "").toLowerCase();
      const sid = Number(l.status_id || 0);
      return sid === 7 || s.includes("disburs") || s.includes("complet");
    }).length;
  }, [leads]);

  const inProgressCount = useMemo(() => {
    return leads.filter((l) => {
      const s = (l.statusName || l.status || "").toLowerCase();
      const sid = Number(l.status_id || 0);
      return (
        (sid >= 3 && sid < 7) ||
        s.includes("progress") ||
        s.includes("credit") ||
        s.includes("submit") ||
        s.includes("sanction") ||
        s.includes("legal")
      );
    }).length;
  }, [leads]);

  const pendingDocsCount = useMemo(() => {
    return leads.filter((l) => {
      const s = (l.statusName || l.status || "").toLowerCase();
      const sid = Number(l.status_id || 0);
      return (
        sid === 1 ||
        sid === 2 ||
        s.includes("doc") ||
        s.includes("applied") ||
        s.includes("pending")
      );
    }).length;
  }, [leads]);

  const loanVolumeFormatted = useMemo(() => {
    const totalAmt = leads.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
    if (totalAmt >= 10000000) {
      return `₹${(totalAmt / 10000000).toFixed(1)}Cr`;
    }
    if (totalAmt >= 100000) {
      return `₹${(totalAmt / 100000).toFixed(1)}L`;
    }
    if (totalAmt > 0) {
      return `₹${totalAmt.toLocaleString("en-IN")}`;
    }
    return "₹0";
  }, [leads]);

  // Filter leads based on tab choice
  const filteredLeads = useMemo(() => {
    if (activeFilter === "all") return leads;

    if (activeFilter === "in-progress") {
      return leads.filter((l) => {
        const s = (l.statusName || l.status || "").toLowerCase();
        const sid = Number(l.status_id || 0);
        return (
          (sid >= 3 && sid < 7) ||
          s.includes("progress") ||
          s.includes("credit") ||
          s.includes("submit") ||
          s.includes("sanction") ||
          s.includes("legal")
        );
      });
    }

    if (activeFilter === "disbursed") {
      return leads.filter((l) => {
        const s = (l.statusName || l.status || "").toLowerCase();
        const sid = Number(l.status_id || 0);
        return sid === 7 || s.includes("disburs") || s.includes("complet");
      });
    }

    if (activeFilter === "pending-docs") {
      return leads.filter((l) => {
        const s = (l.statusName || l.status || "").toLowerCase();
        const sid = Number(l.status_id || 0);
        return (
          sid === 1 ||
          sid === 2 ||
          s.includes("doc") ||
          s.includes("applied") ||
          s.includes("pending")
        );
      });
    }

    return leads;
  }, [leads, activeFilter]);

  const getProductTitle = (id) => {
    return LOAN_PRODUCTS.find((p) => p.id === id)?.name || id;
  };

  const getProductEmoji = (id) => {
    // kept for legacy compatibility, returns empty string (icons used in render)
    return "";
  };

  const getLoanEmoji = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("home")) return "🏠";
    if (n.includes("property") || n.includes("lap")) return "🏢";
    if (n.includes("personal")) return "💳";
    if (n.includes("business")) return "💼";
    if (n.includes("car") || n.includes("auto")) return "🚗";
    if (n.includes("education") || n.includes("study")) return "🎓";
    return "📄";
  };

  // Add Client - Lender option list strictly matching reference image sorted by best ROI
  const lenderOptions = useMemo(() => {
    return REFERENCE_LENDERS.map((rl) => {
      const match = (allLenders || []).find((l) => {
        const lName = (l.name || "").toLowerCase().replace(" bank", "").trim();
        const rName = rl.name.toLowerCase().replace(" bank", "").trim();
        return lName === rName || lName.includes(rName) || rName.includes(lName);
      });
      return {
        id: match ? match.id : null,
        name: rl.name,
        rate: rl.rate,
      };
    });
  }, [allLenders]);

  const displayLoanTypes = useMemo(() => {
    if (loanTypes && loanTypes.length > 0) return loanTypes;
    return [
      { id: "1", name: "Home Loan" },
      { id: "2", name: "Loan Against Property" },
      { id: "3", name: "Personal Loan" },
      { id: "4", name: "Business Loan" },
      { id: "5", name: "Car Loan" },
    ];
  }, [loanTypes]);

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

  const selectedLoanTypeName = displayLoanTypes.find((t) => String(t.id) === String(acLoanType))?.name || acLoanType;

  const [submitting, setSubmitting] = useState(false);

  const submitAddClient = async (e) => {
    e.preventDefault();
    if (!acName.trim() || !acMobile.trim()) {
      showToast("error", "Please enter client name and 10-digit mobile number");
      return;
    }
    if (acMobile.trim().length !== 10) {
      showToast("error", "Please enter a valid 10-digit mobile number");
      return;
    }
    if (!acAmt || parseFloat(acAmt) <= 0) {
      showToast("error", "Please enter a valid loan amount");
      return;
    }

    setSubmitting(true);
    try {
      const unitMultiplier = acAmtUnit === "Crore" ? 10000000 : acAmtUnit === "Thousand" ? 1000 : acAmtUnit === "₹" ? 1 : 100000;
      const finalAmount = parseFloat(acAmt) * unitMultiplier;
      const finalTenureMonths = acTenureYears ? Math.round(parseFloat(acTenureYears) * 12) : null;

      // Pick first selected lender's id (if any)
      const firstSelectedLender = lenderOptions.find((l) => selectedLenders.includes(l.name));
      const targetLoanTypeId = acLoanType || (displayLoanTypes[0]?.id ? String(displayLoanTypes[0].id) : "1");

      const payload = {
        name: acName.trim(),
        number: acMobile.trim(),
        email: acEmail.trim() || null,
        loan_type_id: targetLoanTypeId,
        loan_amount: finalAmount,
        loan_purpose: selectedLoanTypeName || "General",
        preferred_lender_id: firstSelectedLender?.id || null,
        selected_lenders: selectedLenders,
        selectedLenders: selectedLenders,
        client_preference: acReachMode,
        tenure: finalTenureMonths,
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

      showToast("success", `Referral for "${acName.trim()}" submitted! Application saved.`);
      setShowAddClientModal(false);

      // Reset form
      setAcName("");
      setAcMobile("");
      setAcEmail("");
      setAcAmt("20");
      setAcAmtUnit("Lakh");
      setAcTenureYears("15");
      setSelectedLenders([]);
      setAcReachMode("direct");
      if (displayLoanTypes.length > 0) setAcLoanType(String(displayLoanTypes[0].id));

      // Refresh dashboard data
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
              {user.name ? user.name.charAt(0).toUpperCase() : "P"}
            </div>
            <div>
              <div className="pdash-name">Partner</div>
              <div className="pdash-meta">
                <span className="pdash-badge">PARTNER</span>
                <span className="pdash-city"><MapPin size={11} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: '-1px' }} />{user?.city || user?.district || "City"}</span>
                <span className="pdash-id">ID: {user?.brokerId || user?.partner_id || user?.id || user?._id ? `F4S-${String(user.brokerId || user.partner_id || user.id || user._id).padStart(5, '0')}` : 'F4S-20847'}</span>
              </div>
            </div>
          </div>

          <div className="pdash-header-actions">
            <button className="pdash-help-btn" onClick={() => setShowSupportModal(true)}>
              <span className="csp-dot"></span> Need Help?
            </button>
            <button className="pdash-logout" onClick={handleSignOut}>
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BODY WORKSPACE ═══ */}
      <div className="pdash-body">
        {workspaceTab !== "profile" ? (
          <>
            {/* KPI stat metrics row (5 cards) */}
            <div className="pdash-kpi-row animate-fade-up">
          <div className="pdash-kpi-card">
            <div className="pkpi-icon pkpi-icon-blue">
              <Users size={20} />
            </div>
            <div className="pkpi-content">
              <div className="pkpi-val">{totalReferrals}</div>
              <div className="pkpi-lbl">TOTAL REFERRALS</div>
            </div>
          </div>

          <div className="pdash-kpi-card">
            <div className="pkpi-icon pkpi-icon-green">
              <Check size={20} />
            </div>
            <div className="pkpi-content">
              <div className="pkpi-val">{disbursedCount}</div>
              <div className="pkpi-lbl">DISBURSED</div>
            </div>
          </div>

          <div className="pdash-kpi-card">
            <div className="pkpi-icon pkpi-icon-amber">
              <Clock size={20} />
            </div>
            <div className="pkpi-content">
              <div className="pkpi-val">{inProgressCount}</div>
              <div className="pkpi-lbl">IN PROGRESS</div>
            </div>
          </div>

          <div className="pdash-kpi-card">
            <div className="pkpi-icon pkpi-icon-red">
              <AlertCircle size={20} />
            </div>
            <div className="pkpi-content">
              <div className="pkpi-val">{pendingDocsCount}</div>
              <div className="pkpi-lbl">PENDING DOCS</div>
            </div>
          </div>

          <div className="pdash-kpi-card">
            <div className="pkpi-icon pkpi-icon-shield">
              <Shield size={20} />
            </div>
            <div className="pkpi-content">
              <div className="pkpi-val">{loanVolumeFormatted}</div>
              <div className="pkpi-lbl">LOAN VOLUME</div>
            </div>
          </div>
        </div>

        {/* Eye-catching Got a new client banner */}
        <div className="pdash-addclient-banner animate-fade-up" onClick={openReferralModal}>
          <div className="pacb-left">
            <div className="pacb-icon">
              <Sparkles size={24} />
            </div>
            <div className="pacb-txt">
              <div className="pacb-title">Got a new client?</div>
              <div className="pacb-sub">Add their details in under a minute — pick loan type, amount &amp; how to reach them</div>
            </div>
          </div>
          <button className="pacb-btn" onClick={(e) => { e.stopPropagation(); openReferralModal(); }}>
            + Add Client
          </button>
        </div>

        {/* Main Dashboard Workspace Grid */}
        <div className="pdash-main-grid animate-fade-up">
          {/* Left Column */}
          <div className="pdash-left">
            <div className="pdash-section-head">
              <h3>Referred Customers</h3>
              <button className="pdash-add-btn" onClick={openReferralModal}>
                <Plus size={14} /> Add Client
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="pdash-filter-row">
              <button
                className={`pdash-ftab ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All ({totalReferrals})
              </button>
              <button
                className={`pdash-ftab ${activeFilter === "in-progress" ? "active" : ""}`}
                onClick={() => setActiveFilter("in-progress")}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                className={`pdash-ftab ${activeFilter === "disbursed" ? "active" : ""}`}
                onClick={() => setActiveFilter("disbursed")}
              >
                Disbursed ({disbursedCount})
              </button>
              <button
                className={`pdash-ftab ${activeFilter === "pending-docs" ? "active" : ""}`}
                onClick={() => setActiveFilter("pending-docs")}
              >
                Pending Docs ({pendingDocsCount})
              </button>
            </div>

            {/* Referral Cards List */}
            <div className="cd-loan-list">
              {filteredLeads.length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px", background: "#fff", border: "1px solid #E6EEF8", borderRadius: "18px", color: "var(--text2)", fontSize: ".88rem" }}>
                  No referred customers found for this filter tab.
                </div>
              ) : (
                filteredLeads.map((lead, index) => {
                  const customerName = lead.clientName || lead.name?.split(" - ")?.[0] || "Customer";
                  const rawProduct = lead.product || lead.loanTypeName || "Loan";
                  const amt = parseFloat(lead.amount) || 0;
                  const formattedAmt = amt >= 10000000
                    ? `₹${(amt / 10000000).toFixed(amt % 10000000 === 0 ? 0 : 1)} Cr`
                    : amt >= 100000
                    ? `₹${(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)} L`
                    : amt > 0 ? `₹${amt.toLocaleString("en-IN")}` : "";
                  const lender = lead.lenderName || "";
                  const dateStr = lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "10 Jan 2025";
                  const refCode = lead.application_no
                    ? (String(lead.application_no).startsWith("F4S") ? lead.application_no : `F4S-${lead.application_no}`)
                    : (lead.appId ? `F4S-R${String(lead.appId).padStart(3, "0")}` : `F4S-R00${index + 1}`);

                  const rawSt = (lead.statusName || lead.status || lead.stage || "").toLowerCase();
                  const sId = Number(lead.status_id || 1);
                  let currentStepIndex = 1;
                  if (sId === 7 || rawSt.includes("disburs") || rawSt.includes("complet")) currentStepIndex = 6;
                  else if (sId === 6 || rawSt.includes("legal")) currentStepIndex = 5;
                  else if (sId === 5 || rawSt.includes("sanction")) currentStepIndex = 4;
                  else if (sId === 4 || rawSt.includes("submit")) currentStepIndex = 3;
                  else if (sId === 3 || rawSt.includes("credit") || rawSt.includes("review")) currentStepIndex = 2;
                  else if (sId === 2 || rawSt.includes("doc")) currentStepIndex = 1;
                  else currentStepIndex = 0;

                  let chipLabel = "In Progress";
                  let chipClass = "pchip-blue";
                  if (sId === 7 || rawSt.includes("disburs") || rawSt.includes("complet")) {
                    chipLabel = "Disbursed";
                    chipClass = "pchip-green";
                  } else if (rawSt.includes("reject")) {
                    chipLabel = "Rejected";
                    chipClass = "pchip-red";
                  } else if (sId === 2 || rawSt.includes("doc")) {
                    chipLabel = "Pending Docs";
                    chipClass = "pchip-amber";
                  }

                  let remarkText = lead.remark || "";
                  if (!remarkText) {
                    if (sId === 7 || rawSt.includes("disburs")) remarkText = "Loan disbursed successfully to client account.";
                    else if (sId === 6 || rawSt.includes("legal")) remarkText = "Legal and technical verification in progress.";
                    else if (sId === 5 || rawSt.includes("sanction")) remarkText = "Loan sanction letter issued by bank.";
                    else if (sId === 4 || rawSt.includes("submit")) remarkText = "Documents submitted.";
                    else if (sId === 3 || rawSt.includes("credit")) remarkText = "Application under credit appraisal with lenders.";
                    else if (sId === 2 || rawSt.includes("doc")) remarkText = "Documents pending verification.";
                    else remarkText = "Documents submitted.";
                  }

                  return (
                    <div key={lead.id || lead._id || index} className="pcard-referral">
                      <div className="pcard-top">
                        <div className="pcard-left">
                          <div className="pcard-thumb">
                            {/* Empty clean thumbnail */}
                          </div>
                          <div className="pcard-info">
                            <h4 className="pcard-title">{customerName}</h4>
                            <div className="pcard-sub1">
                              {rawProduct} · {formattedAmt} · {lender}
                            </div>
                            <div className="pcard-sub2">
                              {dateStr} · {refCode}
                            </div>
                          </div>
                        </div>
                        <div className="pcard-right">
                          <span className={`pcard-chip ${chipClass}`}>
                            <span className="pcard-chip-dot"></span>
                            {chipLabel}
                          </span>
                        </div>
                      </div>

                      {/* Loan Journey Tracker */}
                      <div className="pcard-journey">
                        <div className="cdl-track">
                          {["applied", "docs", "credit", "submitted", "sanction", "legal", "disbursed"].map((step, idx) => {
                            const isDone = idx < currentStepIndex;
                            const isActive = idx === currentStepIndex;

                            return (
                              <div key={step} className={`cdl-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                                <div className="cdl-dot">{isDone ? <Check size={11} strokeWidth={3} /> : (idx + 1)}</div>
                                <span className="cdl-step-lbl" style={{ textTransform: "capitalize" }}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status / Remark callout */}
                      <div className="pcard-remark">
                        <MessageSquare size={15} className="pcard-remark-icon" />
                        <span>{remarkText}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="cdash-right">
            {/* Dedicated Support Card */}
            <div className="pdash-support-card">
              <div className="pdash-support-head">
                <PhoneCall size={14} />
                <span>YOUR DEDICATED SUPPORT</span>
              </div>

              <div className="cdsm-person">
                <div className="cdsm-avatar" style={{ background: "#34D399", color: "#064E3B", fontWeight: 700, borderRadius: "12px", width: "44px", height: "44px" }}>
                  RM
                </div>
                <div>
                  <div className="cdsm-name" style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>Mr. Rishabh Mathur</div>
                  <div className="cdsm-role" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.74rem" }}>Manager — Mortgages</div>
                </div>
                <span className={`cdsm-online ${isAdvisorOnline ? "is-online" : "is-offline"}`} style={{ color: isAdvisorOnline ? "#34D399" : "#94A3B8" }}>
                  <span className="psc-dot" style={{ backgroundColor: isAdvisorOnline ? "#34D399" : "#94A3B8", boxShadow: isAdvisorOnline ? "0 0 8px rgba(52, 211, 153, 0.6)" : "none", animation: isAdvisorOnline ? "roiPulse 1.6s infinite" : "none" }}></span>
                  {isAdvisorOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* 3 Contact Action Rows */}
              <div className="pdash-actions-list">
                <a className="pdash-action-row" href="tel:9910507574">
                  <div className="par-icon par-white">
                    <Phone size={16} />
                  </div>
                  <div className="par-details">
                    <div className="par-lbl">MOBILE</div>
                    <div className="par-val">99105 07574</div>
                  </div>
                  <ChevronRight size={18} className="par-arrow" />
                </a>

                <a className="pdash-action-row" href="mailto:support@finn4sure.com">
                  <div className="par-icon par-white">
                    <Mail size={16} />
                  </div>
                  <div className="par-details">
                    <div className="par-lbl">EMAIL</div>
                    <div className="par-val">support@finn4sure.com</div>
                  </div>
                  <ChevronRight size={18} className="par-arrow" />
                </a>

                <a className="pdash-action-row" href="https://wa.me/919910507574" target="_blank" rel="noreferrer">
                  <div className="par-icon par-green">
                    <MessageSquare size={16} />
                  </div>
                  <div className="par-details">
                    <div className="par-lbl">WHATSAPP</div>
                    <div className="par-val">Chat Now</div>
                  </div>
                  <ChevronRight size={18} className="par-arrow" />
                </a>
              </div>

              <div className="pdash-support-hours">
                <Clock size={13} />
                <span>Mon–Sat, 9:30 AM — 6:30 PM IST</span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="pdash-quick-actions">
              <button
                className="pdash-qa-row"
                onClick={() => setShowAddClientModal(true)}
              >
                <span className="pdash-qa-icon pdash-qa-icon--add">
                  <Plus size={16} />
                </span>
                <span className="pdash-qa-label">Add Client</span>
                <ChevronRight size={16} className="pdash-qa-arrow" />
              </button>

              <div className="pdash-qa-divider" />

              <button
                className="pdash-qa-row"
                onClick={() => window.open("https://emicalculator.net/", "_blank")}
              >
                <span className="pdash-qa-icon pdash-qa-icon--emi">
                  <Calculator size={16} />
                </span>
                <span className="pdash-qa-label">EMI Calculator</span>
                <ChevronRight size={16} className="pdash-qa-arrow" />
              </button>
            </div>
          </div>
        </div>
      </>
    ) : (
        /* Edit Profile Tab */
        <div className="cdPanelProfile animate-fade-up" style={{ maxWidth: "600px", margin: "0 auto", padding: "10px 0 30px" }}>
          <div style={{ marginBottom: "16px" }}>
            <button type="button" onClick={() => setWorkspaceTab("dashboard")} style={{ background: "transparent", border: "none", color: "#0D7A68", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={16} /> Back to Referral Dashboard
            </button>
          </div>
            <div className="cpro-card" style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E6EEF8", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div className="cpro-head" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.2rem", height: "2.2rem", background: "#EEF2FF", borderRadius: "10px", color: "#4F46E5" }}><User size={22} /></span>
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
                    <span className="icon"><User size={16} /></span>
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
                    <span className="icon"><Navigation size={16} /></span>
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
                    <span className="icon"><Smartphone size={16} /></span>
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
                    <span className="icon"><AtSign size={16} /></span>
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
                      <Pencil size={15} style={{ marginRight: 6 }} /> Edit Profile Details
                    </button>
                  )}
                </div>
              </form>

              {/* Change Password Section */}
              <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #F1F5F9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--navy)" }}>Security</h3>
                    <p style={{ margin: "4px 0 0", fontSize: ".82rem", color: "var(--text2)" }}>Update your account password</p>
                  </div>
                  {!isChangingPassword && (
                    <button type="button" className="btn-secondary" onClick={() => setIsChangingPassword(true)} style={{ height: "36px", padding: "0 16px", fontSize: ".8rem" }}>
                      Change Password
                    </button>
                  )}
                </div>

                {isChangingPassword && (
                  <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#F8FAFC", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <div>
                      <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)", display: "block", marginBottom: "6px" }}>Current Password</label>
                      <div className="input-wrap">
                        <span className="icon"><Key size={16} /></span>
                        <input type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)", display: "block", marginBottom: "6px" }}>New Password</label>
                      <div className="input-wrap">
                        <span className="icon"><Lock size={16} /></span>
                        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--navy)", display: "block", marginBottom: "6px" }}>Confirm New Password</label>
                      <div className="input-wrap">
                        <span className="icon"><Lock size={16} /></span>
                        <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                      <button type="submit" disabled={passLoading} className="btn-primary" style={{ height: "40px", padding: "0 24px" }}>
                        {passLoading ? "Updating..." : "Update Password"}
                      </button>
                      <button type="button" onClick={() => { setIsChangingPassword(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }} className="btn-secondary" style={{ height: "40px", padding: "0 20px" }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ADD CLIENT MODAL (MATCHING SCREENSHOT) ═══ */}
      {showAddClientModal && (
        <div className="cd-modal" onClick={() => setShowAddClientModal(false)}>
          <div className="acm-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="acm-header">
              <div className="acm-header-title">
                <span className="acm-plus-icon">+</span>
                <span className="acm-title-text">Add Client</span>
              </div>
              <button
                type="button"
                className="acm-close-btn"
                onClick={() => setShowAddClientModal(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={submitAddClient} className="acm-body">
              {/* Row 1: Loan Type, Amount, Tenure */}
              <div className="acm-grid-3">
                <div className="acm-form-group">
                  <label className="acm-label">Loan Type</label>
                  <select
                    className="acm-select"
                    value={acLoanType || String(displayLoanTypes[0]?.id || "1")}
                    onChange={(e) => {
                      setAcLoanType(e.target.value);
                      setSelectedLenders([]);
                    }}
                    required
                  >
                    {displayLoanTypes.map((lt) => (
                      <option key={lt.id} value={String(lt.id)}>
                        {lt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="acm-form-group">
                  <label className="acm-label">Amount</label>
                  <div className="acm-amount-box">
                    <span className="acm-currency-prefix">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      className="acm-amount-input"
                      value={acAmt}
                      onChange={(e) => setAcAmt(e.target.value)}
                      placeholder="20"
                      required
                    />
                    <select
                      className="acm-amount-unit-select"
                      value={acAmtUnit}
                      onChange={(e) => setAcAmtUnit(e.target.value)}
                    >
                      <option value="Lakh">Lakh</option>
                      <option value="Crore">Crore</option>
                    </select>
                  </div>
                </div>

                <div className="acm-form-group">
                  <label className="acm-label">Tenure (yrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    className="acm-input"
                    placeholder="15"
                    value={acTenureYears}
                    onChange={(e) => setAcTenureYears(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Preferred Lenders (sorted by best ROI) */}
              <div className="acm-form-group">
                <label className="acm-label">
                  Preferred Lenders <span className="acm-label-sub">(sorted by best ROI)</span>
                </label>
                <div className="acm-lenders-box">
                  {lenderOptions.map((l) => {
                    const isSel = selectedLenders.includes(l.name);
                    return (
                      <div
                        key={l.name}
                        className={`acm-lender-chip ${isSel ? "selected" : ""}`}
                        onClick={() => handleToggleLender(l.name)}
                      >
                        <span className="acm-lender-name">{l.name}</span>
                        <span className="acm-lender-rate">
                          {l.rate != null ? `${Number(l.rate).toFixed(2)}%` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="acm-select-all-row">
                  <button
                    type="button"
                    className="acm-select-all-link"
                    onClick={handleSelectAllLenders}
                  >
                    {selectedLenders.length === lenderOptions.length
                      ? "Deselect All"
                      : "Select All Lenders"}
                  </button>
                </div>
              </div>

              {/* Row 3: Customer Name & Mobile */}
              <div className="acm-grid-2">
                <div className="acm-form-group">
                  <label className="acm-label">Customer Name</label>
                  <input
                    type="text"
                    className="acm-input"
                    placeholder="Full name"
                    value={acName}
                    onChange={(e) => setAcName(e.target.value)}
                    required
                  />
                </div>

                <div className="acm-form-group">
                  <label className="acm-label">Mobile</label>
                  <input
                    type="tel"
                    className="acm-input"
                    placeholder="10-digit"
                    maxLength={10}
                    value={acMobile}
                    onChange={(e) => setAcMobile(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>

              {/* Row 4: Email (optional) */}
              <div className="acm-form-group">
                <label className="acm-label">
                  Email <span className="acm-label-sub">(optional)</span>
                </label>
                <input
                  type="email"
                  className="acm-input"
                  placeholder="customer@email.com"
                  value={acEmail}
                  onChange={(e) => setAcEmail(e.target.value)}
                />
              </div>

              {/* Row 5: How should we reach the customer? */}
              <div className="acm-form-group">
                <label className="acm-label">How should we reach the customer?</label>
                <div className="acm-reach-row">
                  <button
                    type="button"
                    className={`acm-reach-tab ${acReachMode === "direct" ? "active" : ""}`}
                    onClick={() => setAcReachMode("direct")}
                  >
                    <ArrowRight size={15} style={{ flexShrink: 0 }} /> Reach Customer Directly
                  </button>
                  <button
                    type="button"
                    className={`acm-reach-tab ${acReachMode === "partner" ? "active" : ""}`}
                    onClick={() => setAcReachMode("partner")}
                  >
                    <Users size={15} style={{ flexShrink: 0 }} /> Reach Through Me (Partner)
                  </button>
                </div>
                <div className="acm-reach-notice">
                  {acReachMode === "direct"
                    ? "We’ll contact the customer directly with offers and updates."
                    : "We’ll contact you directly regarding this client's application."}
                </div>
              </div>

              {/* Row 6: Submit Button */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="acm-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Adding Client..." : <><span>Add Client</span><ArrowRight size={16} style={{ marginLeft: 6 }} /></>}
                </button>
              </div>
            </form>
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
              <a href="tel:9217624627" className="cdm-contact-row">
                <div className="cdm-ci" style={{ backgroundColor: "#EEF6FF", color: "#1B4D8E" }}><Phone size={18} /></div>
                <div>
                  <div className="cdm-cl" style={{ fontSize: ".66rem", color: "var(--text2)", textTransform: "uppercase" }}>Phone Support</div>
                  <div className="cdm-cv">92176 24627</div>
                </div>
              </a>
              <a href="mailto:support@finn4sure.com" className="cdm-contact-row">
                <div className="cdm-ci" style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}><Mail size={18} /></div>
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
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          </div>
          <div className="pdash-toast-msg">{toast.message}</div>
          <button className="pdash-toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}
export { BrokerDashboard };
