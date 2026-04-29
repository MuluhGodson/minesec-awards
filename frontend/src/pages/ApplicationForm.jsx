import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ApplicationForm = () => {
  const { t, language } = useLanguage();
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [locations, setLocations] = useState({ regions: [], schools: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    region: '',
    division: '',
    sub_division: '',
    school: '',
    justification: ''
  });
  const [files, setFiles] = useState([]);
  const [coverPhoto, setCoverPhoto] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const initData = async () => {
      try {
        const catRes = await fetch(`http://localhost:3000/api/categories/${categoryId}`);
        const catData = await catRes.json();
        
        if (catData.status === 'success') setCategory(catData.data);
        
        // Mockup Locations
        const mockupLocations = {
          regions: [
            { id: 1, name_en: "Centre" },
            { id: 2, name_en: "Littoral" },
            { id: 3, name_en: "West" },
            { id: 4, name_en: "North West" },
            { id: 5, name_en: "South West" }
          ],
          schools: [
            { id: 1, region_id: 1, department: "Mfoundi", city: "Yaounde I", name: "Lycée Général Leclerc" },
            { id: 2, region_id: 1, department: "Mfoundi", city: "Yaounde II", name: "Lycée de Tsinga" },
            { id: 3, region_id: 2, department: "Wouri", city: "Douala I", name: "Lycée Joss" },
            { id: 4, region_id: 2, department: "Wouri", city: "Douala V", name: "Lycée de Makepe" },
            { id: 5, region_id: 3, department: "Mifi", city: "Bafoussam I", name: "Lycée Classique de Bafoussam" },
            { id: 6, region_id: 4, department: "Mezam", city: "Bamenda", name: "GBHS Bamenda" },
            { id: 7, region_id: 5, department: "Fako", city: "Buea", name: "BGS Molyko" }
          ]
        };
        setLocations(mockupLocations);
      } catch (error) {
        console.error('Failed to initialize application form', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => payload.append(key, formData[key]));
    
    if (coverPhoto) {
      const renamedFile = new File([coverPhoto], `COVER_PHOTO_${coverPhoto.name}`, { type: coverPhoto.type });
      payload.append('documents', renamedFile);
    }
    
    for (let i = 0; i < files.length; i++) {
      payload.append('documents', files[i]);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/applications/public/${categoryId}`, {
        method: 'POST',
        body: payload
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccessReference(data.data.reference);
      } else {
        alert(`${t('appForm.fail')} ` + data.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(t('appForm.netError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  if (loading) {
    return <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center font-mono text-[var(--color-minesec-text-muted)]">{t('appForm.loading')}</div>;
  }

  if (!category) {
    return <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center font-mono text-red-400">{t('appForm.notFound')}</div>;
  }

  if (successReference) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 relative z-10 flex items-center justify-center">
        <div className="bento-card max-w-xl w-full text-center p-12">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">{t('appForm.received')}</h2>
          <p className="text-[var(--color-minesec-text-muted)] mb-6">
            {t('appForm.receivedDesc')} <strong>{category[`name_${language}`]}</strong> {t('appForm.recorded')}
          </p>
          <div className="bg-[#020a07] border border-[var(--color-minesec-gold)]/30 rounded-xl p-6 mb-8">
            <span className="block text-xs font-mono uppercase tracking-widest text-[var(--color-minesec-text-muted)] mb-2">{t('appForm.tracking')}</span>
            <span className="text-2xl font-mono font-bold text-[var(--color-minesec-gold)]">{successReference}</span>
          </div>
          <Link to="/" className="inline-block px-8 py-3 bg-[var(--color-minesec-gold)] text-black rounded font-bold hover:bg-white transition-colors">
            {t('appForm.home')}
          </Link>
        </div>
      </div>
    );
  }

  // Derive unique divisions based on selected region
  const availableDivisions = [...new Set(
    locations.schools
      .filter(s => s.region_id.toString() === formData.region)
      .map(s => s.department)
      .filter(Boolean)
  )].sort();

  // Derive unique subdivisions based on selected division
  const availableSubDivisions = [...new Set(
    locations.schools
      .filter(s => s.department === formData.division)
      .map(s => s.city)
      .filter(Boolean)
  )].sort();

  // Derive schools based on selected subdivision
  const availableSchools = locations.schools
    .filter(s => s.city === formData.sub_division)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="pt-32 pb-24 px-6 relative z-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link to={`/categories/${category.id}`} className="inline-flex items-center gap-2 text-[var(--color-minesec-text-muted)] hover:text-white transition-colors mb-8 font-mono text-xs uppercase tracking-wider">
          <ArrowLeft size={16} /> {t('appForm.cancel')}
        </Link>

        <div className="bento-card relative overflow-hidden p-0 border-[var(--color-minesec-gold)]/20 shadow-[0_0_40px_rgba(207,168,94,0.05)]">
          <div className="p-8 md:p-12 border-b border-white/10 bg-gradient-to-r from-[var(--color-minesec-gold)]/10 to-transparent">
            <span className="text-[var(--color-minesec-gold)] font-mono text-xs tracking-widest uppercase mb-2 block">{t('appForm.title')}</span>
            <h1 className="text-3xl md:text-4xl font-bold font-sans">{category[`name_${language}`]}</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            
            <section>
              <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--color-minesec-gold)] mb-6 flex items-center gap-4">
                <span className="w-4 h-px bg-[var(--color-minesec-gold)]"></span>
                {t('appForm.sec1')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.name')}</label>
                  <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.email')}</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.phone')}</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors font-mono" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.dob')}</label>
                  <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors font-mono" />
                </div>
                <div className="md:col-span-2 mt-4">
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.photo')}</label>
                  <p className="text-xs text-[var(--color-minesec-text-muted)] mb-3">{t('appForm.photoDesc')}</p>
                  <div className="border border-white/10 rounded-lg p-4 bg-[#020a07] flex items-center gap-4 focus-within:border-[var(--color-minesec-gold)] transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {coverPhoto ? (
                        <img src={URL.createObjectURL(coverPhoto)} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : (
                        <UploadCloud size={20} className="text-[var(--color-minesec-text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        required
                        accept="image/*"
                        onChange={(e) => { if (e.target.files && e.target.files[0]) setCoverPhoto(e.target.files[0]) }}
                        className="block w-full text-sm text-[var(--color-minesec-text-muted)]
                          file:mr-4 file:py-2 file:px-4 file:cursor-pointer
                          file:rounded-full file:border-0
                          file:text-xs file:font-bold
                          file:bg-[var(--color-minesec-gold)]/10 file:text-[var(--color-minesec-gold)]
                          hover:file:bg-[var(--color-minesec-gold)] hover:file:text-black transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--color-minesec-gold)] mb-6 flex items-center gap-4">
                <span className="w-4 h-px bg-[var(--color-minesec-gold)]"></span>
                {t('appForm.sec2')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.region')}</label>
                  <select required value={formData.region} onChange={e => setFormData({...formData, region: e.target.value, division: '', sub_division: '', school: ''})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors">
                    <option value="">{t('appForm.selRegion')}</option>
                    {locations.regions.map(r => <option key={r.id} value={r.id}>{r[`name_${language}`] || r.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.div')}</label>
                  <select required disabled={!formData.region} value={formData.division} onChange={e => setFormData({...formData, division: e.target.value, sub_division: '', school: ''})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors disabled:opacity-50">
                    <option value="">{t('appForm.selDiv')}</option>
                    {availableDivisions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.subDiv')}</label>
                  <select required disabled={!formData.division} value={formData.sub_division} onChange={e => setFormData({...formData, sub_division: e.target.value, school: ''})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors disabled:opacity-50">
                    <option value="">{t('appForm.selSubDiv')}</option>
                    {availableSubDivisions.map(sd => <option key={sd} value={sd}>{sd}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.school')}</label>
                  <select disabled={!formData.sub_division} value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors disabled:opacity-50">
                    <option value="">{t('appForm.selSchool')}</option>
                    {availableSchools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--color-minesec-gold)] mb-6 flex items-center gap-4">
                <span className="w-4 h-px bg-[var(--color-minesec-gold)]"></span>
                {t('appForm.sec3')}
              </h3>
              <div>
                <label className="block text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.why')}</label>
                <textarea required value={formData.justification} onChange={e => setFormData({...formData, justification: e.target.value})} rows="6" className="w-full bg-[#020a07] border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-minesec-gold)] outline-none transition-colors resize-none" placeholder={t('appForm.whyDesc')}></textarea>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--color-minesec-text-muted)] mb-6 flex items-center gap-4">
                <span className="w-4 h-px bg-white/20"></span>
                {t('appForm.sec4')}
              </h3>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-[#020a07] hover:border-[var(--color-minesec-gold)]/50 transition-colors relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,.pdf"
                />
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-[var(--color-minesec-gold)]">
                  <UploadCloud size={24} />
                </div>
                <p className="font-bold mb-1">{t('appForm.clickDrag')}</p>
                <p className="text-xs text-[var(--color-minesec-text-muted)] font-mono">{t('appForm.fileTypes')}</p>
                
                {files.length > 0 && (
                  <div className="mt-6 text-left border-t border-white/10 pt-4">
                    <p className="text-xs font-mono text-[var(--color-minesec-text-muted)] uppercase mb-2">{t('appForm.selected')}</p>
                    <ul className="space-y-1">
                      {files.map((f, i) => (
                        <li key={i} className="text-sm font-mono text-[var(--color-minesec-gold)] truncate">• {f.name} ({(f.size/1024/1024).toFixed(2)}MB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-xs text-[var(--color-minesec-text-muted)] max-w-sm">
                {t('appForm.attest')}
              </p>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-10 py-4 bg-gradient-to-r from-[var(--color-minesec-gold-dark)] to-[var(--color-minesec-gold)] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(207,168,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? t('appForm.submitting') : t('appForm.submit')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
