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
  UserCheck
} from 'lucide-react';
import { LENDERS } from '../utils/loanConstants';
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
  const [step, setStep] = useState(1);
  const [loanType, setLoanType] = useState('');
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [loanTypesData, setLoanTypesData] = useState([]);
  const [lendersData, setLendersData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loanTypesRes = await axios.get('/api/loan-types');
        const lendersRes = await axios.get('/api/lenders');
        
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
    return s;
  };

  const getRateForLoanType = (lender, selectedTypeId) => {
    if (!lender) return 'N/A';
    const normKey = normalizeTypeKey(selectedTypeId);
    
    // Check database rates
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
                      Continue →
                    </button>
                  </div>
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                  </div>
                </div>
              )}

              {/* Step 3: Login */}
              {step === 3 && (
                <div>
                  <div className="form-title">Almost there!</div>
                  <div className="form-subtitle">Please verify your details to submit the application</div>
                  
                  <div className="bl-apply-summary">
                    <div className="bl-sum-head">Applying for {loanTypesData.find(t => t.id === loanType)?.title || loanType}</div>
                    <div className="bl-sum-chips">
                      {selectedLenders.map(id => {
                        const lender = lendersData.find(l => l.id === id);
                        return <span key={id} className="bl-sum-chip">{lender ? lender.short : id}</span>;
                      })}
                    </div>
                  </div>

                  <div className="field">
                    <label>Mobile Number</label>
                    <div className="input-wrap">
                      <span className="icon"><Smartphone size={16} /></span>
                      <input type="tel" placeholder="10-digit mobile number" maxLength="10" />
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={() => setStep(4)}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px' }}
                  >
                    Send OTP →
                  </button>
                  
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button className="btn-back" onClick={() => setStep(2)}>← Edit selection</button>
                  </div>
                </div>
              )}

              {/* Step 4: Done */}
              {step === 4 && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#059669' }}>
                    <CheckCircle2 size={56} />
                  </div>
                  <div className="form-title">Applications Submitted!</div>
                  <div className="form-subtitle" style={{ marginBottom: '10px' }}>
                    Your loan requests have been sent. Track everything from your dashboard.
                  </div>
                  
                  <div className="bl-redirect-note" style={{ marginTop: '24px', cursor: 'pointer', color: 'var(--teal)', fontWeight: 'bold' }} onClick={() => navigate('/client-dashboard')}>
                    Go to Dashboard →
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
