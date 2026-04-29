import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const PartnersSection = () => {
  const { t } = useLanguage();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/sponsors');
        const data = await response.json();
        if (data.status === 'success') {
          // Only show public sponsors on the landing page
          setSponsors(data.data.filter(s => s.display_on_public));
        }
      } catch (error) {
        console.error("Failed to fetch sponsors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  const getTierDotColor = (tier) => {
    switch(tier) {
      case 'platinum': return 'bg-white';
      case 'gold': return 'bg-[var(--color-minesec-gold)]';
      case 'silver': return 'bg-gray-300';
      case 'bronze': return 'bg-[#cd7f32]';
      case 'institutional': return 'bg-blue-400';
      case 'patronage': return 'bg-green-500';
      default: return 'bg-white/50';
    }
  };

  return (
    <section id="partners" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gradient-to-r from-[var(--color-minesec-gold)] to-transparent w-12"></div>
              <h2 className="font-mono text-sm tracking-widest text-[var(--color-minesec-gold)] uppercase">{t('partners.titleSub')}</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-sans font-bold">
              {t('partners.titleStart')} <span className="font-serif italic font-normal text-gold-gradient">{t('partners.titleHighlight')}</span>
            </h3>
          </div>
          <button className="text-sm font-bold text-[var(--color-minesec-text-muted)] hover:text-white transition-colors uppercase tracking-wider font-mono">
            Become a partner &rarr;
          </button>
        </div>

        {/* 4-column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-[var(--color-minesec-text-muted)] font-mono">
              Loading sponsors...
            </div>
          ) : sponsors.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[var(--color-minesec-text-muted)] font-mono">
              No public sponsors found.
            </div>
          ) : (
            sponsors.map((sponsor) => (
              <div key={sponsor.id} className="bento-card group flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-2 h-2 rounded-full ${getTierDotColor(sponsor.tier)}`}></div>
                  <span className="font-mono text-[10px] text-[var(--color-minesec-text-muted)] tracking-widest uppercase">
                    {sponsor.tier}
                  </span>
                </div>
                
                {sponsor.logo_storage_key ? (
                  <img 
                    src={`http://localhost:3000/uploads/${sponsor.logo_storage_key}`} 
                    alt={`${sponsor.name} logo`} 
                    className="h-16 object-contain mb-4 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <h4 className="text-xl font-bold font-sans mb-2 group-hover:text-[var(--color-minesec-gold)] transition-colors">
                    {sponsor.name}
                  </h4>
                )}
                
                <p className="text-xs text-[var(--color-minesec-text-muted)] font-mono mt-auto pt-4">
                  {sponsor.sector || 'Partner'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
