import React from 'react';
import HeroSection from '../sections/HeroSection';
import FeaturedAward from '../sections/FeaturedAward';
import CategoriesSection from '../sections/CategoriesSection';
import TimelineSection from '../sections/TimelineSection';
import PartnersSection from '../sections/PartnersSection';
import LaureatesGallery from '../sections/LaureatesGallery';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CtaBanner = () => {
  const { t } = useLanguage();
  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 p-12 md:p-24 text-center">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[#041d14] z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[var(--color-minesec-green-light)] to-[var(--color-minesec-gold)]/20 rounded-full blur-[120px] z-0 opacity-50"></div>
          
          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(207,168,94,0.2)] border border-white/10 overflow-hidden">
              <img src="/favicon.png" alt="MINESEC Logo" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-4xl md:text-5xl font-sans font-bold mb-6">
              {t('cta.titleStart')} <span className="font-serif italic font-normal text-gold-gradient">{t('cta.titleHighlight')}</span>?
            </h2>
            <p className="text-[var(--color-minesec-text-muted)] text-lg mb-10">
              {t('cta.desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link to="/admin/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[var(--color-minesec-gold-dark)] to-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] text-sm font-bold shadow-[0_0_15px_rgba(207,168,94,0.3)] hover:shadow-[0_0_20px_rgba(207,168,94,0.5)] hover:-translate-y-0.5 transition-all inline-block text-center">
                {t('cta.accessPortal')}
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold tracking-wide hover:bg-white/10 transition-all">
                {t('cta.downloadBrochure')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { t } = useLanguage();

  return (
    <>
      <HeroSection />
      <FeaturedAward />
      <CategoriesSection />
      <TimelineSection />
      <PartnersSection />
      <LaureatesGallery />
      <CtaBanner />
    </>
  );
};

export default Home;
