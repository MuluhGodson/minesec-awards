import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const FloatingNav = () => {
  const { language, toggleLanguage, t } = useLanguage();
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <nav className="glass-nav rounded-full px-6 py-3 flex items-center justify-between w-full max-w-6xl pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
            <img src="/favicon.png" alt="MINESEC Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-sans font-semibold tracking-wide text-sm">MINESEC AWARDS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-minesec-text-muted)]">
          <a href="#hero" className="hover:text-[var(--color-minesec-gold)] transition-colors">{t('nav.home')}</a>
          <a href="#categories" className="hover:text-[var(--color-minesec-gold)] transition-colors">{t('nav.categories')}</a>
          <a href="#timeline" className="hover:text-[var(--color-minesec-gold)] transition-colors">{t('nav.timeline')}</a>
          <a href="#partners" className="hover:text-[var(--color-minesec-gold)] transition-colors">{t('nav.partners')}</a>
          <a href="#laureates" className="hover:text-[var(--color-minesec-gold)] transition-colors">{t('nav.laureates')}</a>
          <div className="w-px h-4 bg-white/10 mx-2"></div>
          <button onClick={toggleLanguage} className="text-xs uppercase tracking-widest hover:text-white transition-colors">
            {language === 'en' ? 'FR' : 'EN'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/admin/login" className="text-sm font-medium hover:text-[var(--color-minesec-gold)] transition-colors">{t('nav.signIn')}</Link>
          <button className="px-5 py-2 rounded-full bg-gradient-to-r from-[var(--color-minesec-gold-dark)] to-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] text-sm font-bold shadow-[0_0_15px_rgba(207,168,94,0.3)] hover:shadow-[0_0_20px_rgba(207,168,94,0.5)] transition-all">
            {t('nav.applyNow')}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default FloatingNav;
