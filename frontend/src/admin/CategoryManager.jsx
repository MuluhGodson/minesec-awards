import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, X, Pencil, ExternalLink, CheckCircle } from 'lucide-react';
import Editor from 'react-simple-wysiwyg';

const CategoryManager = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [allSponsors, setAllSponsors] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isFlagship, setIsFlagship] = useState(false);

  // Form states
  const [formData, setFormData] = useState({});
  const [timelineFormData, setTimelineFormData] = useState({
    position: '', name_en: '', name_fr: '', description_en: '', description_fr: '', starts_at: '', ends_at: '', status: 'upcoming',
    requires_jury: false, is_unlimited_candidates: true, max_candidates: ''
  });
  const [sponsorFormData, setSponsorFormData] = useState({
    sponsor_id: '', is_primary: false, contribution_fcfa: ''
  });
  const [prizeFormData, setPrizeFormData] = useState({ 
    name_en: '', name_fr: '', amount_fcfa: '', description_en: '', description_fr: '' 
  });
  const [isAddingTimeline, setIsAddingTimeline] = useState(false);
  const [editingStepId, setEditingStepId] = useState(null);
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [editingPrizeId, setEditingPrizeId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [winnerPrizeSelection, setWinnerPrizeSelection] = useState('');
  
  // Jury States
  const [activeJuryStep, setActiveJuryStep] = useState(null);
  const [juryMembers, setJuryMembers] = useState([]);
  const [newJuryEmail, setNewJuryEmail] = useState('');
  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [catRes, timeRes, sponsorsRes, allSponsorsRes, prizesRes, appsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/categories/${id}`),
        fetch(`http://localhost:3000/api/categories/${id}/timeline`),
        fetch(`http://localhost:3000/api/categories/${id}/sponsors`),
        fetch(`http://localhost:3000/api/sponsors`),
        fetch(`http://localhost:3000/api/categories/${id}/prizes`),
        fetch(`http://localhost:3000/api/applications/category/${id}`)
      ]);
      const catData = await catRes.json();
      const timeData = await timeRes.json();
      const sponsorsData = await sponsorsRes.json();
      const allSponsorsData = await allSponsorsRes.json();
      const prizesData = await prizesRes.json();
      const appsData = await appsRes.json();

      if (catData.status === 'success') {
        setCategory(catData.data);
        setFormData(catData.data);
        setIsFlagship(catData.data.is_flagship || false);
      }
      if (timeData.status === 'success') setTimeline(timeData.data);
      if (sponsorsData.status === 'success') setSponsors(sponsorsData.data);
      if (allSponsorsData.status === 'success') setAllSponsors(allSponsorsData.data);
      if (prizesData.status === 'success') setPrizes(prizesData.data);
      if (appsData.status === 'success') setApplications(appsData.data);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_fr: formData.name_fr,
          name_en: formData.name_en,
          code: formData.code,
          is_flagship: isFlagship,
          cover_image_url: formData.cover_image_url,
          description_en: formData.description_en,
          description_fr: formData.description_fr,
          rules_en: formData.rules_en,
          rules_fr: formData.rules_fr,
          rubric_en: formData.rubric_en,
          rubric_fr: formData.rubric_fr,
          display_order: formData.display_order
        })
      });
      if (res.ok) {
        alert('Category updated successfully');
        fetchData();
      } else {
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleTimelineSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...timelineFormData };
      if (!payload.starts_at) delete payload.starts_at;
      if (!payload.ends_at) delete payload.ends_at;

      const method = editingStepId ? 'PUT' : 'POST';
      const url = editingStepId 
        ? `http://localhost:3000/api/categories/${id}/timeline/${editingStepId}`
        : `http://localhost:3000/api/categories/${id}/timeline`;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddingTimeline(false);
        setEditingStepId(null);
        setTimelineFormData({ position: '', name_en: '', name_fr: '', description_en: '', description_fr: '', starts_at: '', ends_at: '', status: 'upcoming', requires_jury: false, is_unlimited_candidates: true, max_candidates: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving timeline step:', error);
    }
  };

  const handleEditStep = (step) => {
    setEditingStepId(step.id);
    setTimelineFormData({
      position: step.position,
      name_en: step.name_en || '',
      name_fr: step.name_fr || '',
      description_en: step.description_en || '',
      description_fr: step.description_fr || '',
      starts_at: step.starts_at ? new Date(step.starts_at).toISOString().slice(0, 16) : '',
      ends_at: step.ends_at ? new Date(step.ends_at).toISOString().slice(0, 16) : '',
      status: step.status || 'upcoming',
      requires_jury: step.requires_jury || false,
      is_unlimited_candidates: step.is_unlimited_candidates !== false,
      max_candidates: step.max_candidates || ''
    });
    setIsAddingTimeline(true);
  };

  const deleteTimelineStep = async (stepId) => {
    if (!window.confirm('Are you sure you want to delete this step?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}/timeline/${stepId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) { console.error('Error deleting step:', error); }
  };

  // --- Jury Logic ---
  const openJuryModal = async (step) => {
    setActiveJuryStep(step);
    setIsJuryModalOpen(true);
    fetchJuryMembers(step.id);
  };

  const fetchJuryMembers = async (stepId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}/timeline/${stepId}/jury`);
      const data = await res.json();
      if (data.status === 'success') setJuryMembers(data.data);
    } catch (error) {
      console.error('Error fetching jury:', error);
    }
  };

  const inviteJuryMember = async (e) => {
    e.preventDefault();
    if (!newJuryEmail) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}/timeline/${activeJuryStep.id}/jury`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newJuryEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setNewJuryEmail('');
        fetchJuryMembers(activeJuryStep.id);
      } else {
        alert(data.message || 'Failed to invite jury member');
      }
    } catch (error) {
      console.error('Error inviting jury member:', error);
    }
  };

  const removeJuryMember = async (juryId) => {
    if (!window.confirm('Remove this jury member?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}/timeline/${activeJuryStep.id}/jury/${juryId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchJuryMembers(activeJuryStep.id);
    } catch (error) {
      console.error('Error removing jury member:', error);
    }
  };

  const triggerAdvancement = async (stepId) => {
    if (!window.confirm('Are you sure you want to tally votes and advance candidates? This cannot be undone.')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}/timeline/${stepId}/advance-candidates`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully advanced ${data.data.advanced_count} candidates!`);
        fetchData();
      } else {
        alert(data.message || 'Advancement failed');
      }
    } catch (error) {
      console.error('Error advancing candidates:', error);
    }
  };

  const handlePrizeSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...prizeFormData };
      const method = editingPrizeId ? 'PUT' : 'POST';
      const url = editingPrizeId 
        ? `http://localhost:3000/api/categories/${id}/prizes/${editingPrizeId}`
        : `http://localhost:3000/api/categories/${id}/prizes`;

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddingPrize(false);
        setEditingPrizeId(null);
        setPrizeFormData({ name_en: '', name_fr: '', amount_fcfa: '', description_en: '', description_fr: '' });
        fetchData();
      }
    } catch (error) { console.error('Error saving prize:', error); }
  };

  const handleEditPrize = (prize) => {
    setEditingPrizeId(prize.id);
    setPrizeFormData({
      name_en: prize.name_en || '',
      name_fr: prize.name_fr || '',
      amount_fcfa: prize.amount_fcfa || '',
      description_en: prize.description_en || '',
      description_fr: prize.description_fr || ''
    });
    setIsAddingPrize(true);
  };

  const deletePrize = async (prizeId) => {
    if (!window.confirm('Are you sure you want to delete this prize?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}/prizes/${prizeId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) { console.error('Error deleting prize:', error); }
  };

  const handleShortlist = async (appId) => {
    if (!window.confirm('Mark this candidate as a finalist?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/applications/${appId}/shortlist`, { method: 'PUT' });
      if (res.ok) {
        setSelectedApplication(null);
        fetchData();
      }
    } catch (error) { console.error('Error shortlisting:', error); }
  };

  const handleSelectWinner = async (appId) => {
    if (!winnerPrizeSelection) return alert('Please select a prize to award.');
    if (!window.confirm('Assign this prize and select candidate as winner?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/applications/${appId}/select-winner`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizeId: winnerPrizeSelection })
      });
      if (res.ok) {
        setSelectedApplication(null);
        fetchData();
      }
    } catch (error) { console.error('Error selecting winner:', error); }
  };

  const handleRevokeShortlist = async (appId) => {
    if (!window.confirm('Are you sure you want to revoke the shortlisted status for this candidate?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/applications/${appId}/revoke-shortlist`, { method: 'PUT' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) { console.error('Error revoking shortlist:', error); }
  };

  const handleRevokeWinner = async (appId) => {
    if (!window.confirm('Are you sure you want to revoke the winner status for this candidate?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/applications/${appId}/revoke-winner`, { method: 'PUT' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) { console.error('Error revoking winner:', error); }
  };

  const handleAddSponsor = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...sponsorFormData };
      if (!payload.contribution_fcfa) delete payload.contribution_fcfa;
      
      const res = await fetch(`http://localhost:3000/api/categories/${id}/sponsors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSponsorFormData({ sponsor_id: '', is_primary: false, contribution_fcfa: '' });
        fetchData();
      }
    } catch (error) { console.error('Error adding sponsor:', error); }
  };

  const removeSponsor = async (sponsorId) => {
    if (!window.confirm('Are you sure you want to unlink this sponsor?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}/sponsors/${sponsorId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) { console.error('Error removing sponsor:', error); }
  };

  if (loading) return <div className="p-8 text-white font-mono">Loading Category...</div>;
  if (!category) return <div className="p-8 text-red-400 font-mono">Category Not Found</div>;

  const finalistApplications = applications.filter(a => a.status === 'finalist');
  const laureateApplications = applications.filter(a => a.status === 'laureate');
  const shortlistedApplications = applications.filter(a => a.status === 'finalist' || a.status === 'laureate');
  const newApplicationsCount = applications.filter(a => a.status === 'submitted').length;

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link to="/admin/categories" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--color-minesec-text-muted)] hover:text-white mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Categories
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-[var(--color-minesec-gold)]/10 text-[var(--color-minesec-gold)] rounded font-mono text-sm tracking-widest">{category.code}</span>
            <span className="text-[var(--color-minesec-text-muted)] font-mono text-xs uppercase tracking-wider">{category.recipient_type_name_en}</span>
          </div>
          <h2 className="text-3xl font-bold font-sans">{category.name_en}</h2>
        </div>
        
        <button 
          onClick={handleCategorySave}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] rounded-lg font-bold hover:bg-white transition-colors"
        >
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-white/10 mb-8">
        {['basic', 'content', 'timeline', 'prizes', 'sponsors', 'applications', 'shortlisted', 'winners'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-mono text-sm tracking-wider uppercase transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab 
                ? 'border-[var(--color-minesec-gold)] text-[var(--color-minesec-gold)]' 
                : 'border-transparent text-[var(--color-minesec-text-muted)] hover:text-white'
            }`}
          >
            {tab.replace('-', ' ')}
            {tab === 'applications' && newApplicationsCount > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{newApplicationsCount}</span>}
            {tab === 'shortlisted' && shortlistedApplications.length > 0 && <span className="ml-2 bg-[var(--color-minesec-gold)] text-black text-[10px] px-2 py-0.5 rounded-full">{shortlistedApplications.length}</span>}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="bento-card max-w-3xl">
          <h3 className="text-lg font-bold mb-6">Basic Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1">
              <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">Category Code</label>
              <input 
                type="text" 
                value={formData.code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none font-mono"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">Flagship Category</label>
              <div className="flex items-center gap-2 mb-2 h-11">
                <input 
                  type="checkbox" 
                  checked={isFlagship}
                  onChange={(e) => setIsFlagship(e.target.checked)}
                  id="isFlagship"
                />
                <label htmlFor="isFlagship" className="text-sm cursor-pointer">Showcase on Landing Page</label>
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">Cover Image URL (Optional)</label>
              <input 
                type="text" 
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image_url || ''}
                onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">Name (English)</label>
              <input 
                type="text" 
                value={formData.name_en || ''}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">Name (French)</label>
              <input 
                type="text" 
                value={formData.name_fr || ''}
                onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none"
              />
            </div>
            
            <div className="col-span-2 border-t border-white/10 pt-6 mt-2">
              <h4 className="text-md font-bold mb-4 text-[var(--color-minesec-gold)]">Application Deadlines</h4>
              
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  checked={formData.is_always_open || false}
                  onChange={(e) => setFormData({...formData, is_always_open: e.target.checked})}
                  id="isAlwaysOpen"
                />
                <label htmlFor="isAlwaysOpen" className="text-sm cursor-pointer font-mono uppercase tracking-wider text-[var(--color-minesec-text-muted)]">Always Open (No application deadline)</label>
              </div>

              {!formData.is_always_open && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">Applications Open At</label>
                    <input 
                      type="datetime-local" 
                      value={formData.applications_open_at ? new Date(formData.applications_open_at).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({...formData, applications_open_at: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">Applications Close At</label>
                    <input 
                      type="datetime-local" 
                      value={formData.applications_close_at ? new Date(formData.applications_close_at).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({...formData, applications_close_at: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bento-card">
              <h3 className="text-lg font-bold mb-2">Category Description (EN)</h3>
              <div className="bg-white/5 rounded-lg border border-white/10 text-white p-2">
                <Editor 
                  value={formData.description_en || ''} 
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  containerProps={{ style: { height: '300px', backgroundColor: 'transparent', color: 'white' } }}
                />
              </div>
            </div>
            <div className="bento-card">
              <h3 className="text-lg font-bold mb-2">Category Description (FR)</h3>
              <div className="bg-white/5 rounded-lg border border-white/10 text-white p-2">
                <Editor 
                  value={formData.description_fr || ''} 
                  onChange={(e) => setFormData({...formData, description_fr: e.target.value})}
                  containerProps={{ style: { height: '300px', backgroundColor: 'transparent', color: 'white' } }}
                />
              </div>
            </div>
            <div className="bento-card">
              <h3 className="text-lg font-bold mb-2">Rules & Regulations (EN)</h3>
              <div className="bg-white/5 rounded-lg border border-white/10 text-white p-2">
                <Editor 
                  value={formData.rules_en || ''} 
                  onChange={(e) => setFormData({...formData, rules_en: e.target.value})}
                  containerProps={{ style: { height: '300px', backgroundColor: 'transparent', color: 'white' } }}
                />
              </div>
            </div>
            <div className="bento-card">
              <h3 className="text-lg font-bold mb-2">Rules & Regulations (FR)</h3>
              <div className="bg-white/5 rounded-lg border border-white/10 text-white p-2">
                <Editor 
                  value={formData.rules_fr || ''} 
                  onChange={(e) => setFormData({...formData, rules_fr: e.target.value})}
                  containerProps={{ style: { height: '300px', backgroundColor: 'transparent', color: 'white' } }}
                />
              </div>
            </div>
            <div className="bento-card">
              <h3 className="text-lg font-bold mb-2">Evaluation Rubric (EN)</h3>
              <div className="bg-white/5 rounded-lg border border-white/10 text-white p-2">
                <Editor 
                  value={formData.rubric_en || ''} 
                  onChange={(e) => setFormData({...formData, rubric_en: e.target.value})}
                  containerProps={{ style: { height: '300px', backgroundColor: 'transparent', color: 'white' } }}
                />
              </div>
            </div>
            <div className="bento-card">
              <h3 className="text-lg font-bold mb-2">Evaluation Rubric (FR)</h3>
              <div className="bg-white/5 rounded-lg border border-white/10 text-white p-2">
                <Editor 
                  value={formData.rubric_fr || ''} 
                  onChange={(e) => setFormData({...formData, rubric_fr: e.target.value})}
                  containerProps={{ style: { height: '300px', backgroundColor: 'transparent', color: 'white' } }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleCategorySave} className="flex items-center gap-2 px-6 py-3 bg-[var(--color-minesec-gold)] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(207,168,94,0.3)] transition-all">
              <Save size={18} /> Save Content
            </button>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-sans">Timeline Steps</h3>
              <button 
                onClick={() => {
                  if (isAddingTimeline) { setIsAddingTimeline(false); setEditingStepId(null); }
                  else { setTimelineFormData({ position: '', name_en: '', name_fr: '', description_en: '', description_fr: '', starts_at: '', ends_at: '', status: 'upcoming', requires_jury: false, is_unlimited_candidates: true, max_candidates: '' }); setEditingStepId(null); setIsAddingTimeline(true); }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                {isAddingTimeline ? <X size={16} /> : <Plus size={16} />}
                {isAddingTimeline ? 'Cancel' : 'Add Step'}
              </button>
            </div>

            {isAddingTimeline && (
              <form onSubmit={handleTimelineSubmit} className="bento-card border-[var(--color-minesec-gold)]/50 bg-[var(--color-minesec-gold)]/5 mb-8">
                <h4 className="font-bold mb-4">{editingStepId ? 'Edit Timeline Step' : 'New Timeline Step'}</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Step Name (EN)</label>
                    <input type="text" value={timelineFormData.name_en} onChange={(e) => setTimelineFormData({...timelineFormData, name_en: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Step Name (FR)</label>
                    <input type="text" value={timelineFormData.name_fr} onChange={(e) => setTimelineFormData({...timelineFormData, name_fr: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Status</label>
                    <select value={timelineFormData.status} onChange={(e) => setTimelineFormData({...timelineFormData, status: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none">
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Position (Order)</label>
                    <input type="number" value={timelineFormData.position || ''} onChange={(e) => setTimelineFormData({...timelineFormData, position: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none font-mono" placeholder="e.g. 1" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Starts At</label>
                    <input type="datetime-local" value={timelineFormData.starts_at} onChange={(e) => setTimelineFormData({...timelineFormData, starts_at: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Ends At (Optional)</label>
                    <input type="datetime-local" value={timelineFormData.ends_at} onChange={(e) => setTimelineFormData({...timelineFormData, ends_at: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Description (EN)</label>
                    <textarea value={timelineFormData.description_en} onChange={(e) => setTimelineFormData({...timelineFormData, description_en: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" rows="2"></textarea>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Description (FR)</label>
                    <textarea value={timelineFormData.description_fr} onChange={(e) => setTimelineFormData({...timelineFormData, description_fr: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" rows="2"></textarea>
                  </div>
                  
                  <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                    <h5 className="text-sm font-bold mb-3 text-[var(--color-minesec-gold)]">Evaluation & Advancement</h5>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={timelineFormData.requires_jury} 
                          onChange={(e) => setTimelineFormData({...timelineFormData, requires_jury: e.target.checked})} 
                          id="reqJury" 
                        />
                        <label htmlFor="reqJury" className="text-sm cursor-pointer">Requires Jury (Evaluators)</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={timelineFormData.is_unlimited_candidates} 
                          onChange={(e) => setTimelineFormData({...timelineFormData, is_unlimited_candidates: e.target.checked})} 
                          id="unlimitedCand" 
                        />
                        <label htmlFor="unlimitedCand" className="text-sm cursor-pointer">All Passing Candidates Advance (Unlimited)</label>
                      </div>
                      
                      {!timelineFormData.is_unlimited_candidates && (
                        <div className="mt-2 w-1/2">
                          <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Max Candidates to Advance</label>
                          <input 
                            type="number" 
                            min="1"
                            value={timelineFormData.max_candidates} 
                            onChange={(e) => setTimelineFormData({...timelineFormData, max_candidates: e.target.value})} 
                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" 
                            placeholder="e.g. 5"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-[var(--color-minesec-gold)] text-black font-bold text-sm rounded">Save Step</button>
              </form>
            )}

            {timeline.length === 0 ? (
              <div className="p-8 border border-dashed border-white/20 rounded-xl text-center text-[var(--color-minesec-text-muted)]">No timeline steps configured.</div>
            ) : (
              <div className="space-y-3">
                {timeline.map((step) => (
                  <div key={step.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                    <div className="text-white/20"><GripVertical size={20} /></div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-mono text-xs font-bold shrink-0">{step.position}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold">{step.name_en}</h4>
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${step.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>{step.status}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditStep(step)} className="p-2 text-[var(--color-minesec-text-muted)] hover:text-white opacity-0 group-hover:opacity-100 transition-all" title="Edit Step"><Pencil size={18} /></button>
                      {step.requires_jury && (
                        <button onClick={() => openJuryModal(step)} className="p-2 text-[var(--color-minesec-text-muted)] hover:text-[var(--color-minesec-gold)] opacity-0 group-hover:opacity-100 transition-all" title="Manage Jury"><Users size={18} /></button>
                      )}
                      <button onClick={() => deleteTimelineStep(step.id)} className="p-2 text-[var(--color-minesec-text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" title="Delete Step"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prizes Tab */}
      {activeTab === 'prizes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-sans">Dynamic Prizes</h3>
              <button 
                onClick={() => {
                  if (isAddingPrize) { setIsAddingPrize(false); setEditingPrizeId(null); }
                  else { setPrizeFormData({ name_en: '', name_fr: '', amount_fcfa: '', description_en: '', description_fr: '' }); setEditingPrizeId(null); setIsAddingPrize(true); }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-minesec-gold)] text-black rounded-lg text-sm font-bold transition-colors"
              >
                {isAddingPrize ? <X size={16} /> : <Plus size={16} />}
                {isAddingPrize ? 'Cancel' : 'Add Prize'}
              </button>
            </div>

            {isAddingPrize && (
              <form onSubmit={handlePrizeSubmit} className="bento-card border-[var(--color-minesec-gold)]/50 bg-[var(--color-minesec-gold)]/5 mb-8">
                <h4 className="font-bold mb-4">{editingPrizeId ? 'Edit Prize' : 'New Prize'}</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Prize Title (EN)</label>
                    <input type="text" value={prizeFormData.name_en} onChange={(e) => setPrizeFormData({...prizeFormData, name_en: e.target.value})} placeholder="e.g. 1st Prize" className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Prize Title (FR)</label>
                    <input type="text" value={prizeFormData.name_fr} onChange={(e) => setPrizeFormData({...prizeFormData, name_fr: e.target.value})} placeholder="e.g. 1er Prix" className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Financial Amount (FCFA)</label>
                    <input type="number" value={prizeFormData.amount_fcfa} onChange={(e) => setPrizeFormData({...prizeFormData, amount_fcfa: e.target.value})} placeholder="Optional" className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none font-mono" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Description (EN)</label>
                    <textarea value={prizeFormData.description_en} onChange={(e) => setPrizeFormData({...prizeFormData, description_en: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" rows="2" placeholder="e.g. Laptop + Full Scholarship"></textarea>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Description (FR)</label>
                    <textarea value={prizeFormData.description_fr} onChange={(e) => setPrizeFormData({...prizeFormData, description_fr: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" rows="2" placeholder="ex. Ordinateur + Bourse"></textarea>
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-[var(--color-minesec-gold)] text-black font-bold text-sm rounded">Save Prize</button>
              </form>
            )}

            {prizes.length === 0 ? (
              <div className="p-8 border border-dashed border-white/20 rounded-xl text-center text-[var(--color-minesec-text-muted)]">No dynamic prizes configured.</div>
            ) : (
              <div className="space-y-3">
                {prizes.map((prize) => (
                  <div key={prize.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-minesec-gold)]/20 text-[var(--color-minesec-gold)] flex items-center justify-center font-mono text-xs font-bold shrink-0">{prize.position}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold">{prize.name_en}</h4>
                        {prize.amount_fcfa && <span className="text-xs font-mono text-[var(--color-minesec-gold)]">{parseInt(prize.amount_fcfa).toLocaleString()} FCFA</span>}
                      </div>
                      {prize.description_en && <p className="text-xs text-[var(--color-minesec-text-muted)] mt-1">{prize.description_en}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditPrize(prize)} className="p-2 text-[var(--color-minesec-text-muted)] hover:text-white opacity-0 group-hover:opacity-100 transition-all"><Pencil size={18} /></button>
                      <button onClick={() => deletePrize(prize.id)} className="p-2 text-[var(--color-minesec-text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sponsors Tab */}
      {activeTab === 'sponsors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-sans">Category Sponsors</h3>
            </div>
            
            <form onSubmit={handleAddSponsor} className="bento-card border-[var(--color-minesec-gold)]/50 bg-[var(--color-minesec-gold)]/5 mb-8">
              <h4 className="font-bold mb-4">Link a Sponsor</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Select Sponsor</label>
                  <select value={sponsorFormData.sponsor_id} onChange={(e) => setSponsorFormData({...sponsorFormData, sponsor_id: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none" required>
                    <option value="">-- Choose --</option>
                    {allSponsors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Contribution (FCFA)</label>
                  <input type="number" value={sponsorFormData.contribution_fcfa} onChange={(e) => setSponsorFormData({...sponsorFormData, contribution_fcfa: e.target.value})} placeholder="Optional" className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none font-mono" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="isPrimary" checked={sponsorFormData.is_primary} onChange={(e) => setSponsorFormData({...sponsorFormData, is_primary: e.target.checked})} />
                  <label htmlFor="isPrimary" className="text-sm">This is the Primary Sponsor for this category</label>
                </div>
              </div>
              <button type="submit" className="px-4 py-2 bg-[var(--color-minesec-gold)] text-black font-bold text-sm rounded">Link Sponsor</button>
            </form>

            {sponsors.length === 0 ? (
              <div className="p-8 border border-dashed border-white/20 rounded-xl text-center text-[var(--color-minesec-text-muted)]">No sponsors linked to this category yet.</div>
            ) : (
              <div className="space-y-3">
                {sponsors.map(sponsor => (
                  <div key={sponsor.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    {sponsor.logo_storage_key ? (
                      <img src={`http://localhost:3000/uploads/${sponsor.logo_storage_key}`} alt={sponsor.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center font-mono text-xs">IMG</div>
                    )}
                    <div className="flex-1">
                      <div className="font-bold flex items-center gap-2">
                        {sponsor.name}
                        {sponsor.is_primary && <span className="bg-[var(--color-minesec-gold)] text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded">Primary</span>}
                      </div>
                      <div className="text-xs text-[var(--color-minesec-text-muted)]">{sponsor.tier}</div>
                    </div>
                    <button onClick={() => removeSponsor(sponsor.id)} className="p-2 text-[var(--color-minesec-text-muted)] hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bento-card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold">All Applications ({applications.length})</h3>
          </div>
          {applications.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-minesec-text-muted)] font-mono">No applications submitted yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[var(--color-minesec-text-muted)] font-mono uppercase text-xs">
                <tr>
                  <th className="p-4 font-normal tracking-wider">Reference</th>
                  <th className="p-4 font-normal tracking-wider">Applicant Name</th>
                  <th className="p-4 font-normal tracking-wider">Date</th>
                  <th className="p-4 font-normal tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-[var(--color-minesec-gold)]">{app.reference}</td>
                    <td className="p-4 font-bold flex items-center gap-2">
                      {app.data.contact?.full_name || 'Anonymous'}
                      {app.status === 'finalist' && <span className="bg-[var(--color-minesec-gold)] text-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">Shortlisted</span>}
                      {app.status === 'laureate' && <span className="bg-green-500 text-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">Winner</span>}
                    </td>
                    <td className="p-4 text-[var(--color-minesec-text-muted)]">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedApplication(app)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-mono text-xs transition-colors">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Shortlisted Tab */}
      {activeTab === 'shortlisted' && (
        <div className="bento-card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--color-minesec-gold)]">Shortlisted Candidates ({shortlistedApplications.length})</h3>
          </div>
          {shortlistedApplications.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-minesec-text-muted)] font-mono">No candidates have been shortlisted yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[var(--color-minesec-text-muted)] font-mono uppercase text-xs">
                <tr>
                  <th className="p-4 font-normal tracking-wider">Reference</th>
                  <th className="p-4 font-normal tracking-wider">Applicant Name</th>
                  <th className="p-4 font-normal tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {shortlistedApplications.map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-[var(--color-minesec-gold)]">{app.reference}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold">
                        {app.data.contact?.full_name || 'Anonymous'}
                        {app.status === 'laureate' && <span className="bg-green-500 text-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">Winner</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {app.status === 'finalist' ? (
                          <>
                            <button onClick={() => handleRevokeShortlist(app.id)} className="px-3 py-1 bg-white/5 text-[var(--color-minesec-text-muted)] hover:bg-red-500/20 hover:text-red-400 rounded font-mono text-xs transition-colors">Revoke</button>
                            <button onClick={() => setSelectedApplication(app)} className="px-3 py-1 bg-[var(--color-minesec-gold)] text-black hover:bg-white rounded font-mono text-xs font-bold transition-colors">Select Winner</button>
                          </>
                        ) : (
                          <button onClick={() => setSelectedApplication(app)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-mono text-xs transition-colors">Review</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Winners Tab */}
      {activeTab === 'winners' && (
        <div className="bento-card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-green-400">Selected Winners ({laureateApplications.length})</h3>
          </div>
          {laureateApplications.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-minesec-text-muted)] font-mono">No winners have been selected yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[var(--color-minesec-text-muted)] font-mono uppercase text-xs">
                <tr>
                  <th className="p-4 font-normal tracking-wider">Reference</th>
                  <th className="p-4 font-normal tracking-wider">Applicant Name</th>
                  <th className="p-4 font-normal tracking-wider">Awarded Prize</th>
                  <th className="p-4 font-normal tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {laureateApplications.map(app => {
                  const laureateInfo = app.laureates ? app.laureates[0] : null;
                  const prizeInfo = prizes.find(p => p.position === laureateInfo?.rank);
                  return (
                    <tr key={app.id} className="bg-green-500/5 hover:bg-green-500/10 transition-colors">
                      <td className="p-4 font-mono text-green-400">
                        <div className="flex items-center gap-2"><CheckCircle size={16} /> {app.reference}</div>
                      </td>
                      <td className="p-4 font-bold">{app.data.contact?.full_name || 'Anonymous'}</td>
                      <td className="p-4 text-[var(--color-minesec-text-muted)] font-mono text-xs">
                        {prizeInfo ? prizeInfo.name_en : `Rank ${laureateInfo?.rank}`}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleRevokeWinner(app.id)} className="px-3 py-1 bg-white/5 text-[var(--color-minesec-text-muted)] hover:bg-red-500/20 hover:text-red-400 rounded font-mono text-xs transition-colors">Revoke Winner</button>
                          <button onClick={() => setSelectedApplication(app)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-mono text-xs transition-colors">Review</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#020a07] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#020a07]/90 backdrop-blur z-10">
              <div>
                <h3 className="text-xl font-bold">Application Review</h3>
                <span className="font-mono text-[var(--color-minesec-gold)] text-sm">{selectedApplication.reference}</span>
              </div>
              <button onClick={() => { setSelectedApplication(null); setWinnerPrizeSelection(''); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Applicant Info</h4>
                  <div className="space-y-4">
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Full Name</span><strong className="text-lg">{selectedApplication.data.contact?.full_name}</strong></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Email</span><span>{selectedApplication.data.contact?.email}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Phone</span><span className="font-mono">{selectedApplication.data.contact?.phone}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">DOB / Creation Date</span><span>{selectedApplication.data.contact?.dob}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Location</h4>
                  <div className="space-y-4">
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Region</span><span>{selectedApplication.data.location?.region}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Division</span><span>{selectedApplication.data.location?.division}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">Sub-Division</span><span>{selectedApplication.data.location?.sub_division}</span></div>
                    <div><span className="block text-xs text-[var(--color-minesec-text-muted)]">School</span><span>{selectedApplication.data.location?.school}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Justification</h4>
                <p className="whitespace-pre-wrap text-[var(--color-minesec-text-muted)] leading-relaxed bg-white/5 p-4 rounded-lg">
                  {selectedApplication.data.justification}
                </p>
              </div>

              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Supporting Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedApplication.documents.map(doc => (
                      <a key={doc.id} href={`http://localhost:3000/uploads/${doc.filename}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-[var(--color-minesec-gold)] transition-colors group">
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
              <button onClick={() => { setSelectedApplication(null); setWinnerPrizeSelection(''); }} className="px-6 py-2 rounded font-bold transition-colors hover:bg-white/10">Close</button>
              
              {selectedApplication.status === 'submitted' && (
                <button onClick={() => handleShortlist(selectedApplication.id)} className="px-6 py-2 bg-[var(--color-minesec-gold)] text-black rounded font-bold transition-colors hover:bg-white shadow-[0_0_15px_rgba(207,168,94,0.3)]">
                  Shortlist Candidate
                </button>
              )}

              {selectedApplication.status === 'finalist' && (
                <div className="flex items-center gap-4">
                  <select 
                    value={winnerPrizeSelection}
                    onChange={e => setWinnerPrizeSelection(e.target.value)}
                    className="bg-[#020a07] border border-white/20 rounded px-4 py-2 text-sm focus:border-[var(--color-minesec-gold)] outline-none"
                  >
                    <option value="">-- Assign Prize --</option>
                    {prizes.map(p => (
                      <option key={p.id} value={p.id}>{p.name_en}</option>
                    ))}
                  </select>
                  <button onClick={() => handleSelectWinner(selectedApplication.id)} className="px-6 py-2 bg-[var(--color-minesec-gold)] text-black rounded font-bold transition-colors hover:bg-white shadow-[0_0_15px_rgba(207,168,94,0.3)] flex items-center gap-2">
                    <CheckCircle size={18} /> Confirm Winner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Jury Management Modal */}
      {isJuryModalOpen && activeJuryStep && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#020a07] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#020a07]/90 backdrop-blur z-10">
              <div>
                <h3 className="text-xl font-bold">Manage Jury</h3>
                <span className="font-mono text-[var(--color-minesec-text-muted)] text-sm">Step {activeJuryStep.position}: {activeJuryStep.name_en}</span>
              </div>
              <button onClick={() => { setIsJuryModalOpen(false); setActiveJuryStep(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              
              <div className="bento-card border-[var(--color-minesec-gold)]/30">
                <h4 className="font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-[var(--color-minesec-gold)]"/> Invite Jury Member</h4>
                <form onSubmit={inviteJuryMember} className="flex gap-4">
                  <input 
                    type="email" 
                    placeholder="Enter email address..." 
                    value={newJuryEmail}
                    onChange={(e) => setNewJuryEmail(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-[var(--color-minesec-gold)] outline-none"
                    required
                  />
                  <button type="submit" className="px-6 py-2 bg-[var(--color-minesec-gold)] text-black font-bold rounded-lg hover:bg-white transition-colors whitespace-nowrap">
                    Send Invite Link
                  </button>
                </form>
                <p className="mt-3 text-xs text-[var(--color-minesec-text-muted)]">
                  Invited members will receive an email with a secure "Magic Link" to access the evaluation portal. No account creation required.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Invited Jury Members ({juryMembers.length})</h4>
                {juryMembers.length === 0 ? (
                  <div className="p-6 border border-dashed border-white/10 rounded-xl text-center text-[var(--color-minesec-text-muted)]">
                    No jury members invited for this step yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {juryMembers.map(jury => (
                      <div key={jury.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div>
                          <div className="font-bold">{jury.email}</div>
                          <div className="text-xs font-mono mt-1 flex items-center gap-2">
                            <span className="text-[var(--color-minesec-text-muted)]">Status:</span>
                            {jury.has_voted ? (
                              <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Voted</span>
                            ) : (
                              <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">Pending</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`http://localhost:5173/evaluate?token=${jury.access_token}`);
                              alert('Magic link copied to clipboard!');
                            }}
                            className="p-2 text-[var(--color-minesec-text-muted)] hover:text-white transition-colors"
                            title="Copy Magic Link"
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            onClick={() => removeJuryMember(jury.id)} 
                            className="p-2 text-[var(--color-minesec-text-muted)] hover:text-red-400 transition-colors"
                            title="Revoke Access"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/50 flex justify-between items-center">
              <div className="text-xs text-[var(--color-minesec-text-muted)]">
                {juryMembers.filter(j => j.has_voted).length} of {juryMembers.length} members have voted
              </div>
              <button 
                onClick={() => triggerAdvancement(activeJuryStep.id)}
                className="px-6 py-2 bg-green-500/20 text-green-400 rounded font-bold hover:bg-green-500 hover:text-white transition-colors"
              >
                Tally Votes & Advance Candidates
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryManager;
