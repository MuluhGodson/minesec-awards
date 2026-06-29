import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [editions, setEditions] = useState([]);
  const [recipientTypes, setRecipientTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    edition_id: '',
    code: '',
    name_fr: '',
    name_en: '',
    recipient_type_id: '',
    prize_amount_fcfa: '',
    display_order: 100
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, edRes, rtRes] = await Promise.all([
        fetch(`${API_BASE}/api/categories`),
        fetch(`${API_BASE}/api/editions`),
        fetch(`${API_BASE}/api/recipient-types`)
      ]);
      const catData = await catRes.json();
      const edData = await edRes.json();
      const rtData = await rtRes.json();

      if (catData.status === 'success') setCategories(catData.data);
      if (edData.status === 'success') setEditions(edData.data);
      if (rtData.status === 'success') setRecipientTypes(rtData.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ edition_id: '', code: '', name_fr: '', name_en: '', recipient_type_id: '', prize_amount_fcfa: '', display_order: 100 });
        fetchData();
      } else {
        const errorData = await res.json();
        alert('Failed to create category: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create category', error);
      alert('Failed to create category: Network or server error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold font-sans">Award Categories</h2>
          <p className="text-[var(--color-minesec-text-muted)] text-sm mt-1">Manage categories and their configurations</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] rounded-lg font-bold hover:bg-white transition-colors"
        >
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </div>

      {/* Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-minesec-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-minesec-gold)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/50 text-[var(--color-minesec-text-muted)] font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Category Name (EN)</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-[var(--color-minesec-text-muted)] font-mono">Loading...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-[var(--color-minesec-text-muted)] font-mono">No categories found</td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-[var(--color-minesec-gold)]">{category.code}</td>
                    <td className="px-6 py-4 font-medium">{category.name_en}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono uppercase tracking-wider text-[var(--color-minesec-text-muted)]">
                        {category.recipient_type_name_en || category.recipient_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/categories/${category.id}`)}
                        className="px-4 py-1.5 rounded bg-[var(--color-minesec-gold)]/10 text-[var(--color-minesec-gold)] border border-[var(--color-minesec-gold)]/20 hover:bg-[var(--color-minesec-gold)] hover:text-[var(--color-minesec-green-dark)] transition-all font-bold text-xs"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#020b08] border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold">Add New Category</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--color-minesec-text-muted)] hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Edition</label>
                  <select 
                    value={formData.edition_id}
                    onChange={(e) => setFormData({...formData, edition_id: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 focus:border-[var(--color-minesec-gold)] outline-none"
                    required
                  >
                    <option value="">Select Edition</option>
                    {editions.map(ed => (
                      <option key={ed.id} value={ed.id}>{ed.year} - {ed.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Target Audience</label>
                  <select 
                    value={formData.recipient_type_id || ''}
                    onChange={(e) => setFormData({...formData, recipient_type_id: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 focus:border-[var(--color-minesec-gold)] outline-none"
                    required
                  >
                    <option value="">Select Target Audience</option>
                    {recipientTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. A.01"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 focus:border-[var(--color-minesec-gold)] outline-none font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Financial Prize (FCFA)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500000"
                    value={formData.prize_amount_fcfa}
                    onChange={(e) => setFormData({...formData, prize_amount_fcfa: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 focus:border-[var(--color-minesec-gold)] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Name (EN)</label>
                  <input 
                    type="text" 
                    value={formData.name_en}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 focus:border-[var(--color-minesec-gold)] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-1">Name (FR)</label>
                  <input 
                    type="text" 
                    value={formData.name_fr}
                    onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 focus:border-[var(--color-minesec-gold)] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-[var(--color-minesec-text-muted)] hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] rounded font-bold hover:bg-white transition-colors">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
