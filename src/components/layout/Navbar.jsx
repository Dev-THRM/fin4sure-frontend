import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Info, Home, Calculator, User } from "lucide-react";
import logo from "../../assets/images/logo.jpeg";
import { useAuth } from "../../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportPhone, setSupportPhone] = useState("1800-123-4567");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/location/public-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.support_phone || data.rm_details?.mob)) {
          setSupportPhone(data.support_phone || data.rm_details.mob);
        }
      })
      .catch(() => {});

    const handlePhoneUpdate = (e) => {
      if (e.detail) {
        setSupportPhone(e.detail);
      }
    };
    window.addEventListener("rm_phone_updated", handlePhoneUpdate);
    return () => window.removeEventListener("rm_phone_updated", handlePhoneUpdate);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (role === "admin" || user?.role === "admin" || user?.email === "admin@finn4sure.com") return "/admin-dashboard";
    if (role === "broker" || role === "partner" || user?.role === "broker" || user?.role === "partner") return "/broker-dashboard";
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
          <a className="nav-phone" href={`tel:${(supportPhone || '').replace(/\D/g, '')}`}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            {supportPhone || "1800-123-4567"}
          </a>
          {isAuthenticated ? (
            <button className="nav-cta" onClick={handleLogout}>Sign Out</button>
          ) : (
            <button className="nav-cta" onClick={() => navigate("/login")}>Apply Now</button>
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
          <Info size={15} strokeWidth={2} style={{ opacity: 0.85 }} />
          <span>About Us</span>
        </NavLink>
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Home size={15} strokeWidth={2} style={{ opacity: 0.85 }} />
          <span>Home</span>
        </NavLink>
        <NavLink 
          to="/EMI-calculator" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Calculator size={15} strokeWidth={2} style={{ opacity: 0.85 }} />
          <span>EMI Calculator</span>
        </NavLink>
        <NavLink 
          to="/partner" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Users size={15} strokeWidth={2} style={{ opacity: 0.85 }} />
          <span>Partner</span>
        </NavLink>
        <NavLink 
          to="/loans" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Banknote size={15} strokeWidth={2} style={{ opacity: 0.85 }} />
          <span>Loans</span>
        </NavLink>

        {isAuthenticated ? (
          <NavLink 
            to={getDashboardPath()}
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Key size={15} strokeWidth={2} style={{ opacity: 0.85 }} />
            <span>Dashboard ({role})</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/login" 
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={15} strokeWidth={2} style={{ opacity: 0.85 }} />
            <span>Customer Login</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}
