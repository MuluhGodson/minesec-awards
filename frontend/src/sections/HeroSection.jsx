import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const [edition, setEdition] = useState(null);
  const [stats, setStats] = useState({ categories: 0, laureates: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/stats`);
        const data = await response.json();
        if (data.status === 'success') {
          setEdition(data.data.activeEdition);
          setStats({
            categories: data.data.totalCategories || 0,
            laureates: data.data.totalLaureates || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
      
      {/* Status Pill */}
      {edition && (
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 animate-[fadeIn_1s_ease-out]">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
          <span className="font-mono text-xs tracking-wider text-[var(--color-minesec-text-muted)] uppercase">
            {t('hero.stats.edition')} {edition.roman_numeral} &middot; {edition.year} &middot; <span className="text-white">{edition.status === 'open' ? t('hero.applicationsOpen') : t('hero.platformActive')}</span>
          </span>
        </div>
      )}

      {/* Main Headline */}
      <h1 className="text-5xl md:text-[96px] leading-[1.1] font-sans font-bold text-center max-w-5xl tracking-tight mb-8">
        {t('hero.titleStart')} <br className="hidden md:block"/>
        <span className="font-serif italic font-normal text-gold-gradient mr-2">{t('hero.titleHighlight1')}</span> 
        {t('hero.titleMid')} <span className="font-serif italic font-normal text-gold-gradient">{t('hero.titleHighlight2')}</span>
      </h1>

      {/* Description */}
      <p className="text-[var(--color-minesec-text-muted)] text-lg md:text-xl text-center max-w-2xl mb-12 font-sans leading-relaxed">
        {t('hero.description')}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
        <a href="#categories" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[var(--color-minesec-gold-dark)] to-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] border border-[var(--color-minesec-gold)] text-sm font-bold tracking-wide text-center shadow-[0_0_20px_rgba(207,168,94,0.15)] hover:shadow-[0_0_30px_rgba(207,168,94,0.3)] hover:-translate-y-0.5 transition-all">
          {t('hero.discoverCat')}
        </a>
      </div>

      {/* Statistics Ticker */}
      <div className="w-full max-w-5xl bento-grid gap-4 md:gap-6">
        {[
          { label: t('hero.stats.edition'), value: edition ? edition.roman_numeral : "-" },
          { label: t('hero.stats.categories'), value: stats.categories.toString() },
          { label: t('hero.stats.laureates'), value: stats.laureates.toString() },
          { label: t('hero.stats.prizePool'), value: edition && edition.total_budget_fcfa ? (edition.total_budget_fcfa / 1000000) + 'M' : "-" }
        ].map((stat, i) => (
          <div key={i} className="bento-card col-span-3 md:col-span-1.5 flex flex-col justify-center p-6" style={{ gridColumn: 'span ' + (window.innerWidth < 768 ? '3' : '1.5') }}>
            <span className="font-mono text-xs text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-2">{stat.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold font-sans">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
