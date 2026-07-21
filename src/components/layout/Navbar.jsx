import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/logo.jpeg";
import { useAuth } from "../../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const { role, isAuthenticated, logout, login, fetchProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user);
        await fetchProfile();
        setShowAdminModal(false);
        setAdminPassword("");
        setAdminError("");
        navigate("/admin-dashboard");
      } else {
        const errData = await res.json();
        setAdminError(errData.message || "Invalid admin password");
      }
    } catch (err) {
      setAdminError("Unable to connect to auth server");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin-dashboard";
    if (role === "broker" || role === "partner") return "/broker-dashboard";
    return "/client-dashboard";
  };

  return (
    <>
      {/* ═══ ROW 1: Logo bar ═══ */}
      <header className="navbar-top">
        <Link to="/" className="nav-logo">
          <img src={logo} className="nav-logo-img" alt="Finn4sure Logo" />
          <div className="nav-logo-name">
            <span className="nl-finn">Finn</span>
            <span className="nl-4">4</span>
            <span className="nl-sure">sure</span>
          </div>
        </Link>
        <div className="nav-top-right">
          <a className="nav-phone" href="tel:9910507574">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            99105 07574
          </a>
          {isAuthenticated ? (
            <button className="nav-cta" onClick={handleLogout}>Sign Out</button>
          ) : (
            <div className="nav-cta-container">
              <button className="nav-cta" onClick={() => navigate("/login")}>Apply Now</button>
              <button 
                className="nav-admin-gear" 
                onClick={() => setShowAdminModal(true)}
                title="Admin Access"
                aria-label="Admin Access"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="10" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 18a7 7 0 017-6.5" />
                  <circle cx="18" cy="17" r="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 13.5v1.2m0 4.6v1.2m-3.8-3.5h1.2m4.6 0h1.2m-3.4-3.4l-.8.8m4.4 4.4l-.8.8m-4.4 0l.8.8m4.4-4.4l.8.8" />
                </svg>
              </button>
            </div>
          )}

          {/* Hamburger for mobile */}
          <button 
            className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* ═══ ROW 2: Tab ribbon ═══ */}
      <nav className={`navbar-ribbon ${mobileMenuOpen ? 'open' : ''}`}>
         <NavLink 
          to="/about" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          🏢 About Us
        </NavLink>
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          🏠 Home
        </NavLink>
        <NavLink 
          to="/EMI-calculator" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          🧮 EMI Calculator
        </NavLink>
        <NavLink 
          to="/loans" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          📈 Loans
        </NavLink>
        <NavLink 
          to="/partner" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          🤝 Partner 
        </NavLink>

        {isAuthenticated ? (
          <NavLink 
            to={getDashboardPath()}
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🔑 Dashboard ({role})
          </NavLink>
        ) : (
          <NavLink 
            to="/login" 
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🔑 Sign In
          </NavLink>
        )}
      </nav>

      {showAdminModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-icon-container">
              <div className="admin-modal-icon-bg">
                <svg width="24" height="24" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: 'auto' }}>
                  <circle cx="10" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 18a7 7 0 017-6.5" />
                  <circle cx="18" cy="17" r="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 13.5v1.2m0 4.6v1.2m-3.8-3.5h1.2m4.6 0h1.2m-3.4-3.4l-.8.8m4.4 4.4l-.8.8m-4.4 0l.8.8m4.4-4.4l.8.8" />
                </svg>
              </div>
            </div>
            
            <h2 className="admin-modal-title">Admin Access</h2>
            <p className="admin-modal-subtitle">Finn4sure Control Panel</p>
            
            <form onSubmit={handleAdminSubmit} className="admin-modal-form">
              <div className="admin-modal-input-wrapper">
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setAdminError("");
                  }}
                  className={`admin-modal-input ${adminError ? 'error' : ''}`}
                  autoFocus
                />
              </div>
              
              {adminError && <p className="admin-modal-error-text">{adminError}</p>}
              
              <button type="submit" className="admin-modal-submit-btn">
                Sign In &rarr;
              </button>
              
              <button 
                type="button" 
                className="admin-modal-cancel-btn"
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminPassword("");
                  setAdminError("");
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
