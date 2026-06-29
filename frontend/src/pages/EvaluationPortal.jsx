import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldAlert, Award, FileText, Check, Clock, X, ExternalLink } from 'lucide-react';
import { API_BASE } from '../config';

const EvaluationPortal = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCandidateForReview, setSelectedCandidateForReview] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No evaluation token provided.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jury/evaluate/${token}`);
        const result = await res.json();
        
        if (!res.ok) {
          setError(result.message || 'Failed to authenticate token.');
        } else {
          setData(result.data);
          setSelectedCandidates(result.data.current_votes || []);
        }
      } catch (err) {
        setError('Network error connecting to the evaluation server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const toggleCandidate = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      if (!data.step.is_unlimited_candidates && data.step.max_candidates && selectedCandidates.length >= data.step.max_candidates) {
        alert(`You can only select a maximum of ${data.step.max_candidates} candidates.`);
        return;
      }
      setSelectedCandidates([...selectedCandidates, candidateId]);
    }
  };

  const assignPrize = (candidateId, prizeId) => {
    // If they select empty, remove the vote for this candidate
    if (!prizeId) {
      setSelectedCandidates(selectedCandidates.filter(v => v.applicationId !== candidateId));
      return;
    }
    // Check if prize is already assigned to someone else
    const existingPrizeAssignment = selectedCandidates.find(v => v.prizeId === prizeId && v.applicationId !== candidateId);
    if (existingPrizeAssignment) {
      alert('This prize has already been assigned to another candidate. Please unassign it first.');
      return;
    }
    // Update or add the assignment
    const filtered = selectedCandidates.filter(v => v.applicationId !== candidateId);
    setSelectedCandidates([...filtered, { applicationId: candidateId, prizeId }]);
  };

  const submitVotes = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/jury/evaluate/${token}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: selectedCandidates })
      });
      const result = await res.json();
      
      if (res.ok) {
        alert('Your votes have been successfully recorded! You can change them anytime before the deadline.');
        // Refresh data to show updated has_voted state
        setData({
          ...data,
          session: { ...data.session, has_voted: true },
          current_votes: selectedCandidates
        });
      } else {
        alert(result.message || 'Failed to submit votes.');
      }
    } catch (err) {
      alert('Network error submitting votes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020a07] text-white flex items-center justify-center font-mono">
        <div className="animate-pulse text-[var(--color-minesec-gold)]">Authenticating Token...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020a07] text-white flex flex-col items-center justify-center font-mono p-4 text-center">
        <ShieldAlert size={48} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-[var(--color-minesec-text-muted)] max-w-md">{error}</p>
        <button onClick={() => navigate('/')} className="mt-8 px-6 py-2 border border-white/20 rounded hover:bg-white/5 transition-colors">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a07] text-white font-sans selection:bg-[var(--color-minesec-gold)] selection:text-black pb-20">
      
      <header className="sticky top-0 z-50 bg-[#020a07]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--color-minesec-gold)]/10 rounded-full flex items-center justify-center">
              <Award className="text-[var(--color-minesec-gold)]" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Jury Evaluation Portal</h1>
              <div className="text-xs font-mono text-[var(--color-minesec-gold)]">{data.session.email}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Deadline</div>
              <div className="text-sm font-bold flex items-center gap-2 justify-end">
                <Clock size={14} className="text-yellow-500" />
                {data.step.ends_at ? new Date(data.step.ends_at).toLocaleString() : 'No Deadline'}
              </div>
            </div>
            <button 
              onClick={submitVotes}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[var(--color-minesec-gold)] text-black font-bold rounded-lg transition-all hover:bg-white hover:shadow-[0_0_15px_rgba(207,168,94,0.3)] flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <Check size={18} />
              {isSubmitting ? 'Saving...' : 'Submit Votes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-[var(--color-minesec-gold)]/10 text-[var(--color-minesec-gold)] font-mono text-xs uppercase tracking-wider rounded-full mb-3 border border-[var(--color-minesec-gold)]/20">
            {data.category.name_en}
          </div>
          <h2 className="text-3xl font-bold mb-2">Step {data.step.position}: {data.step.name_en}</h2>
          <p className="text-[var(--color-minesec-text-muted)] max-w-2xl">
            Please review the following candidates and select those you wish to advance to the next step.
          </p>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
            <ShieldAlert className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-200">
              {data.step.selects_winners ? (
                <>
                  <strong className="block text-blue-400 mb-1">Prize Assignment</strong>
                  Assign available prizes to the best candidates. You may assign each prize to only one candidate.
                </>
              ) : (
                <>
                  <strong className="block text-blue-400 mb-1">Voting Rules</strong>
                  {!data.step.is_unlimited_candidates && data.step.max_candidates ? (
                    <>You may select a maximum of <strong>{data.step.max_candidates} candidates</strong>. You have currently selected <strong>{selectedCandidates.length}</strong>.</>
                  ) : (
                    <>You may select an unlimited number of candidates who meet the criteria.</>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {data.candidates.length === 0 ? (
          <div className="p-12 border border-dashed border-white/20 rounded-2xl text-center text-[var(--color-minesec-text-muted)]">
            No candidates are currently available for this step.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.candidates.map(candidate => {
              let isSelected = false;
              let assignedPrizeId = '';
              
              if (data.step.selects_winners) {
                const assignment = selectedCandidates.find(v => v.applicationId === candidate.id);
                if (assignment) {
                  isSelected = true;
                  assignedPrizeId = assignment.prizeId;
                }
              } else {
                isSelected = selectedCandidates.includes(candidate.id);
              }

              return (
                <div 
                  key={candidate.id} 
                  onClick={() => !data.step.selects_winners && toggleCandidate(candidate.id)}
                  className={`relative p-6 rounded-2xl border ${!data.step.selects_winners ? 'cursor-pointer' : ''} transition-all duration-300 group ${
                    isSelected 
                      ? 'bg-[var(--color-minesec-gold)]/10 border-[var(--color-minesec-gold)] shadow-[0_0_20px_rgba(207,168,94,0.15)]' 
                      : 'bg-[#05110d] border-white/10 hover:border-white/30'
                  }`}
                >
                  {!data.step.selects_winners && (
                    <div className="absolute top-4 right-4">
                      {isSelected ? (
                        <CheckCircle className="text-[var(--color-minesec-gold)]" size={24} />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-white/50 transition-colors"></div>
                      )}
                    </div>
                  )}
                  
                  <div className="font-mono text-xs text-[var(--color-minesec-text-muted)] mb-3">{candidate.reference}</div>
                  <h3 className="text-xl font-bold mb-4 pr-8">{candidate.data.contact?.full_name || 'Anonymous Candidate'}</h3>
                  
                  <div className="space-y-2 mb-6 text-sm text-[var(--color-minesec-text-muted)]">
                    <div className="flex justify-between">
                      <span>Region</span>
                      <span className="text-white">{candidate.data.location?.region || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>School</span>
                      <span className="text-white truncate max-w-[150px]" title={candidate.data.location?.school}>{candidate.data.location?.school || 'N/A'}</span>
                    </div>
                  </div>

                  {data.step.selects_winners && (
                    <div className="mb-4">
                      <select
                        value={assignedPrizeId}
                        onChange={(e) => assignPrize(candidate.id, e.target.value)}
                        className="w-full bg-[#020a07] border border-[var(--color-minesec-gold)]/50 rounded px-3 py-2 text-sm text-[var(--color-minesec-gold)] font-bold outline-none focus:border-[var(--color-minesec-gold)] focus:ring-1 focus:ring-[var(--color-minesec-gold)]"
                      >
                        <option value="">-- Assign a Prize --</option>
                        {data.prizes && data.prizes.map(prize => (
                          <option key={prize.id} value={prize.id}>{prize.name_en}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCandidateForReview(candidate);
                    }} className="text-xs font-bold text-[var(--color-minesec-gold)] uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors">
                      <FileText size={14} /> Review Full Application
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Application Review Modal */}
      {selectedCandidateForReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#020a07] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#020a07]/90 backdrop-blur z-10">
              <div>
                <h3 className="text-xl font-bold">Application Review</h3>
                <span className="font-mono text-[var(--color-minesec-gold)] text-sm">{selectedCandidateForReview.reference}</span>
              </div>
              <button onClick={() => setSelectedCandidateForReview(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Applicant Info</h4>
                  <div className="space-y-4">
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Full Name</span><strong className="text-lg">{selectedCandidateForReview.data.contact?.full_name}</strong></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Registration (Matricule)</span><span className="font-mono">{selectedCandidateForReview.data.contact?.matricule || 'N/A'}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Sex</span><span className="capitalize">{selectedCandidateForReview.data.contact?.sex || 'N/A'}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Email</span><span>{selectedCandidateForReview.data.contact?.email}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Phone</span><span className="font-mono">{selectedCandidateForReview.data.contact?.phone}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">DOB / Creation Date</span><span>{selectedCandidateForReview.data.contact?.dob}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Location</h4>
                  <div className="space-y-4">
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Region</span><span>{selectedCandidateForReview.data.location?.region}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Division</span><span>{selectedCandidateForReview.data.location?.division}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Sub-Division</span><span>{selectedCandidateForReview.data.location?.sub_division}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">School</span><span>{selectedCandidateForReview.data.location?.school}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Justification</h4>
                <p className="whitespace-pre-wrap text-[var(--color-minesec-text-muted)] leading-relaxed bg-white/5 p-4 rounded-lg">
                  {selectedCandidateForReview.data.justification}
                </p>
              </div>

              {selectedCandidateForReview.documents && selectedCandidateForReview.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Supporting Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCandidateForReview.documents.map(doc => (
                      <a key={doc.id} href={`${API_BASE}/uploads/${doc.storage_key}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-[var(--color-minesec-gold)] transition-colors group">
                        <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center group-hover:bg-[var(--color-minesec-gold)]/20 group-hover:text-[var(--color-minesec-gold)] transition-colors">
                          <ExternalLink size={18} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm font-bold truncate">{doc.label}</div>
                          <div className="text-[10px] font-mono text-[var(--color-minesec-text-muted)] mt-0.5">{(doc.size_bytes / 1024).toFixed(1)} KB</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-4 sticky bottom-0">
              <button onClick={() => setSelectedCandidateForReview(null)} className="px-6 py-2 rounded font-bold transition-colors hover:bg-white/10">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EvaluationPortal;
