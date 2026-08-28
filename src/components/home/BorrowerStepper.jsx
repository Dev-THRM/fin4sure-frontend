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
  Check,
  Landmark,
  User,
  Smartphone,
  Mail,
  Lock,
  Key,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  Target,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LENDERS } from '../../utils/loanConstants';
import '../../pages/styles/stepper.css';

const getLoanTypeIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('home')) return <Home size={24} />;
  if (n.includes('property') || n.includes('lap')) return <Building2 size={24} />;
  if (n.includes('personal')) return <CreditCard size={24} />;
  if (n.includes('business')) return <Briefcase size={24} />;
  if (n.includes('vehicle') || n.includes('car') || n.includes('auto')) return <Car size={24} />;
  return <FileText size={24} />;
};

export default function BorrowerStepper({ onBack }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState('');
  const [loanType, setLoanType] = useState('');
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [loanTypesData, setLoanTypesData] = useState([]);
  const [lendersData, setLendersData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [pincodeNotFound, setPincodeNotFound] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mob_no: '',
    email: '',
    dob: '',
    gender: '',
    address: '',
    pincode: '',
    state: '',
    district: '',
    city: '',
    loanAmount: '',
    tenure: '',
    loanPurpose: ''
  });
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordCriteria = [
    { test: (pw) => pw.length >= 8, message: "At least 8 characters" },
    { test: (pw) => /[A-Z]/.test(pw), message: "At least 1 uppercase letter" },
    { test: (pw) => /[0-9]/.test(pw), message: "At least 1 number" },
    { test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw), message: "At least 1 special character" },
  ];

  const validatePassword = (pw) =>
    passwordCriteria.map((c) => ({
      message: c.message,
      valid: c.test(pw),
    }));

  const isPasswordStrong = () => validatePassword(password).every((c) => c.valid);

  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loanTypesRes = await axios.get('/api/loan-types');
        const lendersRes = await axios.get('/api/lenders');
        const statesRes = await axios.get('/api/location/states');
        
        if (loanTypesRes.data.success) {
          const mappedTypes = loanTypesRes.data.data.map(lt => {
            return {
              id: lt.short_id || lt.name.toLowerCase().replace(/\s+/g, ''),
              dbName: lt.name,
              icon: getLoanTypeIcon(lt.name),
              title: lt.name,
              desc: lt.description || 'Apply for ' + lt.name
            };
          });
          setLoanTypesData(mappedTypes);
        }
        
        let apiLenders = (lendersRes.data?.success && Array.isArray(lendersRes.data.data)) ? [...lendersRes.data.data] : [];
        const existingNames = new Set(apiLenders.map(l => (l.name || '').toLowerCase().trim()));
        LENDERS.forEach((l, idx) => {
          if (!existingNames.has((l.name || '').toLowerCase().trim())) {
            apiLenders.push({
              id: 100 + idx,
              name: l.name,
              short: l.short,
              type: l.type,
              emoji: l.emoji,
              rates: l.rates
            });
          }
        });
        setLendersData(apiLenders);

        if (statesRes.data?.success) {
          setStatesList(statesRes.data.data);
        }
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
    return s;
  };

  const getRateForLoanType = (lender, selectedTypeId) => {
    if (!lender) return 'N/A';
    const normKey = normalizeTypeKey(selectedTypeId);
    
    // 1. Check if lender has database rates
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
    
    // 2. Check if lender matches static LENDERS catalog
    const matchedConstant = LENDERS.find(c => 
      c.name.toLowerCase() === lender.name?.toLowerCase() ||
      c.short.toLowerCase() === (lender.short || lender.name)?.toLowerCase()
    );
    if (matchedConstant && matchedConstant.rates && matchedConstant.rates[normKey]) {
      const rateObj = matchedConstant.rates[normKey];
      const minVal = (rateObj.f && rateObj.f[0]) || (rateObj.x && rateObj.x[0]);
      if (minVal && minVal > 0) {
        return minVal.toFixed(2);
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
    setOtpSending(true);
    setOtpError('');
    try {
      const res = await axios.post('/api/auth/send-email-otp', { email: formData.email });
      if (res.data?.success) {
        setShowOtp(true);
      } else {
        setOtpError(res.data?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpVerifying) return;
    setOtpVerifying(true);
    setOtpError('');
    try {
      const res = await axios.post('/api/auth/verify-email-otp', { email: formData.email, otp: otpInput });
      if (res.data?.success) {
        setStep(4);
      } else {
        setOtpError(res.data?.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, pincode: val }));
  };


  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    const selectedState = statesList.find(s => s.id === parseInt(stateId));
    setFormData(prev => ({ ...prev, state: selectedState ? selectedState.name : '', district: '', city: '' }));
    
    if (stateId) {
      try {
        const res = await axios.get(`/api/location/districts/${stateId}`);
        if (res.data.success) setDistrictsList(res.data.data);
        setCitiesList([]);
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    } else {
      setDistrictsList([]);
      setCitiesList([]);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    const selectedDistrict = districtsList.find(d => d.id === parseInt(districtId));
    setFormData(prev => ({ ...prev, district: selectedDistrict ? selectedDistrict.name : '', city: '' }));

    if (districtId) {
      try {
        const res = await axios.get(`/api/location/cities/${districtId}`);
        if (res.data.success) setCitiesList(res.data.data);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    } else {
      setCitiesList([]);
    }
  };



  const handleFinalSubmit = async () => {
    setSubmitError('');
    try {
      const response = await axios.post('/api/auth/register-borrower', {
        name: formData.name,
        email: formData.email,
        number: formData.mob_no,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address,
        pincode: formData.pincode,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        password: password,
        loanAmount: formData.loanAmount,
        tenure: formData.tenure,
        loanPurpose: formData.loanPurpose,
        loanType: loanType,
        selectedLenders: selectedLenders
      }, {
        withCredentials: true
      });

      if (response.data) {
        login({ 
          name: response.data.name, 
          email: response.data.email, 
          number: formData.mob_no, 
          role: 'borrower' 
        });
        navigate('/client-dashboard');
      }
    } catch (error) {
      console.error("Error registering borrower:", error);
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      if (msg.toLowerCase().includes("already exists")) {
        setSubmitError('already_exists');
      } else {
        setSubmitError(msg);
      }
    }
  };

  const isOver18 = (dobStr) => {
    if (!dobStr) return false;
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidMobile = (mob) => /^[0-9]{10}$/.test(mob);

  const isBasicInfoValid = 
    formData.name.trim() !== '' && 
    isValidMobile(formData.mob_no) && 
    isValidEmail(formData.email) && 
    isPasswordStrong() && 
    password === confirmPassword;

  const isMoreDetailsValid = 
    formData.dob.trim() !== '' && 
    isOver18(formData.dob) &&
    formData.gender.trim() !== '' && 
    formData.address.trim() !== '' && 
    /^[0-9]{6}$/.test(formData.pincode) && 
    formData.district.trim() !== '' &&
    formData.state.trim() !== '' &&
    formData.city.trim() !== '' &&
    formData.loanAmount.trim() !== '' && 
    formData.tenure.trim() !== '' && 
    formData.loanPurpose.trim() !== '';

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%', animation: 'fadeUp 0.35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn-back" onClick={onBack} style={{ marginRight: '16px' }}>← Back</button>
        <div className="mode-badge borrower" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={15} /> Borrower Application
        </div>
      </div>
      
      <div className="form-card">
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
            <div className={`step-label ${step >= 3 ? 'active' : ''}`}>Basic Info</div>
          </div>
          <div className="step-connector">
            <div className="fill" style={{ width: step > 3 ? '100%' : '0%' }}></div>
          </div>
          
          <div className="step-item">
            <div className={`step-circle ${step >= 4 ? 'active' : ''} ${step > 4 ? 'done' : ''}`}>4</div>
            <div className={`step-label ${step >= 4 ? 'active' : ''}`}>More Details</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading data...</div>
        ) : (
          <>
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

            {step === 2 && (
              <div>
                <div className="form-title">Choose Preferred Lenders</div>
                <div className="form-subtitle">
                  Showing best {loanTypesData.find(t => t.id === loanType)?.title || 'Loan'} rates. Select as many lenders as you like — we’ll apply to all at once.
                </div>
                
                <div className="bl-lender-list">
                  {lendersData
                    .filter(lender => getRateForLoanType(lender, loanType) !== 'N/A')
                    .map(lender => {
                    const isSel = selectedLenders.includes(lender.id);
                    const rate = getRateForLoanType(lender, loanType);
                    const catLabel = getLenderCategoryLabel(lender);
                    
                    return (
                      <div key={lender.id} className={`bl-lender ${isSel ? 'sel' : ''}`} onClick={() => toggleLender(lender.id)}>
                        <div className="bl-check">{isSel ? <Check size={12} strokeWidth={3} /> : ''}</div>
                        <div className="bl-l-info">
                          <div className="bl-l-name" style={{ display: 'flex', alignItems: 'center' }}>
                            {lender.logo ? (
                              <img src={lender.logo} alt={lender.name} style={{ width: '20px', height: '20px', marginRight: '8px', objectFit: 'contain' }} />
                            ) : (
                              <Landmark size={18} className="text-slate-600" style={{ marginRight: '8px' }} />
                            )}
                            {lender.name}
                          </div>
                          <div className="bl-l-sub">{catLabel}</div>
                        </div>
                        <div className="bl-l-rate">
                          <div className="bl-l-rate-v">{rate}%</div>
                          <div className="bl-l-rate-l">p.a. onwards</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bl-select-bar">
                  <div id="blSelCount">Selected: <strong>{selectedLenders.length}</strong> {selectedLenders.length < 2 ? '(Min 2)' : ''}</div>
                  <button 
                    className="btn-primary bl-continue" 
                    disabled={selectedLenders.length < 2} 
                    onClick={() => setStep(3)}
                    style={{ padding: '10px 20px', borderRadius: '10px' }}
                  >
                    Apply Now →
                  </button>
                </div>
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="form-title">Basic Information</div>
                <div className="form-subtitle">Please enter your basic details and create a password</div>
                
                <div className="bl-apply-summary">
                  <div className="bl-sum-head">Applying for {loanTypesData.find(t => t.id === loanType)?.title || loanType}</div>
                  <div className="bl-sum-chips">
                    {selectedLenders.map(id => {
                      const lender = lendersData.find(l => l.id === id);
                      return <span key={id} className="bl-sum-chip">{lender ? lender.name : id}</span>;
                    })}
                  </div>
                </div>

                <div className="field">
                  <label>Full Name <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><User size={16} /></span>
                    <input type="text" placeholder="As per PAN card" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Mobile Number <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><Smartphone size={16} /></span>
                    <input type="tel" placeholder="10-digit mobile number" maxLength="10" value={formData.mob_no} onChange={e => setFormData({...formData, mob_no: e.target.value.replace(/\D/g, '')})} />
                  </div>
                  {formData.mob_no && !isValidMobile(formData.mob_no) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>Please enter a valid 10-digit mobile number.</div>}
                </div>

                <div className="field">
                  <label>Email Address <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><Mail size={16} /></span>
                    <input type="email" placeholder="Email address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  {formData.email && !isValidEmail(formData.email) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>Please enter a valid email address.</div>}
                </div>

                <div className="field" style={{ marginTop: '20px' }}>
                  <label>Password <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap" style={{ position: 'relative' }}>
                    <span className="icon"><Lock size={16} /></span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: ".76rem", fontWeight: 700 }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {password && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      {validatePassword(password).map((rule, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: ".62rem",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            border: "1px solid",
                            borderColor: rule.valid ? "#A7F3D0" : "#FCA5A5",
                            backgroundColor: rule.valid ? "#ECFDF5" : "#FEF2F2",
                            color: rule.valid ? "#065F46" : "#991B1B",
                          }}
                        >
                          {rule.message}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label>Confirm Password <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap" style={{ position: 'relative' }}>
                    <span className="icon"><Lock size={16} /></span>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: ".76rem", fontWeight: 700 }}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div style={{ color: password === confirmPassword ? "green" : "red", fontSize: '0.75rem', marginTop: '4px', fontWeight: 700 }}>
                      {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </div>
                  )}
                </div>

                {!showOtp ? (
                  <>
                    {otpError && (
                      <div style={{ color: 'red', fontSize: '.76rem', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> {otpError}
                      </div>
                    )}
                    <button 
                      className="btn-primary" 
                      onClick={handleSendOtp}
                      disabled={!isBasicInfoValid || otpSending}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px', opacity: (isBasicInfoValid && !otpSending) ? 1 : 0.5, cursor: (isBasicInfoValid && !otpSending) ? 'pointer' : 'not-allowed' }}
                    >
                      {otpSending ? 'Sending OTP…' : 'Send OTP →'}
                    </button>
                  </>
                ) : (
                  <div className="field" style={{marginTop: '20px', animation: 'fadeUp 0.3s ease'}}>
                    <label>Enter OTP sent to <strong>{formData.email}</strong> <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap">
                      <span className="icon"><Key size={16} /></span>
                      <input 
                        type="text" 
                        placeholder="4-digit OTP" 
                        maxLength="4" 
                        value={otpInput} 
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))} 
                        autoFocus
                      />
                    </div>
                    {otpError && (
                      <div style={{ color: 'red', fontSize: '.76rem', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> {otpError}
                      </div>
                    )}
                    <button 
                      className="btn-primary" 
                      onClick={handleVerifyOtp}
                      disabled={otpInput.length < 4 || otpVerifying}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px', opacity: (otpInput.length >= 4 && !otpVerifying) ? 1 : 0.5 }}
                    >
                      {otpVerifying ? 'Verifying…' : 'Verify & Continue →'}
                    </button>
                    <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '.76rem', color: '#64748b' }}>
                      Didn't receive it?{' '}
                      <button
                        type="button"
                        onClick={() => { setShowOtp(false); setOtpInput(''); setOtpError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--teal, #0f766e)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: '.76rem' }}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}
                
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button className="btn-back" onClick={() => setStep(2)}>← Edit selection</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div className="form-title">More Details</div>
                <div className="form-subtitle">Please provide additional details for the application</div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Date of Birth <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap">
                      <span className="icon"><Calendar size={16} /></span>
                      <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                    </div>
                    {formData.dob && !isOver18(formData.dob) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>You must be at least 18 years old.</div>}
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Gender <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap">
                      <span className="icon"><UserCheck size={16} /></span>
                      <select style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', background: '#fff', color: '#0f172a', appearance: 'none' }} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Address <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><MapPin size={16} /></span>
                    <input type="text" placeholder="Current residential address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Pincode <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><Mail size={16} /></span>
                    <input type="text" placeholder="6-digit pincode" maxLength="6" value={formData.pincode} onChange={handlePincodeChange} />
                  </div>
                  {formData.pincode && !/^[0-9]{6}$/.test(formData.pincode) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>Please enter a valid 6-digit pincode.</div>}
                </div>

                <div className="two-cols" style={{ display: 'flex', gap: '12px' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>State <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap" style={{ padding: 0 }}>
                      <select
                        style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', background: '#fff', color: formData.state ? '#0f172a' : '#94a3b8', outline: 'none', cursor: 'pointer' }}
                        value={statesList.find(s => s.name === formData.state)?.id || ''}
                        onChange={handleStateChange}
                      >
                        <option value="">Select State</option>
                        {statesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>District <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap" style={{ padding: 0 }}>
                      <select
                        style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', background: '#fff', color: formData.district ? '#0f172a' : '#94a3b8', outline: 'none', cursor: formData.state ? 'pointer' : 'not-allowed', opacity: formData.state ? 1 : 0.6 }}
                        value={districtsList.find(d => d.name === formData.district)?.id || ''}
                        onChange={handleDistrictChange}
                        disabled={!formData.state}
                      >
                        <option value="">Select District</option>
                        {districtsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>City <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap" style={{ padding: 0 }}>
                    <input
                      list="city-options"
                      type="text"
                      placeholder="Select or type City"
                      style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', background: '#fff', color: '#0f172a', outline: 'none', cursor: formData.district ? 'text' : 'not-allowed', opacity: formData.district ? 1 : 0.6 }}
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!formData.district}
                    />
                    <datalist id="city-options">
                      {citiesList.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                </div>

                <div className="field">
                  <label>Loan Amount <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><IndianRupee size={16} /></span>
                    <input type="number" placeholder="Enter amount" value={formData.loanAmount} onChange={e => setFormData({...formData, loanAmount: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Tenure (in months) <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><Clock size={16} /></span>
                    <input type="number" placeholder="Enter tenure" value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Loan Purpose <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon"><Target size={16} /></span>
                    <input type="text" placeholder="E.g., Home Renovation, Business" value={formData.loanPurpose} onChange={e => setFormData({...formData, loanPurpose: e.target.value})} />
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={handleFinalSubmit}
                  disabled={!isMoreDetailsValid}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px', opacity: isMoreDetailsValid ? 1 : 0.5, cursor: isMoreDetailsValid ? 'pointer' : 'not-allowed' }}
                >
                  Submit & Go to Dashboard →
                </button>

                {submitError === 'already_exists' && (
                  <div style={{ marginTop: '14px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', fontSize: '.82rem', color: '#991B1B', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                      <AlertTriangle size={15} /> An account with this email or mobile number already exists.
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      style={{ marginTop: '8px', background: 'none', border: 'none', color: '#1D4ED8', fontWeight: 700, cursor: 'pointer', fontSize: '.82rem', textDecoration: 'underline' }}
                    >
                      → Sign in instead
                    </button>
                  </div>
                )}
                {submitError && submitError !== 'already_exists' && (
                  <div style={{ marginTop: '14px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', fontSize: '.82rem', color: '#991B1B', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} /> {submitError}
                  </div>
                )}
                
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button className="btn-back" onClick={() => setStep(3)}>← Back to Basic Info</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
