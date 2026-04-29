import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const [edition, setEdition] = useState(null);
  const [stats, setStats] = useState({ categories: 0, laureates: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/stats');
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
        <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#0d3827] to-[#041d14] border border-[#22c55e]/30 text-white text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:-translate-y-0.5 transition-all">
          {t('hero.submitApp')}
        </button>
        <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold tracking-wide hover:bg-white/10 transition-all">
          {t('hero.discoverCat')}
        </button>
      </div>

      {/* Statistics Ticker */}
      <div className="w-full max-w-5xl bento-grid gap-4 md:gap-6">
        {[
          { label: t('hero.stats.edition'), value: edition ? edition.roman_numeral : "-", delta: edition ? edition.year.toString() : "-", type: "text" },
          { label: t('hero.stats.categories'), value: stats.categories.toString(), delta: "+2 " + t('hero.stats.thisYear'), type: "up" },
          { label: t('hero.stats.laureates'), value: stats.laureates.toString(), delta: "+28 " + t('hero.stats.lastYear'), type: "up" },
          { label: t('hero.stats.prizePool'), value: edition && edition.total_budget_fcfa ? (edition.total_budget_fcfa / 1000000) + 'M' : "-", delta: "FCFA", type: "text" }
        ].map((stat, i) => (
          <div key={i} className="bento-card col-span-3 md:col-span-1.5 flex flex-col justify-center p-6" style={{ gridColumn: 'span ' + (window.innerWidth < 768 ? '3' : '1.5') }}>
            <span className="font-mono text-xs text-[var(--color-minesec-text-muted)] uppercase tracking-wider mb-2">{stat.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold font-sans">{stat.value}</span>
              <span className={`font-mono text-[10px] ${stat.type === 'up' ? 'text-green-400' : 'text-[var(--color-minesec-gold)]'}`}>
                {stat.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
