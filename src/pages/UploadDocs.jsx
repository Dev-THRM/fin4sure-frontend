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
  
  const [existingDocs, setExistingDocs] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`/api/client/application-documents/${applicationId}`, { credentials: 'include', headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExistingDocs(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingExisting(false));
  }, [applicationId]);

  const MAX_FILE_SIZE_MB = 1;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const docConfig = [
    { key: "aadhar", title: "Aadhaar Card", icon: "🪪", desc: "Front & back scanned copy in single PDF/Image", type: "aadhar" },
    { key: "pan", title: "PAN Card", icon: "💳", desc: "Clear scanned copy of your PAN card", type: "pan" },
    { key: "salarySlip", title: "Salary Slips", icon: "📄", desc: "Latest 3 months salary slips merged in one PDF", type: "salary slip" },
    { key: "bankStatement", title: "Bank Statement", icon: "🏦", desc: "Latest 6 months bank account statements in PDF", type: "bank statement" },
  ];

  const handleFileChange = (key, file, inputElement = null) => {
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setErrorMsg(`⚠️ "${file.name}" is ${sizeMB} MB, which exceeds the allowed limit of ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`);
        if (inputElement) inputElement.value = "";
        setDocs((prev) => ({ ...prev, [key]: null }));
        return;
      }
      setErrorMsg("");
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

  const isFormValid = docConfig.every(config => {
    const existing = existingDocs.find(d => d.document_type === config.type);
    if (existing && existing.status !== 'rejected') return true;
    return !!docs[config.key];
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Check size limit before sending network request
    for (const [docKey, file] of Object.entries(docs)) {
      if (file && file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setErrorMsg(`⚠️ File "${file.name}" is ${sizeMB} MB, which exceeds the allowed limit of ${MAX_FILE_SIZE_MB} MB. Please compress or select a smaller file.`);
        return;
      }
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      if (docs.aadhar) { formData.append('files', docs.aadhar); formData.append('types', 'aadhar'); }
      if (docs.pan) { formData.append('files', docs.pan); formData.append('types', 'pan'); }
      if (docs.salarySlip) { formData.append('files', docs.salarySlip); formData.append('types', 'salary slip'); }
      if (docs.bankStatement) { formData.append('files', docs.bankStatement); formData.append('types', 'bank statement'); }

      const token = localStorage.getItem("accessToken");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/client/upload-docs/${applicationId}`, {
        method: "POST",
        body: formData,
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        let errorText = "Failed to upload documents";
        try {
          const data = await res.json();
          errorText = data.message || errorText;
        } catch (_) {
          if (res.status === 413) {
            errorText = "The uploaded files exceed the server limit. Please ensure each file is under 1 MB.";
          } else {
            errorText = `Upload failed with status ${res.status}`;
          }
        }
        throw new Error(errorText);
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
          <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0369A1', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
            ℹ️ Maximum allowed file size: <strong>1 MB per document</strong> (PDF, PNG, JPG, JPEG)
          </div>
        </div>

        {errorMsg && (
          <div className="upd-alert-error">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upd-form">
          <div className="upd-grid">
            {docConfig.map((item) => {
              const existing = existingDocs.find(d => d.document_type === item.type);
              const isRejected = existing?.status === 'rejected';
              const isUploaded = existing && !isRejected;
              
              return (
              <div 
                key={item.key} 
                className={`upd-card ${docs[item.key] || isUploaded ? "has-file" : ""}`}
                onDragOver={isUploaded ? undefined : handleDragOver}
                onDrop={isUploaded ? undefined : (e) => handleDrop(e, item.key)}
              >
                <div className="upd-card-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p className="upd-card-desc">{item.desc}</p>

                {isUploaded ? (
                  <div style={{ marginTop: '16px', padding: '10px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    ✅ {existing.status === 'verified' ? 'Verified' : 'Uploaded'}
                  </div>
                ) : docs[item.key] ? (
                  <div className="upd-file-info">
                    <span className="upd-file-name">📄 {docs[item.key].name} ({(docs[item.key].size / (1024 * 1024)).toFixed(2)} MB)</span>
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
                    {isRejected && (
                      <div style={{ marginBottom: '10px', padding: '6px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                        ❌ Rejected, please re-upload
                      </div>
                    )}
                    <label htmlFor={`file-${item.key}`} className="upd-select-lbl">
                      Choose File
                    </label>
                    <input 
                      type="file" 
                      id={`file-${item.key}`} 
                      className="upd-file-input" 
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange(item.key, e.target.files[0], e.target)} 
                    />
                    <span className="upd-drop-lbl">or drag file here (Max 1 MB)</span>
                  </div>
                )}
              </div>
            )})}
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
              className={`upd-submit-btn ${!isFormValid || loading ? 'disabled' : ''}`}
              disabled={!isFormValid || loading}
            >
              {loading ? "Uploading..." : existingDocs.length > 0 ? "Upload Missing Documents" : "Submit Documents"}
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
