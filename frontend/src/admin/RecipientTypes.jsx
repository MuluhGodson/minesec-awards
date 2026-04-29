import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

const RecipientTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name_fr: '',
    name_en: ''
  });

  const fetchTypes = async () => {
    try {
      const res = await apiFetch('/recipient-types');
      setTypes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openCreateModal = () => {
    setFormData({ code: '', name_fr: '', name_en: '' });
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (type) => {
    setFormData({
      code: type.code,
      name_fr: type.name_fr,
      name_en: type.name_en
    });
    setIsEditing(true);
    setEditId(type.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this target audience?')) {
      try {
        await apiFetch(`/recipient-types/${id}`, { method: 'DELETE' });
        fetchTypes();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiFetch(`/recipient-types/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiFetch('/recipient-types', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      fetchTypes();
    } catch (err) {
      alert('Failed to save target audience: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-sans">Target Audiences</h2>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[var(--color-minesec-gold)]/20 text-[var(--color-minesec-gold)] px-4 py-2 rounded-lg border border-[var(--color-minesec-gold)]/30 hover:bg-[var(--color-minesec-gold)]/30 transition-colors"
        >
          <Plus size={18} /> New Audience
        </button>
      </div>

      <div className="bento-card p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Code</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Name (EN)</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider">Name (FR)</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--color-minesec-text-muted)] tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-[var(--color-minesec-text-muted)]">Loading...</td></tr>
            ) : types.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-[var(--color-minesec-text-muted)]">No target audiences found.</td></tr>
            ) : (
              types.map(type => (
                <tr key={type.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-[var(--color-minesec-gold)]">{type.code}</td>
                  <td className="p-4 text-sm font-bold">{type.name_en}</td>
                  <td className="p-4 text-sm">{type.name_fr}</td>
                  <td className="p-4 text-right flex justify-end gap-3">
                    <button onClick={() => openEditModal(type)} className="text-[var(--color-minesec-text-muted)] hover:text-white transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(type.id)} className="text-[var(--color-minesec-text-muted)] hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
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
            <h3 className="text-xl font-bold mb-6">{isEditing ? 'Edit Target Audience' : 'Create New Audience'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Code (e.g., student, teacher)</label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Name (English)</label>
                <input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--color-minesec-text-muted)] mb-1">Name (French)</label>
                <input type="text" value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white" required />
              </div>
              
              <button type="submit" className="w-full bg-[var(--color-minesec-gold)] text-black font-bold py-3 rounded mt-4">
                {isEditing ? 'Save Changes' : 'Create Audience'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientTypes;
