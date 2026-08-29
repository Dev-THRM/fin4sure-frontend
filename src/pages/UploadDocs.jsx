import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  IdCard,
  CreditCard,
  FileText,
  Files,
  Landmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./styles/uploadDocs.css";

export default function UploadDocs() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const isPartner = role === "broker" || role === "partner" || Number(role) === 2;
  const targetDashboard = isPartner ? "/broker-dashboard" : "/client-dashboard";

  // Aadhaar upload mode: "combined" (1 file) | "separate" (2 files)
  const [aadharMode, setAadharMode] = useState("combined");

  // Document states
  const [docs, setDocs] = useState({
    aadharCombined: null,
    aadharFront: null,
    aadharBack: null,
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
          // If already uploaded separate front/back, set mode to separate
          const hasFrontOrBack = data.some(d => d.document_type === 'aadhar_front' || d.document_type === 'aadhar_back');
          if (hasFrontOrBack) {
            setAadharMode("separate");
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingExisting(false));
  }, [applicationId]);

  const MAX_FILE_SIZE_MB = 1;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (key, file, inputElement = null) => {
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setErrorMsg(`"${file.name}" is ${sizeMB} MB, which exceeds the allowed limit of ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`);
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
    if (file) {
      handleFileChange(key, file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Check size limit before sending network request
    for (const [docKey, file] of Object.entries(docs)) {
      if (file && file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setErrorMsg(`File "${file.name}" is ${sizeMB} MB, which exceeds the allowed limit of ${MAX_FILE_SIZE_MB} MB. Please compress or select a smaller file.`);
        return;
      }
    }

    setErrorMsg("");
    setLoading(true);

    const formData = new FormData();
    formData.append("application_id", applicationId);

    if (aadharMode === "combined" && docs.aadharCombined) {
      formData.append("aadharCombined", docs.aadharCombined);
      formData.append("types", "aadhar");
    } else if (aadharMode === "separate") {
      if (docs.aadharFront) {
        formData.append("aadharFront", docs.aadharFront);
        formData.append("types", "aadhar_front");
      }
      if (docs.aadharBack) {
        formData.append("aadharBack", docs.aadharBack);
        formData.append("types", "aadhar_back");
      }
    }

    if (docs.pan) {
      formData.append("pan", docs.pan);
      formData.append("types", "pan");
    }
    if (docs.salarySlip) {
      formData.append("salarySlip", docs.salarySlip);
      formData.append("types", "salary slip");
    }
    if (docs.bankStatement) {
      formData.append("bankStatement", docs.bankStatement);
      formData.append("types", "bank statement");
    }

    try {
      const token = localStorage.getItem("accessToken");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/client/upload-docs/${applicationId}`, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
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
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to check existing upload status
  const getExistingDoc = (docType) => {
    return existingDocs.find(d => d.document_type === docType);
  };

  // Validation
  const isAadharValid = aadharMode === "combined" 
    ? (docs.aadharCombined || getExistingDoc("aadhar")?.status !== "rejected" && getExistingDoc("aadhar"))
    : ((docs.aadharFront || getExistingDoc("aadhar_front")?.status !== "rejected" && getExistingDoc("aadhar_front")) &&
       (docs.aadharBack || getExistingDoc("aadhar_back")?.status !== "rejected" && getExistingDoc("aadhar_back")));

  const isFormValid = Object.values(docs).some((f) => f !== null);

  // Render a document card
  const renderCard = (key, title, desc, icon, docType) => {
    const existing = getExistingDoc(docType);
    const isRejected = existing?.status === 'rejected';
    const isUploaded = existing && !isRejected;

    return (
      <div 
        key={key} 
        className={`upd-card ${docs[key] || isUploaded ? "has-file" : ""}`}
        onDragOver={isUploaded ? undefined : handleDragOver}
        onDrop={isUploaded ? undefined : (e) => handleDrop(e, key)}
      >
        <div className="upd-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <h4>{title}</h4>
        <p className="upd-card-desc">{desc}</p>

        {isUploaded ? (
          <div style={{ marginTop: '16px', padding: '10px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#059669" /> {existing.status === 'verified' ? 'Verified' : 'Uploaded'}
          </div>
        ) : docs[key] ? (
          <div className="upd-file-info">
            <span className="upd-file-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={14} /> {docs[key].name} ({(docs[key].size / (1024 * 1024)).toFixed(2)} MB)
            </span>
            <button 
              type="button" 
              className="upd-remove-btn" 
              onClick={() => setDocs(prev => ({ ...prev, [key]: null }))}
            >
              &times; Remove
            </button>
          </div>
        ) : (
          <div className="upd-upload-area">
            {isRejected && (
              <div style={{ marginBottom: '10px', padding: '6px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <XCircle size={14} color="#DC2626" /> Rejected, please re-upload
              </div>
            )}
            <label htmlFor={`file-${key}`} className="upd-select-lbl">
              Choose File
            </label>
            <input 
              type="file" 
              id={`file-${key}`} 
              className="upd-file-input" 
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(key, e.target.files[0], e.target)} 
            />
            <span className="upd-drop-lbl">or drag file here (Max 1 MB)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="upd-wrap">
      <div className="upd-container">
        {/* Header */}
        <div className="upd-header">
          <span className="upd-tag" style={{ display: 'inline-block', marginBottom: '8px', padding: '4px 12px', background: '#EFF6FF', color: '#1E40AF', borderRadius: '6px', fontSize: '.8rem', fontWeight: 700 }}>
            Application #{applicationId}
          </span>
          <h2>Upload Compulsory Documents</h2>
          <p>Please upload all the required documents to progress your loan application to credit evaluation.</p>
          <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0369A1', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
            <Info size={15} /> Maximum allowed file size: <strong>1 MB per document</strong> (PDF, PNG, JPG, JPEG)
          </div>
        </div>

        {errorMsg && (
          <div className="upd-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upd-form">
          
          {/* ── AADHAAR UPLOAD OPTION BAR ── */}
          <div className="aadhar-option-box">
            <div className="aadhar-option-header">
              <div className="aadhar-option-title">
                <IdCard size={18} color="var(--teal)" />
                <span>Aadhaar Card Upload Method:</span>
              </div>
              <div className="aadhar-tab-pills">
                <button
                  type="button"
                  className={`aadhar-tab-btn ${aadharMode === "combined" ? "active" : ""}`}
                  onClick={() => setAadharMode("combined")}
                >
                  <FileText size={14} /> 1. Combined PDF (Front + Back in 1 File)
                </button>
                <button
                  type="button"
                  className={`aadhar-tab-btn ${aadharMode === "separate" ? "active" : ""}`}
                  onClick={() => setAadharMode("separate")}
                >
                  <Files size={14} /> 2. Separate 2 Files (Front & Back)
                </button>
              </div>
            </div>
          </div>

          <div className="upd-grid">
            {/* Aadhaar Cards based on active tab */}
            {aadharMode === "combined" ? (
              renderCard(
                "aadharCombined",
                "Aadhaar Card (Combined File)",
                "Single PDF or image containing both Front & Back copies",
                <IdCard size={28} />,
                "aadhar"
              )
            ) : (
              <>
                {renderCard(
                  "aadharFront",
                  "Aadhaar Card (Front)",
                  "Front side copy showing photo & Aadhaar number",
                  <IdCard size={28} />,
                  "aadhar_front"
                )}
                {renderCard(
                  "aadharBack",
                  "Aadhaar Card (Back)",
                  "Back side copy showing address",
                  <IdCard size={28} />,
                  "aadhar_back"
                )}
              </>
            )}

            {/* Other Mandatory Documents */}
            {renderCard(
              "pan",
              "PAN Card",
              "Clear scanned copy of your PAN card",
              <CreditCard size={28} />,
              "pan"
            )}
            {renderCard(
              "salarySlip",
              "Salary Slips",
              "Latest 3 months salary slips merged in one PDF",
              <FileText size={28} />,
              "salary slip"
            )}
            {renderCard(
              "bankStatement",
              "Bank Statement",
              "Latest 6 months bank account statements in PDF",
              <Landmark size={28} />,
              "bank statement"
            )}
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
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <CheckCircle2 size={54} color="#059669" />
            </div>
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
export { UploadDocs };
