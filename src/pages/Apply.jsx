import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { LOAN_PRODUCTS } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { states, districtsByState } from "../components/Statedata";
import "./styles/apply.css";

export default function Apply() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  // Form Fields State
  const [product, setProduct] = useState(productId || "");
  const [pan, setPan] = useState("");
  const [dob, setdob] = useState("");
  const [address, setaddress] = useState("");
  const [pincode, setpincode] = useState("");
  const [state, setstate] = useState("");
  const [district, setdistrict] = useState("");

  // UI Status State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  // Pre-fill profile data on login status
  useEffect(() => {
    if (user) {
      setdob(user.dob || "");
      setaddress(user.address || "");
      setpincode(user.pincode || "");
      setstate(user.state || "");
      setdistrict(user.district || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!product) {
      setError("Please select a loan type.");
      return;
    }

    if (!dob || !address || !state || !district || !pincode) {
      setError("Please fill out all address and contact details.");
      return;
    }

    const cleanPAN = pan.trim().toUpperCase();
    if (!PAN_REGEX.test(cleanPAN)) {
      setError("Enter valid PAN (e.g. ABCDE1234F).");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/client/apply-loan",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pan: cleanPAN,
            product,
            dob,
            address,
            state,
            district,
            pincode,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Application failed");
      }

      setSuccess("Application submitted successfully!");
      setPan("");
      
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

  const selectedProduct = LOAN_PRODUCTS.find((item) => item.id === product);

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
              Submit your credit parameters and address info securely. We'll map your profile to 30+ lenders instantly.
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
              {/* DOB & ADDRESS ROW */}
              <div className="apply-form-row">
                <div className="apply-form-group">
                  <label htmlFor="dob">Date of Birth *</label>
                  <div className="input-wrap">
                    <span className="icon">📅</span>
                    <input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setdob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="apply-form-group">
                  <label htmlFor="pincode">City Pincode *</label>
                  <div className="input-wrap">
                    <span className="icon">📍</span>
                    <input
                      id="pincode"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 110001"
                      value={pincode}
                      onChange={(e) => setpincode(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Full Address */}
              <div className="apply-form-group">
                <label htmlFor="address">Residential Address *</label>
                <div className="input-wrap">
                  <span className="icon">🏠</span>
                  <input
                    id="address"
                    type="text"
                    placeholder="Flat / Building / Street name"
                    value={address}
                    onChange={(e) => setaddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* State & District Row */}
              <div className="apply-form-row">
                <div className="apply-form-group">
                  <label htmlFor="state">State *</label>
                  <div className="input-wrap" style={{ padding: "0 6px" }}>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => {
                        setstate(e.target.value);
                        setdistrict("");
                      }}
                      required
                      style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".92rem", fontWeight: "600", color: "var(--navy)" }}
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="apply-form-group">
                  <label htmlFor="district">District *</label>
                  <div className="input-wrap" style={{ padding: "0 6px" }}>
                    <select
                      id="district"
                      value={district}
                      disabled={!state}
                      onChange={(e) => setdistrict(e.target.value)}
                      required
                      style={{ border: "none", outline: "none", background: "transparent", width: "100%", height: "100%", fontSize: ".92rem", fontWeight: "600", color: "var(--navy)" }}
                    >
                      <option value="">Select District</option>
                      {state &&
                        districtsByState[state]?.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product & PAN Row */}
              <div className="apply-form-row">
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
                      {LOAN_PRODUCTS.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                          {loan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="apply-form-group">
                  <label htmlFor="pan">PAN Card Number *</label>
                  <div className="input-wrap">
                    <span className="icon">💳</span>
                    <input
                      id="pan"
                      type="text"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
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
