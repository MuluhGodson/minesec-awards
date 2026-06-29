import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';

const FeaturedAward = () => {
  const { t, language } = useLanguage();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlagship = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        if (data.status === 'success') {
          const flagship = data.data.find(c => c.is_flagship);
          setCategory(flagship || null);
        }
      } catch (error) {
        console.error("Failed to fetch flagship category:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlagship();
  }, []);

  if (loading || !category) return null;
  return (
    <section id="featured" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-gradient-to-r from-[var(--color-minesec-gold)] to-transparent w-12"></div>
          <h2 className="font-mono text-sm tracking-widest text-[var(--color-minesec-gold)] uppercase">{t('featured.flagshipPrize')}</h2>
        </div>

        {/* Large Bento Card */}
        <div className="bento-card !border-[var(--color-minesec-gold)]/30 !shadow-[0_0_40px_rgba(207,168,94,0.1)] p-0 grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Side: Content */}
          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl md:text-5xl font-sans font-bold mb-6">
                The <span className="font-serif italic font-normal text-gold-gradient">{category[`name_${language}`].split(' ')[0]}</span> {category[`name_${language}`].split(' ').slice(1).join(' ')}
              </h3>
              <p className="text-[var(--color-minesec-text-muted)] leading-relaxed mb-10">
                {category[`description_${language}`] ? category[`description_${language}`].replace(/<[^>]+>/g, '').substring(0, 200) + '...' : t('featured.defaultDesc')}
              </p>

              {/* 2x2 Stat Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="block font-mono text-[10px] text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-1">{t('featured.prizeAmount')}</span>
                  <span className="font-sans font-bold text-lg text-[var(--color-minesec-gold)]">{t('featured.tieredRewards')}</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="block font-mono text-[10px] text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-1">{t('featured.categoryCode')}</span>
                  <span className="font-sans font-bold text-lg">{category.code}</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="block font-mono text-[10px] text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-1">{t('featured.recipient')}</span>
                  <span className="font-sans font-bold text-lg capitalize">{category[`recipient_type_name_${language}`]}</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="block font-mono text-[10px] text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-1">{t('featured.primarySponsor')}</span>
                  <span className="font-sans font-bold text-lg text-[var(--color-minesec-gold)]">
                    {category.sponsors?.find(s => s.is_primary)?.name || t('featured.defaultSponsor')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <Link to={`/category/${category.id}`} className="px-8 py-4 rounded-full border border-[var(--color-minesec-gold)]/30 text-[var(--color-minesec-gold)] text-sm font-bold hover:bg-[var(--color-minesec-gold)]/10 transition-colors flex items-center gap-2">
                {t('featured.viewDetails')}
              </Link>
              <Link to={`/apply/${category.id}`} className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--color-minesec-gold-dark)] to-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] text-sm font-bold shadow-[0_0_15px_rgba(207,168,94,0.3)] hover:shadow-[0_0_20px_rgba(207,168,94,0.5)] transition-all flex items-center gap-2">
                {t('featured.applyNow')}
                <span className="font-serif italic text-lg ml-1">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Medallion Visual */}
          <div className="relative bg-[#020a07] border-l border-white/5 p-8 flex items-center justify-center min-h-[400px] overflow-hidden">
            {/* Corner Labels */}
            <div className="absolute top-6 left-6 font-mono text-[10px] text-[var(--color-minesec-text-muted)] tracking-widest">{category.code}</div>
            <div className="absolute top-6 right-6 font-mono text-[10px] text-[var(--color-minesec-text-muted)] tracking-widest">{category.edition_roman || ''}</div>
            <div className="absolute bottom-6 left-6 font-mono text-[10px] text-[var(--color-minesec-text-muted)] tracking-widest">MINESEC</div>
            <div className="absolute bottom-6 right-6 font-mono text-[10px] text-[var(--color-minesec-text-muted)] tracking-widest">{category.edition_year || ''}</div>

            {/* Medallion */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Concentric rings */}
              <div className="absolute inset-0 rounded-full border border-[var(--color-minesec-gold)]/20 animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border border-[var(--color-minesec-gold)]/40 border-dashed animate-[spin_40s_linear_infinite_reverse]"></div>
              <div className="absolute inset-8 rounded-full border border-[var(--color-minesec-gold)]/10"></div>
              
              {/* Inner glowing circle */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-[var(--color-minesec-gold-dark)]/20 to-transparent shadow-[inset_0_0_20px_rgba(207,168,94,0.2)] flex items-center justify-center backdrop-blur-sm">
                <span className="font-serif italic text-7xl text-gold-gradient drop-shadow-[0_0_15px_rgba(207,168,94,0.5)]">
                  {category.code.charAt(0)}
                </span>
              </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-minesec-gold)]/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturedAward;
