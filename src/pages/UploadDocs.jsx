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
          <div className="upd-grid">
            
            {/* ── CARD 1: AADHAAR CARD (ALL OPTIONS CONTAINED INSIDE) ── */}
            <div 
              className={`upd-card ${
                aadharMode === "combined" 
                  ? (docs.aadharCombined || (getExistingDoc("aadhar") && getExistingDoc("aadhar")?.status !== "rejected") ? "has-file" : "")
                  : ((docs.aadharFront || getExistingDoc("aadhar_front")) && (docs.aadharBack || getExistingDoc("aadhar_back")) ? "has-file" : "")
              }`}
              style={{ minHeight: "260px" }}
            >
              <div className="upd-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                <IdCard size={28} />
              </div>
              <h4 style={{ marginBottom: "6px" }}>Aadhaar Card</h4>

              {/* Internal Tab Selector */}
              <div className="aadhar-internal-pills">
                <button
                  type="button"
                  className={`aadhar-internal-btn ${aadharMode === "combined" ? "active" : ""}`}
                  onClick={() => setAadharMode("combined")}
                >
                  <FileText size={12} /> Combined (1 File)
                </button>
                <button
                  type="button"
                  className={`aadhar-internal-btn ${aadharMode === "separate" ? "active" : ""}`}
                  onClick={() => setAadharMode("separate")}
                >
                  <Files size={12} /> Separate (2 Files)
                </button>
              </div>

              {aadharMode === "combined" ? (
                /* COMBINED OPTION */
                (() => {
                  const existing = getExistingDoc("aadhar") || getExistingDoc("aadhar_combined");
                  const isRejected = existing?.status === 'rejected';
                  const isUploaded = existing && !isRejected;

                  return (
                    <>
                      <p className="upd-card-desc" style={{ marginBottom: "12px" }}>
                        Upload single PDF or image with both Front & Back copies
                      </p>
                      {isUploaded ? (
                        <div style={{ padding: '8px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <CheckCircle2 size={16} color="#059669" /> {existing.status === 'verified' ? 'Verified' : 'Uploaded'}
                        </div>
                      ) : docs.aadharCombined ? (
                        <div className="upd-file-info">
                          <span className="upd-file-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={14} /> {docs.aadharCombined.name} ({(docs.aadharCombined.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                          <button 
                            type="button" 
                            className="upd-remove-btn" 
                            onClick={() => setDocs(prev => ({ ...prev, aadharCombined: null }))}
                          >
                            &times; Remove
                          </button>
                        </div>
                      ) : (
                        <div className="upd-upload-area">
                          {isRejected && (
                            <div style={{ marginBottom: '6px', padding: '4px 8px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={13} color="#DC2626" /> Rejected, please re-upload
                            </div>
                          )}
                          <label htmlFor="file-aadharCombined" className="upd-select-lbl">
                            Choose File
                          </label>
                          <input 
                            type="file" 
                            id="file-aadharCombined" 
                            className="upd-file-input" 
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileChange("aadharCombined", e.target.files[0], e.target)} 
                          />
                          <span className="upd-drop-lbl">or drag file here (Max 1 MB)</span>
                        </div>
                      )}
                    </>
                  );
                })()
              ) : (
                /* SEPARATE 2 FILES OPTION (Inside the same card) */
                <div className="aadhar-dual-picker-grid">
                  {/* FRONT SIDE */}
                  {(() => {
                    const existingFront = getExistingDoc("aadhar_front");
                    const isRejectedFront = existingFront?.status === 'rejected';
                    const isUploadedFront = existingFront && !isRejectedFront;

                    return (
                      <div className={`aadhar-dual-box ${docs.aadharFront || isUploadedFront ? "has-file" : ""}`}>
                        <span className="aadhar-dual-box-title">Front Side</span>
                        {isUploadedFront ? (
                          <div style={{ padding: '4px 8px', background: '#D1FAE5', color: '#065F46', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} color="#059669" /> Uploaded
                          </div>
                        ) : docs.aadharFront ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1E293B', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {docs.aadharFront.name}
                            </span>
                            <button 
                              type="button" 
                              className="upd-remove-btn" 
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => setDocs(prev => ({ ...prev, aadharFront: null }))}
                            >
                              &times; Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            {isRejectedFront && (
                              <span style={{ color: '#DC2626', fontSize: '0.68rem', fontWeight: 600 }}>Re-upload</span>
                            )}
                            <label htmlFor="file-aadharFront" className="upd-select-lbl" style={{ padding: "4px 10px", fontSize: "0.74rem" }}>
                              Choose
                            </label>
                            <input 
                              type="file" 
                              id="file-aadharFront" 
                              className="upd-file-input" 
                              accept=".pdf,image/*"
                              onChange={(e) => handleFileChange("aadharFront", e.target.files[0], e.target)} 
                            />
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* BACK SIDE */}
                  {(() => {
                    const existingBack = getExistingDoc("aadhar_back");
                    const isRejectedBack = existingBack?.status === 'rejected';
                    const isUploadedBack = existingBack && !isRejectedBack;

                    return (
                      <div className={`aadhar-dual-box ${docs.aadharBack || isUploadedBack ? "has-file" : ""}`}>
                        <span className="aadhar-dual-box-title">Back Side</span>
                        {isUploadedBack ? (
                          <div style={{ padding: '4px 8px', background: '#D1FAE5', color: '#065F46', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} color="#059669" /> Uploaded
                          </div>
                        ) : docs.aadharBack ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1E293B', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {docs.aadharBack.name}
                            </span>
                            <button 
                              type="button" 
                              className="upd-remove-btn" 
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => setDocs(prev => ({ ...prev, aadharBack: null }))}
                            >
                              &times; Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            {isRejectedBack && (
                              <span style={{ color: '#DC2626', fontSize: '0.68rem', fontWeight: 600 }}>Re-upload</span>
                            )}
                            <label htmlFor="file-aadharBack" className="upd-select-lbl" style={{ padding: "4px 10px", fontSize: "0.74rem" }}>
                              Choose
                            </label>
                            <input 
                              type="file" 
                              id="file-aadharBack" 
                              className="upd-file-input" 
                              accept=".pdf,image/*"
                              onChange={(e) => handleFileChange("aadharBack", e.target.files[0], e.target)} 
                            />
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* ── CARD 2: PAN CARD ── */}
            {renderCard(
              "pan",
              "PAN Card",
              "Clear scanned copy of your PAN card",
              <CreditCard size={28} />,
              "pan"
            )}

            {/* ── CARD 3: SALARY SLIPS ── */}
            {renderCard(
              "salarySlip",
              "Salary Slips",
              "Latest 3 months salary slips merged in one PDF",
              <FileText size={28} />,
              "salary slip"
            )}

            {/* ── CARD 4: BANK STATEMENT ── */}
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
