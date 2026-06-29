import React from 'react';
import HeroSection from '../sections/HeroSection';
import FeaturedAward from '../sections/FeaturedAward';
import CategoriesSection from '../sections/CategoriesSection';
import TimelineSection from '../sections/TimelineSection';
import PartnersSection from '../sections/PartnersSection';
import LaureatesGallery from '../sections/LaureatesGallery';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const QuoteBanner = () => {
  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 flex flex-col md:flex-row bg-[#020a07]">
          {/* Left Side: Photo */}
          <div className="w-full md:w-2/5 h-64 md:h-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020a07] z-10 hidden md:block"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#020a07] to-transparent z-10 md:hidden"></div>
            <img src="/nalova.jpg" alt="Professor Nalova Lyonga" className="w-full h-full object-cover object-top" />
          </div>
          
          {/* Right Side: Quote Content */}
          <div className="w-full md:w-3/5 p-12 md:p-20 relative flex flex-col justify-center">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--color-minesec-green-light)] to-[var(--color-minesec-gold)]/10 rounded-full blur-[100px] z-0 opacity-40"></div>
            
            <div className="relative z-10">
              <span className="text-[var(--color-minesec-gold)] text-6xl font-serif leading-none absolute -top-8 -left-6 opacity-40">"</span>
              <blockquote className="text-2xl md:text-3xl font-sans font-semibold leading-snug mb-8 relative z-10 text-white/90">
                The intersection of Artificial Intelligence and pedagogy is not a threat to the teaching profession, but its greatest evolution. True excellence in our schools will be defined by educators who embrace these modern tools to inspire and elevate the next generation.
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-[var(--color-minesec-gold)]"></div>
                <div>
                  <h4 className="text-2xl font-sans font-bold text-white mb-1">
                    Pr. Nalova <span className="font-serif italic font-normal text-gold-gradient">Lyonga</span>
                  </h4>
                  <p className="text-[var(--color-minesec-text-muted)] text-sm font-mono tracking-wider uppercase">Minister of Secondary Education</p>
                </div>
              </div>
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
      <QuoteBanner />
    </>
  );
};

export default Home;
