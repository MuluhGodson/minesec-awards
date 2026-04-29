import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Plus, X } from 'lucide-react';

const Editions = () => {
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() + 1,
    roman_numeral: '',
    name_fr: '',
    name_en: '',
    status: 'draft'
  });

  const fetchEditions = async () => {
    try {
      const res = await apiFetch('/editions');
      setEditions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/editions', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      fetchEditions();
    } catch (err) {
      alert('Failed to create edition: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-sans">Editions</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--color-minesec-gold)]/20 text-[var(--color-minesec-gold)] px-4 py-2 rounded-lg border border-[var(--color-minesec-gold)]/30 hover:bg-[var(--color-minesec-gold)]/30 transition-colors"
        >
          <Plus size={18} /> New Edition
        </button>
      </div>

      <div className="bento-card p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Year</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Name (FR)</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Name (EN)</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-[var(--color-minesec-text-muted)]">Loading...</td></tr>
            ) : editions.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-[var(--color-minesec-text-muted)]">No editions found.</td></tr>
            ) : (
              editions.map(ed => (
                <tr key={ed.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">{ed.year} <span className="font-serif italic text-[var(--color-minesec-gold)] font-normal text-sm ml-2">{ed.roman_numeral}</span></td>
                  <td className="p-4 text-sm">{ed.name_fr}</td>
                  <td className="p-4 text-sm">{ed.name_en}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono uppercase tracking-wider">{ed.status}</span>
                  </td>
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
            <h3 className="text-xl font-bold mb-6">Create New Edition</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Year</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Roman Numeral</label>
                  <input type="text" value={formData.roman_numeral} onChange={e => setFormData({...formData, roman_numeral: e.target.value})} placeholder="e.g. XVII" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Name (French)</label>
                <input type="text" value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Name (English)</label>
                <input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
              </div>
              
              <button type="submit" className="w-full bg-[var(--color-minesec-gold)] text-black font-bold py-3 rounded mt-4">Save Edition</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editions;
