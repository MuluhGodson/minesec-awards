import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';

const REGION_CODES = {
  "1": "CE", "2": "LT", "3": "OU", "4": "NW", "5": "SW",
  "6": "NO", "7": "EN", "8": "AD", "9": "SU", "10": "ES"
};

const LaureatesGallery = () => {
  const { t, language } = useLanguage();
  const [laureates, setLaureates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaureates = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/applications/laureates/recent`);
        const data = await response.json();
        if (data.status === 'success') {
          setLaureates(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recent laureates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLaureates();
  }, []);

  if (loading) return null;
  if (laureates.length === 0) return null;

  return (
    <section id="laureates" className="py-24 px-6 relative z-10 bg-[#020b08] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-gradient-to-r from-[var(--color-minesec-gold)] to-transparent w-12"></div>
          <h2 className="font-mono text-sm tracking-widest text-[var(--color-minesec-gold)] uppercase">{t('laureates.titleSub')}</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <h3 className="text-4xl md:text-5xl font-sans font-bold max-w-2xl">
            {t('laureates.titleStart')} <span className="font-serif italic font-normal text-gold-gradient">{t('laureates.titleHighlight')}</span> {t('laureates.titleEnd')}
          </h3>
          <button className="text-sm font-bold text-[var(--color-minesec-text-muted)] hover:text-white transition-colors uppercase tracking-wider font-mono">
            {t('laureates.viewArchives')} &rarr;
          </button>
        </div>

        {/* 3-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {laureates.map((laureate, i) => {
            const appData = laureate.application_data || {};
            const contact = appData.contact || {};
            const location = appData.location || {};
            const regionCode = REGION_CODES[location.region] || 'CMR';
            const name = contact.full_name || 'Anonymous';
            // We can just highlight the last word of the name if possible
            const nameParts = name.trim().split(' ');
            const accent = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

            return (
              <div key={laureate.laureate_id || i} className="bento-card group flex flex-col justify-between p-8">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-[10px] text-[var(--color-minesec-gold)] tracking-widest border border-[var(--color-minesec-gold)]/30 bg-[var(--color-minesec-gold)]/10 px-2 py-0.5 rounded truncate max-w-[150px]">
                      {laureate.category_code} {laureate[`category_name_${language}`] || laureate.category_name_en}
                    </span>
                    <span className="font-mono text-xs text-[var(--color-minesec-text-muted)] bg-white/5 px-2 py-1 rounded">
                      {laureate.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    {laureate.photo_url ? (
                      <img src={`${API_BASE}/uploads/${laureate.photo_url}`} alt={name} className="w-16 h-16 rounded-full object-cover border border-[var(--color-minesec-gold)]/30" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xl text-[var(--color-minesec-gold)]">
                        {name.charAt(0)}
                      </div>
                    )}
                    <h4 className="text-2xl font-bold">
                      {accent ? (
                        <>
                          {nameParts.slice(0, -1).join(' ')} <span className="font-serif italic font-normal text-white">{accent}</span>
                        </>
                      ) : (
                        <>{name}</>
                      )}
                    </h4>
                  </div>
                </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-xs text-[var(--color-minesec-text-muted)] group-hover:text-white transition-colors">{t('laureates.readProfile')}</span>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white">
                  &rarr;
                </div>
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LaureatesGallery;
