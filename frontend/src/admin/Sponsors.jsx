import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Plus, X } from 'lucide-react';
import { API_BASE } from '../config';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    tier: 'institutional',
    sector: '',
    website: '',
    logo: null
  });

  const fetchSponsors = async () => {
    try {
      const res = await apiFetch('/sponsors');
      setSponsors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('legal_name', formData.legal_name);
      data.append('tier', formData.tier);
      data.append('sector', formData.sector);
      data.append('website', formData.website);
      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      await apiFetch('/sponsors', {
        method: 'POST',
        body: data
      });
      setShowModal(false);
      setFormData({ name: '', legal_name: '', tier: 'institutional', sector: '', website: '', logo: null });
      fetchSponsors();
    } catch (err) {
      alert('Failed to create sponsor: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-sans">Sponsors & Partners</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--color-minesec-gold)]/20 text-[var(--color-minesec-gold)] px-4 py-2 rounded-lg border border-[var(--color-minesec-gold)]/30 hover:bg-[var(--color-minesec-gold)]/30 transition-colors"
        >
          <Plus size={18} /> New Sponsor
        </button>
      </div>

      <div className="bento-card p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Logo</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Name</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Tier</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Sector</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-[var(--color-minesec-text-muted)]">Loading...</td></tr>
            ) : sponsors.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-[var(--color-minesec-text-muted)]">No sponsors found.</td></tr>
            ) : (
              sponsors.map(sponsor => (
                <tr key={sponsor.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    {sponsor.logo_storage_key ? (
                      <img src={`${API_BASE}/uploads/${sponsor.logo_storage_key}`} alt="Logo" className="h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs text-white/50">N/A</div>
                    )}
                  </td>
                  <td className="p-4 text-sm font-bold">{sponsor.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-[var(--color-minesec-gold)]/10 text-[var(--color-minesec-gold)] rounded text-xs font-mono uppercase tracking-wider">{sponsor.tier}</span>
                  </td>
                  <td className="p-4 text-sm text-[var(--color-minesec-text-muted)]">{sponsor.sector}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bento-card w-full max-w-lg p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[var(--color-minesec-text-muted)] hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-6">Create New Sponsor</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Display Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Tier</label>
                  <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} className="w-full bg-[#010604] border border-white/10 rounded px-3 py-2 text-white" required>
                    <option value="patronage">Patronage</option>
                    <option value="platinum">Platinum</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="bronze">Bronze</option>
                    <option value="institutional">Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Sector</label>
                  <input type="text" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} placeholder="e.g. Telecom" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Logo (PNG/JPG)</label>
                <input type="file" accept="image/*" onChange={e => setFormData({...formData, logo: e.target.files[0]})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm" />
              </div>
              
              <button type="submit" className="w-full bg-[var(--color-minesec-gold)] text-black font-bold py-3 rounded mt-4">Save Sponsor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sponsors;
