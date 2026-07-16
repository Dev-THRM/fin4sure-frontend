import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/logo.jpeg";
import { useAuth } from "../../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const { role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    </>
  );
}
