import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const StatusPill = ({ status }) => {
  const { t } = useLanguage();
  const styles = {
    draft: "border-gray-500/30 bg-gray-500/10 text-gray-400",
    open: "border-green-500/30 bg-green-500/10 text-green-400",
    evaluating: "border-[var(--color-minesec-gold)]/30 bg-[var(--color-minesec-gold)]/10 text-[var(--color-minesec-gold)]",
    closed: "border-white/10 bg-white/5 text-[var(--color-minesec-text-muted)]"
  };

  const finalStatus = status || 'open';

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${styles[finalStatus]} text-[10px] font-mono tracking-wider uppercase`}>
      {finalStatus === 'open' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>}
      {finalStatus === 'evaluating' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-minesec-gold)]"></div>}
      {finalStatus === 'closed' && <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>}
      {t(`status.${finalStatus}`)}
    </div>
  );
};

const CategoriesSection = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        const data = await response.json();
        if (data.status === 'success') {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filterMap = new Map();
  categories.forEach(c => {
    const type = c.recipient_type_code || 'other';
    const label = c[`recipient_type_name_${language}`] || 'Other';
    if (!filterMap.has(type)) {
      filterMap.set(type, { id: type, label, count: 0 });
    }
    filterMap.get(type).count++;
  });

  const FILTERS = [
    { id: 'all', label: t('categories.all'), count: categories.length },
    ...Array.from(filterMap.values())
  ];

  const filteredCategories = categories.filter(c => activeFilter === 'all' || (c.recipient_type_code || 'other') === activeFilter);

  return (
    <section id="categories" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gradient-to-r from-[var(--color-minesec-gold)] to-transparent w-12"></div>
              <h2 className="font-mono text-sm tracking-widest text-[var(--color-minesec-gold)] uppercase">{t('categories.titleSub')}</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-sans font-bold">
              {t('categories.titleStart')} <span className="font-serif italic font-normal text-gold-gradient">{t('categories.titleHighlight')}</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!loading && FILTERS.map(f => (
              <button 
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                  activeFilter === f.id 
                    ? 'border-[var(--color-minesec-gold)] bg-[var(--color-minesec-gold)]/10 text-white' 
                    : 'border-white/10 bg-white/5 text-[var(--color-minesec-text-muted)] hover:border-white/30 hover:text-white'
                }`}
              >
                {f.label}
                <span className="font-mono text-[10px] opacity-70 bg-black/20 px-1.5 py-0.5 rounded-md">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bento-grid">
          {loading ? (
            <div className="col-span-full py-12 text-center text-[var(--color-minesec-text-muted)] font-mono">
              {t('categories.loading')}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[var(--color-minesec-text-muted)] font-mono">
              {t('categories.empty')}
            </div>
          ) : (
            filteredCategories.map((cat, i) => {
              const spans = [4, 2, 3, 3, 6, 2, 4];
              const span = spans[i % spans.length];

              const cleanDescription = cat[`description_${language}`] ? cat[`description_${language}`].replace(/<[^>]+>/g, '') : '';

              return (
                <Link 
                  to={`/category/${cat.id}`}
                  key={cat.id} 
                  className="bento-card group flex flex-col justify-between cursor-pointer hover:border-[var(--color-minesec-gold)]/30 transition-all" 
                  style={{ gridColumn: `span ${window.innerWidth < 768 ? 6 : span}` }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="font-mono text-xs text-[var(--color-minesec-gold)] tracking-widest">{cat.code}</span>
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--color-minesec-gold)] group-hover:border-[var(--color-minesec-gold)] transition-colors">
                        <div className="w-3 h-3 border border-white/40 rotate-45 group-hover:border-black"></div>
                      </div>
                    </div>
                    
                    <h4 className="text-2xl font-bold mb-3 pr-8">{cat[`name_${language}`]}</h4>
                    {cat.prize_amount_fcfa && (
                      <div className="mb-3 text-[var(--color-minesec-gold)] font-mono text-xs font-bold uppercase">
                        {t('categories.financialPrize')}: {new Intl.NumberFormat('fr-FR').format(cat.prize_amount_fcfa)} FCFA
                      </div>
                    )}
                    <p className="text-[var(--color-minesec-text-muted)] text-sm leading-relaxed mb-8 line-clamp-3">
                      {cleanDescription}
                    </p>

                    {cat.sponsors && cat.sponsors.length > 0 && (
                      <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase text-[var(--color-minesec-text-muted)] font-mono tracking-widest">{t('categories.backedBy')}</span>
                        {cat.sponsors.map(s => (
                          <span key={s.id} className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded">{s.name}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <StatusPill status="open" />
                    <div className="text-xs font-bold text-[var(--color-minesec-gold)] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      {t('categories.viewDetails')} &rarr;
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
