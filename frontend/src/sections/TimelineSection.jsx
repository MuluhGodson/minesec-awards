import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const TimelineSection = () => {
  const { t, language } = useLanguage();
  const [timelineSteps, setTimelineSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlagshipTimeline = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        const data = await response.json();
        if (data.status === 'success') {
          const flagship = data.data.find(c => c.is_flagship);
          if (flagship && flagship.timeline) {
            setTimelineSteps(flagship.timeline);
          }
        }
      } catch (error) {
        console.error("Failed to fetch flagship category timeline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlagshipTimeline();
  }, []);

  // Format date helper
  const formatDateRange = (start, end) => {
    if (!start && !end) return 'TBD';
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const s = start ? new Date(start).toLocaleDateString('en-US', opts) : '?';
    const e = end ? new Date(end).toLocaleDateString('en-US', opts) : '?';
    if (s === e) return s;
    if (!start || !end) return s !== '?' ? s : e;
    return `${s} - ${e}`;
  };

  if (loading) return null;
  if (timelineSteps.length === 0) return null;

  return (
    <section id="timeline" className="py-24 px-6 relative z-10 bg-[#020b08] border-y border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gradient-to-r from-[var(--color-minesec-gold)] to-transparent w-12"></div>
              <h2 className="font-mono text-sm tracking-widest text-[var(--color-minesec-gold)] uppercase">{t('timeline.titleSub')}</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-sans font-bold">
              {t('timeline.titleStart')} <span className="font-serif italic font-normal text-gold-gradient">{t('timeline.titleHighlight')}</span>
            </h3>
          </div>
        </div>

        {/* Removed Category Tabs - Now displaying Flagship Only */}

        {/* Timeline */}
        <div className="relative pl-4 md:pl-8">
          {/* Connecting Line */}
          <div className="absolute top-0 bottom-0 left-[27px] md:left-[43px] w-px bg-white/10">
            <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-[var(--color-minesec-gold)] to-[var(--color-minesec-gold-dark)] transition-all duration-1000" style={{ height: '60%' }}></div>
          </div>

          <div className="space-y-12">
            {timelineSteps.map((step, i) => (
              <div key={i} className={`relative flex flex-col md:flex-row gap-6 md:gap-12 group ${step.status === 'upcoming' ? 'opacity-50' : ''}`}>
                
                {/* Node */}
                <div className="absolute left-[-5px] md:left-[11px] top-1 w-6 h-6 rounded-full bg-[#020b08] flex items-center justify-center z-10">
                  {step.status === 'completed' && (
                    <div className="w-3 h-3 rounded-full bg-[var(--color-minesec-gold)] shadow-[0_0_10px_rgba(207,168,94,0.5)]"></div>
                  )}
                  {step.status === 'active' && (
                    <div className="w-4 h-4 rounded-full bg-[var(--color-minesec-gold)] shadow-[0_0_15px_rgba(207,168,94,0.8)] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#020b08] animate-ping"></div>
                      <div className="absolute w-2 h-2 rounded-full bg-[#020b08]"></div>
                    </div>
                  )}
                  {step.status === 'upcoming' && (
                    <div className="w-3 h-3 rounded-full border border-white/30"></div>
                  )}
                  {/* Default fallback if status is skipped or unknown */}
                  {step.status !== 'completed' && step.status !== 'active' && step.status !== 'upcoming' && (
                    <div className="w-3 h-3 rounded-full border border-white/30 bg-white/10"></div>
                  )}
                </div>

                {/* Left Side: Dates & Status (Desktop) */}
                <div className="hidden md:flex flex-col items-end w-32 shrink-0 pt-1">
                  <span className="font-mono text-xs text-[var(--color-minesec-text-muted)] text-right">{formatDateRange(step.starts_at, step.ends_at)}</span>
                  <span className={`mt-2 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                    step.status === 'completed' ? 'border-[var(--color-minesec-gold)]/30 text-[var(--color-minesec-gold)] bg-[var(--color-minesec-gold)]/10' :
                    step.status === 'active' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                    'border-white/10 text-white/50'
                  }`}>
                    {step.status}
                  </span>
                </div>

                {/* Right Side: Content */}
                <div className="pl-10 md:pl-0 flex-1">
                  {/* Mobile Dates & Status */}
                  <div className="flex md:hidden items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-[var(--color-minesec-text-muted)]">{formatDateRange(step.starts_at, step.ends_at)}</span>
                    <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                      step.status === 'completed' ? 'border-[var(--color-minesec-gold)]/30 text-[var(--color-minesec-gold)] bg-[var(--color-minesec-gold)]/10' :
                      step.status === 'active' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                      'border-white/10 text-white/50'
                    }`}>
                      {step.status}
                    </span>
                  </div>

                  <div className="relative group">
                    <h4 className="text-xl font-bold mb-2 flex items-center">
                      <span className="font-mono text-[var(--color-minesec-gold)] mr-3 opacity-50">0{step.position}</span>
                      <span className="text-white">{step[`name_${language}`]}</span>
                    </h4>
                    <p className="text-[var(--color-minesec-text-muted)] text-sm leading-relaxed group-hover:text-white transition-colors">
                      {step[`description_${language}`] ? step[`description_${language}`].replace(/<[^>]+>/g, '') : ''}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TimelineSection;
