import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-24 border-t border-white/5 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--color-minesec-gold)] to-transparent opacity-20"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                <img src="/favicon.png" alt="MINESEC Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-sans font-semibold tracking-wide text-lg">MINESEC AWARDS</span>
            </div>
            <p className="text-[var(--color-minesec-text-muted)] text-sm leading-relaxed mb-6">
              {t('footer.descStart')}<span className="font-serif italic text-white">{t('footer.descHighlight1')}</span>{t('footer.descMid')}<span className="font-serif italic text-[var(--color-minesec-gold)]">{t('footer.descHighlight2')}</span>{t('footer.descEnd')}
            </p>
          </div>
          
          <div>
            <h4 className="font-mono text-xs text-[var(--color-minesec-gold)] mb-6 tracking-widest uppercase">{t('footer.platform')}</h4>
            <ul className="space-y-4 text-sm text-[var(--color-minesec-text-muted)]">
              <li><a href="/#categories" className="hover:text-white transition-colors">{t('footer.awardCategories')}</a></li>
              <li><a href="/#timeline" className="hover:text-white transition-colors">{t('footer.evalProcess')}</a></li>
              <li><a href="/#laureates" className="hover:text-white transition-colors">{t('footer.laureatesGallery')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-[var(--color-minesec-gold)] mb-6 tracking-widest uppercase">{t('footer.portals')}</h4>
            <ul className="space-y-4 text-sm text-[var(--color-minesec-text-muted)]">
              <li><a href="https://minesec.gov.cm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">MINESEC</a></li>
              <li><a href="https://play.google.com/store/apps/details?id=net.ndahi.minesec" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NALINOV</a></li>
              <li><a href="https://distance-learning.minesec.gov.cm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">MINESEC Distance Learning Center</a></li>
              <li><a href="https://play.google.com/store/apps/details?id=net.ndahi.minesecdlc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">MINESEC Distance Learning Center App</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-[var(--color-minesec-gold)] mb-6 tracking-widest uppercase">{t('footer.legalHelp')}</h4>
            <ul className="space-y-4 text-sm text-[var(--color-minesec-text-muted)]">
              <li><a href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              <li><a href="/accessibility" className="hover:text-white transition-colors">{t('footer.accessibility')}</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-[var(--color-minesec-text-muted)]">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} {t('footer.rights')}
          </div>
          <div className="font-mono text-[10px]">
            {t('footer.designBy')} <a href="https://ndahi.net" target="_blank" rel="noopener noreferrer" className="text-[var(--color-minesec-gold)] hover:text-white transition-colors">NDAHI COMPANY LIMITED</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
