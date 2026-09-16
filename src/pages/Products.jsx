import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Car,
  FileText,
  Landmark,
  Check,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  User,
  Mail,
  Key,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './styles/stepper.css';

const LOAN_TYPE_MAPPING = {
  'Home Loan': { id: 'home', icon: <Home size={24} />, desc: 'Buy, build or renovate your home' },
  'Loan Against Property': { id: 'lap', icon: <Building2 size={24} />, desc: 'Leverage your residential/commercial property' },
  'Personal Loan': { id: 'personal', icon: <CreditCard size={24} />, desc: 'Quick funds for personal needs' },
  'Business Loan': { id: 'business', icon: <Briefcase size={24} />, desc: 'Working capital and business expansion' },
  'Vehicle Loan': { id: 'vehicle', icon: <Car size={24} />, desc: 'Finance your new or used vehicle' }
};

export default function Products() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loanType, setLoanType] = useState('');
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [loanTypesData, setLoanTypesData] = useState([]);
  const [lendersData, setLendersData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step 3 Login/Apply form states
  const [loanAmtVal, setLoanAmtVal] = useState("50");
  const [loanAmtUnit, setLoanAmtUnit] = useState(100000); // 100000 = Lakh, 10000000 = Crore
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otpChannel, setOtpChannel] = useState("mobile"); // "mobile" | "email"
  const [showOtpVerify, setShowOtpVerify] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        navigate('/client-dashboard', {
          state: {
            appSubmitted: true,
            appId: submittedData?.appId,
            loanName: submittedData?.loanName,
            lenderNames: submittedData?.lenderNames
          }
        });
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [step, submittedData, navigate]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [loanTypesRes, lendersRes] = await Promise.all([
          axios.get('/api/loan-types').catch(() => ({ data: { success: false } })),
          axios.get('/api/lenders').catch(() => ({ data: { success: false } }))
        ]);
        
        if (loanTypesRes.data?.success) {
          const mappedTypes = loanTypesRes.data.data.map(lt => {
            const mapping = LOAN_TYPE_MAPPING[lt.name] || { id: lt.short_id || lt.name.toLowerCase().replace(/\s+/g, ''), icon: <FileText size={24} />, desc: 'Apply for ' + lt.name };
            return {
              id: mapping.id,
              dbName: lt.name,
              icon: mapping.icon,
              title: lt.name,
              desc: mapping.desc
            };
          });
          setLoanTypesData(mappedTypes);
        }
        
        const apiLenders = (lendersRes.data?.success && Array.isArray(lendersRes.data.data)) ? lendersRes.data.data : [];
        setLendersData(apiLenders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLoanTypeSelect = (typeId) => {
    setLoanType(typeId);
    setSelectedLenders([]);
  };

  const toggleLender = (lenderId) => {
    setSelectedLenders(prev => 
      prev.includes(lenderId) ? prev.filter(l => l !== lenderId) : [...prev, lenderId]
    );
  };

  const normalizeTypeKey = (typeStr) => {
    const s = String(typeStr || '').toLowerCase().replace(/[^a-z]/g, '');
    if (s.includes('home')) return 'home';
    if (s.includes('lap') || s.includes('property')) return 'lap';
    if (s.includes('personal')) return 'personal';
    if (s.includes('business')) return 'business';
    if (s.includes('vehicle') || s.includes('car') || s.includes('auto')) return 'vehicle';
    if (s.includes('education')) return 'education';
    return s;
  };

  const getRateForLoanType = (lender, selectedTypeId) => {
    if (!lender) return 'N/A';
    const normKey = normalizeTypeKey(selectedTypeId);
    
    if (lender.loanRates && lender.loanRates.length > 0) {
      const rateData = lender.loanRates.find(r => {
        if (!r) return false;
        const rateNorm = normalizeTypeKey(r.type?.short_id || r.type?.name || '');
        return rateNorm === normKey;
      });
      if (rateData && rateData.min_rate && parseFloat(rateData.min_rate) > 0) {
        return parseFloat(rateData.min_rate).toFixed(2);
      }
    }

    return 'N/A';
  };

  const getLenderCategoryLabel = (lender) => {
    const name = String(lender.name || '').toUpperCase();
    const type = String(lender.type || '').toLowerCase();
    if (
      type === 'psu' ||
      name.includes('SBI') ||
      name.includes('STATE BANK') ||
      name.includes('PNB') ||
      name.includes('PUNJAB NATIONAL') ||
      name.includes('BOB') ||
      name.includes('BANK OF BARODA') ||
      name.includes('CANARA') ||
      name.includes('UNION BANK') ||
      name.includes('UBI') ||
      name.includes('BANK OF INDIA') ||
      name.includes('BOI') ||
      name.includes('INDIAN BANK') ||
      name.includes('CENTRAL BANK') ||
      name.includes('UCO') ||
      name.includes('MAHARASHTRA') ||
      name.includes('PUNJAB & SIND') ||
      name.includes('IDBI')
    ) {
      return 'PSU Bank';
    }
    if (
      type === 'nbfc' ||
      name.includes('HOUSING') ||
      name.includes('FINSERV') ||
      name.includes('FINANCE') ||
      name.includes('CAPITAL') ||
      name.includes('MUTHOOT') ||
      name.includes('MANAPPURAM') ||
      name.includes('CHOLA') ||
      name.includes('PIRAMAL') ||
      name.includes('AAVAS') ||
      name.includes('HOMEFIRST') ||
      name.includes('NAVI')
    ) {
      return 'NBFC / HFC';
    }
    if (type === 'small' || type === 'sfb' || name.includes('SMALL FINANCE') || name.includes('SFB')) {
      return 'SFB Bank';
    }
    return 'Private Bank';
  };

  const handleSendOtp = async () => {
    if (otpSending) return;
    setOtpError('');
    if (!fullName.trim()) {
      setOtpError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpSending(true);
    try {
      if (otpChannel === 'email') {
        const res = await axios.post('/api/auth/send-email-otp', {
          email: email.trim().toLowerCase(),
          purpose: 'registration',
          number: mobile.trim()
        });
        if (res.data?.success || res.status === 200) {
          setShowOtpVerify(true);
          setOtpTimer(30);
        } else {
          setOtpError(res.data?.message || 'Failed to send OTP. Please try again.');
        }
      } else {
        const res = await axios.post('/api/auth/send-otp', {
          number: mobile.trim()
        });
        if (res.data?.success || res.status === 200) {
          setShowOtpVerify(true);
          setOtpTimer(30);
        } else {
          setOtpError(res.data?.message || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpAndSubmit = async () => {
    if (otpVerifying) return;
    setOtpError('');
    if (!otpInput || otpInput.trim().length < 4) {
      setOtpError('Please enter the OTP.');
      return;
    }

    setOtpVerifying(true);
    try {
      if (otpChannel === 'email') {
        await axios.post('/api/auth/verify-email-otp', {
          email: email.trim().toLowerCase(),
          otp: otpInput.trim()
        });
      } else {
        await axios.post('/api/auth/verify-otp', {
          number: mobile.trim(),
          otp: otpInput.trim()
        });
      }

      const calculatedAmount = Math.round((parseFloat(loanAmtVal) || 50) * loanAmtUnit);
      const regRes = await axios.post('/api/auth/register-borrower', {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        number: mobile.trim(),
        loanAmount: calculatedAmount,
        tenure: 12,
        loanPurpose: `${loanTypesData.find((t) => t.id === loanType)?.title || loanType} Application`,
        loanType: loanType,
        selectedLenders: selectedLenders
      }, { withCredentials: true });

      const resData = regRes.data;
      if (resData) {
        if (resData.accessToken) {
          localStorage.setItem('accessToken', resData.accessToken);
        }
        login({
          _id: resData._id || resData.id,
          name: resData.name || fullName.trim(),
          email: resData.email || email.trim().toLowerCase(),
          number: resData.number || mobile.trim(),
          role: 'borrower'
        });

        const targetLenderNames = selectedLenders.map((id) => {
          const l = lendersData.find((x) => x.id === id);
          return l ? l.name : id;
        });

        setSubmittedData({
          appId: resData.applicationId || `APP-${Date.now().toString().slice(-5)}`,
          loanName: loanTypesData.find((t) => t.id === loanType)?.title || 'Loan',
          lenderNames: targetLenderNames,
          amount: calculatedAmount
        });

        setStep(4);
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setOtpError(err.response?.data?.message || err.message || 'Verification or submission failed.');
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <div className="mode-badge borrower" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={16} /> Borrower Application
        </div>
        
        <div className="form-card">
          {/* Step Progress Bar */}
          <div className="steps-bar">
            <div className="step-item">
              <div className={`step-circle ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>1</div>
              <div className={`step-label ${step >= 1 ? 'active' : ''}`}>Loan Type</div>
            </div>
            <div className="step-connector">
              <div className="fill" style={{ width: step > 1 ? '100%' : '0%' }}></div>
            </div>
            
            <div className="step-item">
              <div className={`step-circle ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>2</div>
              <div className={`step-label ${step >= 2 ? 'active' : ''}`}>Lenders</div>
            </div>
            <div className="step-connector">
              <div className="fill" style={{ width: step > 2 ? '100%' : '0%' }}></div>
            </div>
            
            <div className="step-item">
              <div className={`step-circle ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>3</div>
              <div className={`step-label ${step >= 3 ? 'active' : ''}`}>Login</div>
            </div>
            <div className="step-connector">
              <div className="fill" style={{ width: step > 3 ? '100%' : '0%' }}></div>
            </div>
            
            <div className="step-item">
              <div className={`step-circle ${step >= 4 ? 'active' : ''} ${step > 4 ? 'done' : ''}`}>4</div>
              <div className={`step-label ${step >= 4 ? 'active' : ''}`}>Done</div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading data...</div>
          ) : (
            <>
              {/* Step 1: Loan Type */}
              {step === 1 && (
                <div>
                  <div className="form-title">What are you looking for?</div>
                  <div className="form-subtitle">Select the type of loan you need</div>
                  
                  <div className="bl-type-grid">
                    {loanTypesData.map(lt => (
                      <div key={lt.id} className={`bl-type-card ${loanType === lt.id ? 'sel' : ''}`} onClick={() => handleLoanTypeSelect(lt.id)}>
                        <div className="bl-type-ic">{lt.icon}</div>
                        <div className="bl-type-txt">
                          <div className="bl-type-name">{lt.title}</div>
                          <div className="bl-type-desc">{lt.desc}</div>
                        </div>
                        <div className="bl-type-arrow">→</div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <button 
                      className="btn-primary bl-continue" 
                      disabled={!loanType} 
                      onClick={() => setStep(2)}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Lenders */}
              {step === 2 && (() => {
                const currentLoanTitle = loanTypesData.find(t => t.id === loanType)?.title || 'Home Loan';
                const sortedLenders = lendersData
                  .map(lender => ({
                    ...lender,
                    parsedRate: parseFloat(getRateForLoanType(lender, loanType))
                  }))
                  .filter(l => !isNaN(l.parsedRate) && l.parsedRate > 0)
                  .sort((a, b) => a.parsedRate - b.parsedRate);

                const bestRate = sortedLenders.length > 0 ? sortedLenders[0].parsedRate : null;

                return (
                  <div>
                    <div className="form-title">Choose your lenders</div>
                    <div className="form-subtitle">
                      Showing best <strong>{currentLoanTitle}</strong> rates. Select as many lenders as you like — we’ll apply to all at once.
                    </div>

                    {/* Dynamic Smart Tip */}
                    <div className={`bl-smart-tip show ${selectedLenders.length === 1 ? 'warn' : selectedLenders.length >= 2 && selectedLenders.length <= 4 ? 'good' : ''}`}>
                      {selectedLenders.length === 0 && (
                        <>
                          💡 <strong>Smart tip:</strong> Applying to <strong>3–4 lenders</strong> gets you the best negotiating power — they compete to offer you the lowest rate.
                        </>
                      )}
                      {selectedLenders.length === 1 && (
                        <>
                          ⚠️ <strong>Only 1 selected.</strong> Add <strong>2–3 more</strong> lenders so you can compare real offers side by side and pick the cheapest.
                        </>
                      )}
                      {selectedLenders.length >= 2 && selectedLenders.length <= 4 && (
                        <>
                          ✅ <strong>Great choice!</strong> {selectedLenders.length} lenders will compete for your loan. This is the sweet spot for the best deal.
                        </>
                      )}
                      {selectedLenders.length > 4 && (
                        <>
                          👍 <strong>{selectedLenders.length} lenders selected.</strong> That’s plenty of options — more than 5 applications may slightly impact your credit score.
                        </>
                      )}
                    </div>
                    
                    <div className="bl-lender-list">
                      {sortedLenders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text2)' }}>
                          No lenders available for {currentLoanTitle}.
                        </div>
                      ) : (
                        sortedLenders.map(lender => {
                          const isSel = selectedLenders.includes(lender.id);
                          const rateStr = lender.parsedRate.toFixed(2);
                          const catLabel = getLenderCategoryLabel(lender);
                          const isBest = lender.parsedRate === bestRate;

                          return (
                            <div 
                              key={lender.id} 
                              className={`bl-lender ${isSel ? 'sel' : ''} ${isBest ? 'best' : ''}`} 
                              onClick={() => toggleLender(lender.id)}
                            >
                              <div className="bl-check">
                                {isSel ? <Check size={13} strokeWidth={3} /> : ''}
                              </div>
                              <div 
                                className="bl-l-icon"
                                style={{
                                  background: lender.type === 'nbfc' || lender.name?.toLowerCase().includes('finserv') ? '#E0F2FE' : '#EEF2FF',
                                  color: lender.type === 'nbfc' || lender.name?.toLowerCase().includes('finserv') ? '#0284C7' : '#4F46E5'
                                }}
                              >
                                {lender.logo ? (
                                  <img src={lender.logo} alt={lender.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                ) : (lender.type === 'nbfc' || lender.name?.toLowerCase().includes('finserv')) ? (
                                  <Building2 size={20} />
                                ) : (
                                  <Landmark size={20} />
                                )}
                              </div>
                              <div className="bl-l-info">
                                <div className="bl-l-name">
                                  {lender.name}
                                  {isBest && <span className="bl-best-tag">★ Best Rate</span>}
                                </div>
                                <div className="bl-l-sub">
                                  <span>{catLabel}</span>
                                  {' · '}
                                  <span className="bl-pf-note">PF applicable*</span>
                                  {' · '}
                                  <span className="bl-l-offer">🎁 Offer</span>
                                </div>
                              </div>
                              <div className="bl-l-rate">
                                <div className="bl-l-rate-v">{rateStr}%</div>
                                <div className="bl-l-rate-l">EXPECTED ROI</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="bl-select-bar">
                      <div id="blSelCount">
                        <strong>{selectedLenders.length}</strong> {selectedLenders.length === 1 ? 'lender' : 'lenders'} selected
                      </div>
                      <button 
                        className="btn-primary bl-continue" 
                        disabled={selectedLenders.length === 0} 
                        onClick={() => setStep(3)}
                        style={{ padding: '10px 22px', borderRadius: '10px' }}
                      >
                        Continue →
                      </button>
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <button className="btn-back" onClick={() => setStep(1)}>← Change loan type</button>
                    </div>
                    <div className="roi-confirm-note">
                      <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#EA580C' }} />
                      <span><strong>Note:</strong> Rates shown are indicative. Final ROI will be confirmed post credit assessment of the case.</span>
                    </div>
                    <div className="bl-pf-foot">
                      * Processing fee, where applicable, is confirmed by the lender at sanction. Many PSU schemes and select offers waive it — we'll guide you on this.
                    </div>
                  </div>
                );
              })()}

              {/* Step 3: Login / Register with OTP */}
              {step === 3 && (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>
                  <div className="form-title">Almost there — log in to apply</div>
                  <div className="form-subtitle">Enter your details and verify with OTP so lenders can reach you</div>

                  <div className="bl-apply-summary">
                    <div className="bl-sum-head" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏠</span> {loanTypesData.find((t) => t.id === loanType)?.title || 'Home Loan'} · {selectedLenders.length} {selectedLenders.length === 1 ? 'lender' : 'lenders'}
                    </div>
                    <div className="bl-sum-chips">
                      {selectedLenders.map((id) => {
                        const lender = lendersData.find((l) => l.id === id);
                        return <span key={id} className="bl-sum-chip">{lender ? lender.name : id}</span>;
                      })}
                    </div>
                  </div>

                  {!showOtpVerify ? (
                    <div>
                      <div className="bl-amt-field">
                        <label className="bl-amt-label">Loan Amount Required</label>
                        <div className="rf-input-wrap">
                          <span className="rf-prefix">₹</span>
                          <input
                            type="number"
                            className="rf-input"
                            value={loanAmtVal}
                            step="0.01"
                            min="0"
                            style={{ width: '90px' }}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setLoanAmtVal(e.target.value)}
                          />
                          <select
                            className="rf-unit"
                            value={loanAmtUnit}
                            onChange={(e) => setLoanAmtUnit(Number(e.target.value))}
                          >
                            <option value={100000}>Lakh</option>
                            <option value={10000000}>Crore</option>
                          </select>
                        </div>
                      </div>

                      <div className="field">
                        <div className="input-wrap">
                          <span className="icon"><User size={16} /></span>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="field">
                        <div className="input-wrap">
                          <span className="icon"><Mail size={16} /></span>
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="field">
                        <div className="input-wrap">
                          <span className="icon"><Smartphone size={16} /></span>
                          <input
                            type="tel"
                            placeholder="Mobile Number"
                            maxLength="10"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          />
                        </div>
                      </div>

                      <div className="otp-channel-row">
                        <span className="ocr-label">Verify using:</span>
                        <button
                          type="button"
                          className={`ocr-btn ${otpChannel === 'mobile' ? 'active' : ''}`}
                          onClick={() => setOtpChannel('mobile')}
                        >
                          📱 Mobile OTP
                        </button>
                        <button
                          type="button"
                          className={`ocr-btn ${otpChannel === 'email' ? 'active' : ''}`}
                          onClick={() => setOtpChannel('email')}
                        >
                          📧 Email OTP
                        </button>
                      </div>

                      {otpError && (
                        <div style={{ color: '#DC2626', fontSize: '.78rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={15} /> {otpError}
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn-primary"
                        disabled={otpSending || !fullName.trim() || !email.trim() || mobile.length !== 10}
                        onClick={handleSendOtp}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
                      >
                        {otpSending ? 'Sending OTP...' : 'Send OTP →'}
                      </button>

                      <div style={{ marginTop: '14px', textAlign: 'center' }}>
                        <button type="button" className="btn-back" onClick={() => setStep(2)}>← Back to lenders</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ animation: 'fadeUp 0.25s ease' }}>
                      <div className="bl-otp-info">
                        📲 We've sent a verification code to <strong>{otpChannel === 'email' ? email : mobile}</strong>
                      </div>

                      <div className="field">
                        <div className="input-wrap">
                          <span className="icon"><Key size={16} /></span>
                          <input
                            type="text"
                            placeholder="Enter verification code (Demo: 123456)"
                            maxLength="6"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            style={{ letterSpacing: '4px', fontSize: '1.1rem', textAlign: 'center' }}
                            autoFocus
                          />
                        </div>
                      </div>

                      {otpError && (
                        <div style={{ color: '#DC2626', fontSize: '.78rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={15} /> {otpError}
                        </div>
                      )}

                      {otpTimer > 0 ? (
                        <div className="timer-row">Resend in {otpTimer}s</div>
                      ) : (
                        <div className="timer-row">
                          <button type="button" className="btn-back" onClick={handleSendOtp} style={{ color: 'var(--teal)', fontWeight: 700 }}>
                            Resend OTP
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn-primary"
                        disabled={otpVerifying || otpInput.trim().length < 4}
                        onClick={handleVerifyOtpAndSubmit}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
                      >
                        {otpVerifying ? 'Verifying & Submitting...' : 'Verify & Submit →'}
                      </button>

                      <div style={{ marginTop: '14px', textAlign: 'center' }}>
                        <button type="button" className="btn-back" onClick={() => { setShowOtpVerify(false); setOtpInput(''); setOtpError(''); }}>
                          ← Edit details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Done */}
              {step === 4 && (
                <div style={{ textAlign: 'center', padding: '24px 0', animation: 'fadeUp 0.3s ease' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                  <div className="form-title">Applications Submitted!</div>
                  <div className="form-subtitle" style={{ marginBottom: '16px' }}>
                    We’ve sent your <strong>{submittedData?.loanName || 'Loan'}</strong> request to <strong>{selectedLenders.length} {selectedLenders.length === 1 ? 'lender' : 'lenders'}</strong>. Track every application live from your dashboard.
                  </div>
                  <div className="bl-apply-summary" style={{ marginBottom: '20px' }}>
                    <div className="bl-sum-head" style={{ textAlign: 'center' }}>Submitted to</div>
                    <div className="bl-sum-chips" style={{ justifyContent: 'center' }}>
                      {selectedLenders.map((id) => {
                        const lender = lendersData.find((l) => l.id === id);
                        return <span key={id} className="bl-sum-chip">{lender ? lender.name : id}</span>;
                      })}
                    </div>
                  </div>
                  <div
                    className="bl-redirect-note"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/client-dashboard', {
                      state: {
                        appSubmitted: true,
                        appId: submittedData?.appId,
                        loanName: submittedData?.loanName,
                        lenderNames: submittedData?.lenderNames
                      }
                    })}
                  >
                    Taking you to your dashboard…
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
