import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/stepper.css';

const LOAN_TYPE_MAPPING = {
  'Home Loan': { id: 'home', icon: '🏠', desc: 'Buy, build or renovate your home' },
  'Loan Against Property': { id: 'lap', icon: '🏢', desc: 'Leverage your residential/commercial property' },
  'Personal Loan': { id: 'personal', icon: '💳', desc: 'Quick funds for personal needs' },
  'Business Loan': { id: 'business', icon: '📦', desc: 'Working capital and business expansion' },
  'Vehicle Loan': { id: 'vehicle', icon: '🚗', desc: 'Finance your new or used vehicle' }
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
        const [loanTypesRes, lendersRes] = await Promise.all([
          axios.get('/api/loan-types'),
          axios.get('/api/lenders')
        ]);
        
        if (loanTypesRes.data.success) {
          const mappedTypes = loanTypesRes.data.data.map(lt => {
            const mapping = LOAN_TYPE_MAPPING[lt.name] || { id: lt.name.toLowerCase().replace(/\s+/g, ''), icon: '📄', desc: 'Apply for ' + lt.name };
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
    // Find the first rate matching the selected loan type short_id
    const rateData = lender.loanRates.find(r => r.type && r.type.short_id === selectedTypeId);
    if (rateData && rateData.min_rate) return rateData.min_rate;
    return 'N/A';
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <div className="mode-badge borrower">🏠 Borrower Application</div>
        
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
                  <div className="form-subtitle">Select at least 2 lenders you'd like to apply to</div>
                  
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
                      <span className="icon">📱</span>
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
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
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
