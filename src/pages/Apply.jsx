import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/apply.css";

export default function Apply() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  // Form Fields State
  const [product, setProduct] = useState(productId || "");
  const [loanAmount, setLoanAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanTypes, setLoanTypes] = useState([]);
  const [lenders, setLenders] = useState([]);

  // UI Status State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch actual loan types from DB
  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        const res = await fetch("/api/loan-types");
        const data = await res.json();
        if (data.success) {
          setLoanTypes(data.data);
          // If no product pre-selected via URL, default to first available
          if (!productId && data.data.length > 0) {
            setProduct(data.data[0].short_id);
          }
        }
      } catch (err) {
        console.error("Error fetching loan types:", err);
      }
    };

    const fetchLenders = async () => {
      try {
        const res = await fetch("/api/lenders");
        const data = await res.json();
        if (data.success) {
          setLenders(data.data);
        }
      } catch (err) {
        console.error("Error fetching lenders:", err);
      }
    };

    fetchLoanTypes();
    fetchLenders();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (selectedLenders.length < 2) {
      setError("Please select at least 2 preferred lenders.");
      return;
    }

    if (!product) {
      setError("Please select a loan type.");
      return;
    }

    if (!loanAmount || !tenure) {
      setError("Please fill out loan amount and duration.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const res = await fetch(
        "/api/client/apply-loan",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product,
            loanAmount: parseFloat(loanAmount),
            tenure: parseInt(tenure),
            selectedLenders: selectedLenders,
            loan_purpose: loanPurpose
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Application failed");
      }

      setSuccess("Application submitted successfully!");
      
      // Auto-navigate to dashboard to track application status
      setTimeout(() => {
        navigate("/client-dashboard");
      }, 2500);

    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = loanTypes.find((item) => item.short_id === product);

  return (
    <div className="apply-wrap">
      {/* ═══ APPLY HERO HEADER ═══ */}
      <div className="apply-header">
        <div className="apply-header-inner">
          <button className="apply-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="apply-eyebrow">✦ SECURE FORM</div>
          <div className="apply-head-title">
            <h1>Start your loan application</h1>
            <p>
              Submit your credit parameters securely. We'll map your profile to 30+ lenders instantly.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ FORM CONTAINER ═══ */}
      <div className="apply-body">
        {!isAuthenticated ? (
          <div className="apply-panel" style={{ textAlign: "center" }}>
            <div
              className="login-loan-banner"
              style={{ color: "#B45309", background: "#FFFBEB", borderColor: "#FDE68A", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}
            >
              ⚠️ You must be signed in to submit a loan application.
            </div>
            <Link to="/login" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", width: "auto", padding: "12px 30px" }}>
              Login to Continue
            </Link>
          </div>
        ) : success ? (
          <div className="apply-panel">
            <div className="apply-success">
              <div className="asx-icon">🎉</div>
              <h3>Application Submitted!</h3>
              <p>
                Your application for <strong>{selectedProduct?.name || product}</strong> has been received successfully. We are redirecting you to your dashboard to track progress.
              </p>
            </div>
          </div>
        ) : (
          <div className="apply-panel">
            <div className="apply-h2">Application Form</div>
            <div className="apply-sub">Provide your credentials below to initialize verification.</div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm" style={{ marginBottom: "20px", border: "1px solid #FECACA" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Applicant detail banner (autofilled) */}
            <div className="apply-autofill-banner">
              <h3>Primary Applicant Details</h3>
              <div className="apply-autofill-grid">
                <div className="apply-autofill-item">
                  <span className="lbl">Name</span>
                  <span className="val">{user?.name || "-"}</span>
                </div>
                <div className="apply-autofill-item">
                  <span className="lbl">Mobile</span>
                  <span className="val">{user?.number || "-"}</span>
                </div>
                <div className="apply-autofill-item">
                  <span className="lbl">Email</span>
                  <span className="val">{user?.email || "-"}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="apply-form">
              {/* Product Select field */}
              <div className="apply-form-group">
                <label htmlFor="product">Requested Loan Asset *</label>
                <div className="input-wrap" style={{ padding: "0 6px" }}>
                  <select
                    id="product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    required
                    style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".92rem", fontWeight: "600", color: "var(--navy)" }}
                  >
                    <option value="">Select Asset Type</option>
                    {loanTypes.map((loan) => (
                      <option key={loan.id} value={loan.short_id}>
                        {loan.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loan Amount & Tenure Row */}
              <div className="apply-form-row">
                <div className="apply-form-group">
                  <label htmlFor="loanAmount">Loan Amount (₹) *</label>
                  <div className="input-wrap">
                    <span className="icon">💰</span>
                    <input
                      id="loanAmount"
                      type="number"
                      placeholder="e.g. 500000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="apply-form-group">
                  <label htmlFor="tenure">Loan Duration (Months) *</label>
                  <div className="input-wrap">
                    <span className="icon">⏳</span>
                    <input
                      id="tenure"
                      type="number"
                      placeholder="e.g. 60"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Loan Purpose Row */}
              <div className="apply-form-group">
                <label htmlFor="loanPurpose">Loan Purpose *</label>
                <div className="input-wrap">
                  <span className="icon">📝</span>
                  <input
                    id="loanPurpose"
                    type="text"
                    placeholder="e.g. Home Renovation, Medical Emergency"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Preferred Lender Row */}
              <div className="apply-form-group">
                <label>Preferred Lenders (Select at least 2) *</label>
                <div className="bl-lender-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                  {lenders.map((lender) => {
                    const isSel = selectedLenders.includes(lender.id);
                    return (
                      <div 
                        key={lender.id} 
                        className={`bl-lender ${isSel ? 'sel' : ''}`} 
                        onClick={() => {
                          setSelectedLenders(prev => 
                            prev.includes(lender.id) ? prev.filter(id => id !== lender.id) : [...prev, lender.id]
                          );
                        }}
                        style={{ 
                          display: 'flex', alignItems: 'center', padding: '12px 16px', 
                          border: `1.5px solid ${isSel ? '#1D4ED8' : '#e2e8f0'}`, 
                          borderRadius: '12px', cursor: 'pointer', background: isSel ? '#EFF6FF' : '#fff',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          width: '20px', height: '20px', borderRadius: '5px', 
                          border: `1.5px solid ${isSel ? '#1D4ED8' : '#cbd5e1'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginRight: '12px', background: isSel ? '#1D4ED8' : '#fff',
                          color: '#fff', fontSize: '12px', fontWeight: 'bold'
                        }}>
                          {isSel ? '✓' : ''}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          {lender.logo ? (
                            <img src={lender.logo} alt={lender.name} style={{ width: '20px', height: '20px', marginRight: '8px', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ marginRight: '8px' }}>🏦</span>
                          )}
                          <span style={{ fontWeight: '600', color: 'var(--navy)' }}>{lender.name}</span>
                        </div>
                        <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: '600' }}>
                          {lender.type === 'psu' ? 'PSU' : 'Private'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ height: "46px", marginTop: "12px" }}
              >
                {loading ? "Submitting Application..." : "Submit Loan Application →"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export { Apply };
