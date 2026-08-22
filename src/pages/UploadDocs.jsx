import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/uploadDocs.css";

export default function UploadDocs() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const isPartner = role === "broker" || role === "partner" || Number(role) === 2;
  const targetDashboard = isPartner ? "/broker-dashboard" : "/client-dashboard";

  // Document states
  const [docs, setDocs] = useState({
    aadhar: null,
    pan: null,
    salarySlip: null,
    bankStatement: null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const docConfig = [
    { key: "aadhar", title: "Aadhaar Card", icon: "🪪", desc: "Front & back scanned copy in single PDF/Image", type: "aadhar" },
    { key: "pan", title: "PAN Card", icon: "💳", desc: "Clear scanned copy of your PAN card", type: "pan" },
    { key: "salarySlip", title: "Salary Slips", icon: "📄", desc: "Latest 3 months salary slips merged in one PDF", type: "salary slip" },
    { key: "bankStatement", title: "Bank Statement", icon: "🏦", desc: "Latest 6 months bank account statements in PDF", type: "bank statement" },
  ];

  const handleFileChange = (key, file) => {
    if (file) {
      setDocs((prev) => ({ ...prev, [key]: file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, key) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(key, file);
  };

  const isFormValid = docs.aadhar && docs.pan && docs.salarySlip && docs.bankStatement;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // Mocking document upload with filenames
      const filesPayload = [
        { type: "aadhar", name: docs.aadhar.name },
        { type: "pan", name: docs.pan.name },
        { type: "salary slip", name: docs.salarySlip.name },
        { type: "bank statement", name: docs.bankStatement.name },
      ];

      const res = await fetch(`/api/client/upload-docs/${applicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesPayload }),
        // Include credentials for session cookie authentication
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload documents");
      }

      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upd-wrap">
      <div className="upd-container">
        <div className="upd-header">
          <h2>Upload Compulsory Documents</h2>
          <p>Please upload all the required documents to progress your loan application to credit evaluation.</p>
        </div>

        {errorMsg && (
          <div className="upd-alert-error">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upd-form">
          <div className="upd-grid">
            {docConfig.map((item) => (
              <div 
                key={item.key} 
                className={`upd-card ${docs[item.key] ? "has-file" : ""}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.key)}
              >
                <div className="upd-card-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p className="upd-card-desc">{item.desc}</p>

                {docs[item.key] ? (
                  <div className="upd-file-info">
                    <span className="upd-file-name">📄 {docs[item.key].name}</span>
                    <button 
                      type="button" 
                      className="upd-remove-btn" 
                      onClick={() => setDocs(prev => ({ ...prev, [item.key]: null }))}
                    >
                      &times; Remove
                    </button>
                  </div>
                ) : (
                  <div className="upd-upload-area">
                    <label htmlFor={`file-${item.key}`} className="upd-select-lbl">
                      Choose File
                    </label>
                    <input 
                      type="file" 
                      id={`file-${item.key}`} 
                      className="upd-file-input" 
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange(item.key, e.target.files[0])} 
                    />
                    <span className="upd-drop-lbl">or drag file here</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="upd-footer-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate(targetDashboard)}
              disabled={loading}
              style={{ padding: "12px 28px" }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!isFormValid || loading}
              style={{ padding: "12px 32px", opacity: isFormValid ? 1 : 0.6 }}
            >
              {loading ? "Uploading..." : "Submit Documents →"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="cd-modal">
          <div className="cd-modal-card" style={{ textAlign: "center", padding: "36px 24px" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", fontWeight: "700", color: "var(--navy)", marginBottom: "8px" }}>
              Documents Submitted!
            </h3>
            <p style={{ fontSize: ".85rem", color: "var(--text2)", lineHeight: "1.6", marginBottom: "24px" }}>
              All compulsory documents have been successfully uploaded. Your application has now progressed to the <strong>Credit</strong> stage.
            </p>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => navigate(targetDashboard)}
              style={{ width: "100%", height: "44px" }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
