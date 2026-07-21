import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../pages/styles/stepper.css';


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
    loanAmount: '',
    tenure: '',
    loanPurpose: ''
  });
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [dummyOtp, setDummyOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [loanTypesRes, lendersRes] = await Promise.all([
          axios.get('/api/loan-types'),
          axios.get('/api/lenders')
        ]);
        
        if (loanTypesRes.data.success) {
          const mappedTypes = loanTypesRes.data.data.map(lt => {
            return {
              id: lt.short_id || lt.name.toLowerCase().replace(/\s+/g, ''),
              dbName: lt.name,
              icon: lt.icon || '📄',
              title: lt.name,
              desc: lt.description || 'Apply for ' + lt.name
            };
          });
          setLoanTypesData(mappedTypes);
        }
        
        if (lendersRes.data.success) {
          setLendersData(lendersRes.data.data);
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
  };

  const toggleLender = (lenderId) => {
    setSelectedLenders(prev => 
      prev.includes(lenderId) ? prev.filter(l => l !== lenderId) : [...prev, lenderId]
    );
  };

  const getRateForLoanType = (lender, selectedTypeId) => {
    if (!lender.loanRates || lender.loanRates.length === 0) return 'N/A';
    const rateData = lender.loanRates.find(r => r.type && r.type.short_id === selectedTypeId);
    if (rateData && rateData.min_rate) return rateData.min_rate;
    return 'N/A';
  };

  const handleSendOtp = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setDummyOtp(generated);
    console.log(`%c 🔑 DUMMY OTP FOR ${formData.mob_no}: ${generated}`, 'background: #222; color: #4ade80; font-size: 16px; padding: 4px; border-radius: 4px;');
    setShowOtp(true);
  };

  const handleVerifyOtp = () => {
    if (otpInput === dummyOtp || otpInput === '123456' || otpInput === '1234') {
      setStep(4);
      setOtpError('');
    } else {
      setOtpError("Invalid OTP! Try using 123456.");
    }
  };

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, pincode: val }));
    
    if (val.length === 6) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${val}`);
        const data = res.data;
        if (data && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            district: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (err) {
        console.error("Error fetching pincode details:", err);
      }
    } else {
      setFormData(prev => ({ ...prev, district: '', state: '' }));
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
    password.trim() !== '' && 
    password === confirmPassword;

  const isMoreDetailsValid = 
    formData.dob.trim() !== '' && 
    isOver18(formData.dob) &&
    formData.gender.trim() !== '' && 
    formData.address.trim() !== '' && 
    /^[0-9]{6}$/.test(formData.pincode) && 
    formData.district.trim() !== '' &&
    formData.state.trim() !== '' &&
    formData.loanAmount.trim() !== '' && 
    formData.tenure.trim() !== '' && 
    formData.loanPurpose.trim() !== '';

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%', animation: 'fadeUp 0.35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn-back" onClick={onBack} style={{ marginRight: '16px' }}>← Back</button>
        <div className="mode-badge borrower" style={{ margin: 0 }}>🏠 Borrower Application</div>
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
                <div className="form-subtitle">Showing best Home Loan rates. Select as many lenders as you like — we’ll apply to all at once.</div>
                
                <div className="bl-lender-list">
                  {lendersData.map(lender => {
                    const isSel = selectedLenders.includes(lender.id);
                    const rate = getRateForLoanType(lender, loanType);
                    
                    return (
                      <div key={lender.id} className={`bl-lender ${isSel ? 'sel' : ''}`} onClick={() => toggleLender(lender.id)}>
                        <div className="bl-check">{isSel ? '✓' : ''}</div>
                        <div className="bl-l-info">
                          <div className="bl-l-name" style={{ display: 'flex', alignItems: 'center' }}>
                            {lender.logo ? (
                              <img src={lender.logo} alt={lender.name} style={{ width: '20px', height: '20px', marginRight: '8px', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ marginRight: '8px' }}>🏦</span>
                            )}
                            {lender.name}
                          </div>
                          <div className="bl-l-sub">{lender.type === 'psu' ? 'PSU' : 'Private'} Bank</div>
                        </div>
                        <div className="bl-l-rate">
                          <div className="bl-l-rate-v">{rate !== 'N/A' ? `${rate}%` : 'N/A'}</div>
                          {rate !== 'N/A' && <div className="bl-l-rate-l">p.a. onwards</div>}
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
                    <span className="icon">👤</span>
                    <input type="text" placeholder="As per PAN card" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Mobile Number <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">📱</span>
                    <input type="tel" placeholder="10-digit mobile number" maxLength="10" value={formData.mob_no} onChange={e => setFormData({...formData, mob_no: e.target.value.replace(/\D/g, '')})} />
                  </div>
                  {formData.mob_no && !isValidMobile(formData.mob_no) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>Please enter a valid 10-digit mobile number.</div>}
                </div>

                <div className="field">
                  <label>Email Address <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">✉️</span>
                    <input type="email" placeholder="Email address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  {formData.email && !isValidEmail(formData.email) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>Please enter a valid email address.</div>}
                </div>

                <div className="field" style={{ marginTop: '20px' }}>
                  <label>Password <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">🔒</span>
                    <input 
                      type="password" 
                      placeholder="Enter password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Confirm Password <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">🔒</span>
                    <input 
                      type="password" 
                      placeholder="Confirm password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} 
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>Passwords do not match.</div>}
                </div>

                {!showOtp ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleSendOtp}
                    disabled={!isBasicInfoValid}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px', opacity: isBasicInfoValid ? 1 : 0.5, cursor: isBasicInfoValid ? 'pointer' : 'not-allowed' }}
                  >
                    Send OTP →
                  </button>
                ) : (
                  <div className="field" style={{marginTop: '20px', animation: 'fadeUp 0.3s ease'}}>
                    <label>Enter OTP <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap">
                      <span className="icon">🔑</span>
                      <input 
                        type="text" 
                        placeholder="6-digit OTP (e.g. 123456)" 
                        maxLength="6" 
                        value={otpInput} 
                        onChange={e => setOtpInput(e.target.value)} 
                      />
                    </div>
                    {otpError && (
                      <div style={{ color: 'red', fontSize: '.76rem', fontWeight: 700, marginTop: '6px' }}>
                        ⚠️ {otpError}
                      </div>
                    )}
                    <button 
                      className="btn-primary" 
                      onClick={handleVerifyOtp}
                      disabled={otpInput.length !== 6 && otpInput.length !== 4}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px', opacity: (otpInput.length === 6 || otpInput.length === 4) ? 1 : 0.5 }}
                    >
                      Verify & Continue →
                    </button>
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
                      <span className="icon">📅</span>
                      <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                    </div>
                    {formData.dob && !isOver18(formData.dob) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>You must be at least 18 years old.</div>}
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Gender <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap">
                      <span className="icon">⚧</span>
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
                    <span className="icon">📍</span>
                    <input type="text" placeholder="Current residential address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Pincode <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">📮</span>
                    <input type="text" placeholder="6-digit pincode" maxLength="6" value={formData.pincode} onChange={handlePincodeChange} />
                  </div>
                  {formData.pincode && !/^[0-9]{6}$/.test(formData.pincode) && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>Please enter a valid 6-digit pincode.</div>}
                </div>

                <div className="two-cols" style={{ display: 'flex', gap: '12px' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>City/District <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap">
                      <input type="text" placeholder="Enter City" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
                    </div>
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>State <span style={{color: 'red'}}>*</span></label>
                    <div className="input-wrap">
                      <input type="text" placeholder="Enter State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Loan Amount <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">₹</span>
                    <input type="number" placeholder="Enter amount" value={formData.loanAmount} onChange={e => setFormData({...formData, loanAmount: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Tenure (in months) <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">⏳</span>
                    <input type="number" placeholder="Enter tenure" value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})} />
                  </div>
                </div>

                <div className="field">
                  <label>Loan Purpose <span style={{color: 'red'}}>*</span></label>
                  <div className="input-wrap">
                    <span className="icon">🎯</span>
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
                    ⚠️ An account with this email or mobile number already exists.<br />
                    <button
                      onClick={() => navigate('/login')}
                      style={{ marginTop: '8px', background: 'none', border: 'none', color: '#1D4ED8', fontWeight: 700, cursor: 'pointer', fontSize: '.82rem', textDecoration: 'underline' }}
                    >
                      → Sign in instead
                    </button>
                  </div>
                )}
                {submitError && submitError !== 'already_exists' && (
                  <div style={{ marginTop: '14px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', fontSize: '.82rem', color: '#991B1B', textAlign: 'center' }}>
                    ⚠️ {submitError}
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
