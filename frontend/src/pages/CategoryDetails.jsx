import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';

const StatusPill = ({ status }) => {
  const styles = {
    draft: "border-gray-500/30 bg-gray-500/10 text-gray-400",
    open: "border-green-500/30 bg-green-500/10 text-green-400",
    evaluating: "border-[var(--color-minesec-gold)]/30 bg-[var(--color-minesec-gold)]/10 text-[var(--color-minesec-gold)]",
    closed: "border-white/10 bg-white/5 text-[var(--color-minesec-text-muted)]"
  };
  const labels = { draft: "Draft", open: "Applications Open", evaluating: "In Evaluation", closed: "Closed" };

  const finalStatus = status || 'open';

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${styles[finalStatus]} text-[10px] font-mono tracking-wider uppercase`}>
      {finalStatus === 'open' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>}
      {finalStatus === 'evaluating' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-minesec-gold)]"></div>}
      {finalStatus === 'closed' && <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>}
      {labels[finalStatus]}
    </div>
  );
};

const CategoryDetails = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [laureates, setLaureates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchCategory = async () => {
      try {
        const [catRes, timeRes, prizeRes, sponsorRes, laureatesRes] = await Promise.all([
          fetch(`${API_BASE}/api/categories/${id}`),
          fetch(`${API_BASE}/api/categories/${id}/timeline`),
          fetch(`${API_BASE}/api/categories/${id}/prizes`),
          fetch(`${API_BASE}/api/categories/${id}/sponsors`),
          fetch(`${API_BASE}/api/applications/laureates/category/${id}`)
        ]);
        
        const catData = await catRes.json();
        const timeData = await timeRes.json();
        const prizeData = await prizeRes.json();
        const sponsorData = await sponsorRes.json();
        const laureatesData = await laureatesRes.json();
        
        if (catData.status === 'success') {
          setCategory(catData.data);
        }
        if (timeData.status === 'success') {
          setTimeline(timeData.data);
        }
        if (prizeData.status === 'success') {
          setPrizes(prizeData.data.sort((a, b) => a.position - b.position));
        }
        if (laureatesData.status === 'success') {
          setLaureates(laureatesData.data);
        }
        if (sponsorData.status === 'success') {
          setSponsors(sponsorData.data);
        }
      } catch (error) {
        console.error("Failed to fetch category:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="font-mono text-[var(--color-minesec-text-muted)]">Loading category details...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
        <Link to="/" className="text-[var(--color-minesec-gold)] hover:underline">&larr; Return Home</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 relative z-10 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-mono text-[var(--color-minesec-text-muted)] hover:text-white transition-colors mb-12">
          &larr; {t('categoryDetails.back')}
        </Link>

        {category.cover_image_url && (
          <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-12 relative border border-white/10 group">
            <img 
              src={category.cover_image_url} 
              alt={category[`name_${language}`] || category.name_en} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent"></div>
          </div>
        )}

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[10px] text-[var(--color-minesec-gold)] tracking-widest border border-[var(--color-minesec-gold)]/30 bg-[var(--color-minesec-gold)]/10 px-3 py-1 rounded-full uppercase">
              {category.code}
            </span>
            <span className="font-mono text-[10px] text-[var(--color-minesec-text-muted)] tracking-widest uppercase">
              {category[`recipient_type_name_${language}`]}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-sans font-bold mb-6">
            {category[`name_${language}`]}
          </h1>
          <p className="text-xl text-[var(--color-minesec-text-muted)] max-w-3xl leading-relaxed">
            {category[`description_${language}`] ? category[`description_${language}`].replace(/<[^>]+>/g, '') : ''}
          </p>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar border-b border-white/10 mb-12">
          <div className="flex space-x-8 min-w-max">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'overview' ? 'text-[var(--color-minesec-gold)]' : 'text-[var(--color-minesec-text-muted)] hover:text-white'}`}
            >
              {t('categoryDetails.overview')}
              {activeTab === 'overview' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-minesec-gold)]"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('rules')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'rules' ? 'text-[var(--color-minesec-gold)]' : 'text-[var(--color-minesec-text-muted)] hover:text-white'}`}
            >
              {t('categoryDetails.rules')}
              {activeTab === 'rules' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-minesec-gold)]"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('rubric')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'rubric' ? 'text-[var(--color-minesec-gold)]' : 'text-[var(--color-minesec-text-muted)] hover:text-white'}`}
            >
              {t('categoryDetails.eval')}
              {activeTab === 'rubric' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-minesec-gold)]"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'timeline' ? 'text-[var(--color-minesec-gold)]' : 'text-[var(--color-minesec-text-muted)] hover:text-white'}`}
            >
              {t('categoryDetails.timeline')}
              {activeTab === 'timeline' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-minesec-gold)]"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('prizes')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'prizes' ? 'text-[var(--color-minesec-gold)]' : 'text-[var(--color-minesec-text-muted)] hover:text-white'}`}
            >
              {t('categoryDetails.prizes')}
              {activeTab === 'prizes' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-minesec-gold)]"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('winners')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'winners' ? 'text-[var(--color-minesec-gold)]' : 'text-[var(--color-minesec-text-muted)] hover:text-white'}`}
            >
              {t('categoryDetails.winners') || 'Winners'}
              {activeTab === 'winners' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-minesec-gold)]"></div>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bento-card p-8 md:p-12 border-white/5">
                  <h3 className="text-2xl font-bold mb-6">{t('categoryDetails.overviewText')}</h3>
                  <div 
                    className="prose prose-invert prose-gold max-w-none text-[var(--color-minesec-text-muted)]"
                    dangerouslySetInnerHTML={{ __html: category[`description_${language}`] || category.description_en || category.description_fr || '' }}
                  />
                </div>
                
                {sponsors && sponsors.length > 0 && (
                  <div className="bento-card p-8 md:p-12 border-white/5 bg-gradient-to-br from-[var(--color-minesec-gold)]/5 to-transparent">
                    <h3 className="text-sm font-bold mb-8 text-center text-[var(--color-minesec-text-muted)] uppercase tracking-widest">{t('categoryDetails.supportedBy') || 'Supported By'}</h3>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                      {sponsors.map(sponsor => (
                        <div key={sponsor.id} className="group relative flex flex-col items-center">
                          {sponsor.logo_storage_key ? (
                            <img 
                              src={`${API_BASE}/uploads/${sponsor.logo_storage_key}`} 
                              alt={sponsor.name} 
                              className="h-16 md:h-20 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                            />
                          ) : (
                            <div className="h-16 md:h-20 px-6 bg-white/5 border border-white/10 rounded flex items-center justify-center grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                              <span className="font-bold text-lg">{sponsor.name}</span>
                            </div>
                          )}
                          {sponsor.is_primary && (
                            <span className="absolute -top-3 right-[-10px] bg-[var(--color-minesec-gold)] text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(207,168,94,0.3)]">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'rules' && (
              <div className="bento-card p-8 md:p-12 border-white/5">
                <h3 className="text-2xl font-bold mb-6">{t('categoryDetails.rules')}</h3>
                {(category[`rules_${language}`] || category.rules_en || category.rules_fr) ? (
                  <div 
                    className="prose prose-invert prose-gold max-w-none text-[var(--color-minesec-text-muted)]"
                    dangerouslySetInnerHTML={{ __html: category[`rules_${language}`] || category.rules_en || category.rules_fr }}
                  />
                ) : (
                  <p className="text-[var(--color-minesec-text-muted)] italic">{t('categoryDetails.noRules')}</p>
                )}
              </div>
            )}

            {activeTab === 'rubric' && (
              <div className="bento-card p-8 md:p-12 border-white/5">
                <h3 className="text-2xl font-bold mb-6">{t('categoryDetails.eval')}</h3>
                {(category[`rubric_${language}`] || category.rubric_en || category.rubric_fr) ? (
                  <div 
                    className="prose prose-invert prose-gold max-w-none text-[var(--color-minesec-text-muted)]"
                    dangerouslySetInnerHTML={{ __html: category[`rubric_${language}`] || category.rubric_en || category.rubric_fr }}
                  />
                ) : category.rubric && typeof category.rubric === 'string' ? (
                  <div 
                    className="prose prose-invert prose-gold max-w-none text-[var(--color-minesec-text-muted)]"
                    dangerouslySetInnerHTML={{ __html: category.rubric }}
                  />
                ) : (
                  <div className="text-[var(--color-minesec-text-muted)]">
                    <p className="mb-4">Criteria details are forthcoming.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prizes' && (
              <div className="space-y-8">
                <div className="bento-card p-8 md:p-12 border-white/5 bg-gradient-to-br from-[var(--color-minesec-gold)]/5 to-transparent">
                  <h3 className="text-2xl font-bold mb-8 text-center">{t('categoryDetails.prizes')}</h3>
                  
                  {prizes.length > 0 ? (
                    <>
                      <div className="flex justify-center items-end gap-4 mb-12 min-h-[320px]">
                        {prizes.length >= 2 && (
                          <div className="w-1/3 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-black font-bold text-xl mb-4">2</div>
                            <div className="text-center font-bold mb-2 min-h-[3rem] flex items-center justify-center px-2">{prizes[1][`name_${language}`] || prizes[1].name_en}</div>
                            <div className="w-full bg-gray-800 rounded-t-lg border-t-4 border-gray-400 flex items-center justify-center" style={{ height: '120px' }}>
                              <span className="text-gray-400 font-mono text-sm px-2 text-center">{prizes[1].amount_fcfa ? (prizes[1].amount_fcfa).toLocaleString() + ' FCFA' : ''}</span>
                            </div>
                          </div>
                        )}
                        {prizes.length >= 1 && (
                          <div className="w-1/3 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--color-minesec-gold)] flex items-center justify-center text-black font-bold text-2xl mb-4 shadow-[0_0_20px_rgba(207,168,94,0.5)]">1</div>
                            <div className="text-center font-bold mb-2 min-h-[3rem] flex items-center justify-center text-[var(--color-minesec-gold)] px-2">{prizes[0][`name_${language}`] || prizes[0].name_en}</div>
                            <div className="w-full bg-gray-800 rounded-t-lg border-t-4 border-[var(--color-minesec-gold)] flex items-center justify-center relative overflow-hidden" style={{ height: '160px' }}>
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-minesec-gold)]/20 to-transparent"></div>
                              <span className="text-[var(--color-minesec-gold)] font-mono text-sm relative z-10 px-2 text-center">{prizes[0].amount_fcfa ? (prizes[0].amount_fcfa).toLocaleString() + ' FCFA' : ''}</span>
                            </div>
                          </div>
                        )}
                        {prizes.length >= 3 && (
                          <div className="w-1/3 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
                            <div className="text-center font-bold mb-2 min-h-[3rem] flex items-center justify-center px-2">{prizes[2][`name_${language}`] || prizes[2].name_en}</div>
                            <div className="w-full bg-gray-800 rounded-t-lg border-t-4 border-amber-800 flex items-center justify-center" style={{ height: '100px' }}>
                              <span className="text-amber-600 font-mono text-sm px-2 text-center">{prizes[2].amount_fcfa ? (prizes[2].amount_fcfa).toLocaleString() + ' FCFA' : ''}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-widest text-[var(--color-minesec-text-muted)]">
                              <th className="pb-4 font-normal">Rank</th>
                              <th className="pb-4 font-normal">Award Title</th>
                              <th className="pb-4 font-normal">Details</th>
                              <th className="pb-4 font-normal text-right">Prize Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {prizes.map((prize) => (
                              <tr key={prize.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 align-top">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                    prize.position === 1 ? 'bg-[var(--color-minesec-gold)] text-black' :
                                    prize.position === 2 ? 'bg-gray-300 text-black' :
                                    prize.position === 3 ? 'bg-amber-700 text-white' :
                                    'bg-white/10 text-white'
                                  }`}>
                                    {prize.position}
                                  </span>
                                </td>
                                <td className="py-4 font-bold align-top">{prize[`name_${language}`] || prize.name_en || prize.name_fr}</td>
                                <td className="py-4 text-sm text-[var(--color-minesec-text-muted)] max-w-xs align-top">
                                  {prize[`description_${language}`] || prize.description_en || prize.description_fr || '-'}
                                </td>
                                <td className="py-4 text-right font-mono text-[var(--color-minesec-gold)] align-top">
                                  {prize.amount_fcfa ? (prize.amount_fcfa).toLocaleString() + ' FCFA' : 'TBD'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-[var(--color-minesec-text-muted)] py-12">
                      <p>Prize details are currently being finalized.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'winners' && (
              <div className="space-y-6">
                <div className="bento-card p-8 md:p-12 border-white/5">
                  <h3 className="text-2xl font-bold mb-8 text-center">{t('categoryDetails.winners') || 'Laureates'}</h3>
                  {laureates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {laureates.map((laureate, i) => {
                        const appData = laureate.application_data || {};
                        const contact = appData.contact || {};
                        const location = appData.location || {};
                        const name = contact.full_name || 'Anonymous';
                        
                        return (
                          <div key={i} className="bento-card p-6 border-white/5 relative overflow-hidden flex flex-col items-center text-center">
                            <div className="absolute top-4 right-4 bg-[var(--color-minesec-gold)] text-black text-[10px] font-bold px-2 py-1 rounded font-mono uppercase">
                              {laureate[`prize_name_${language}`] || laureate.prize_name_en || `${laureate.rank}${laureate.rank === 1 ? 'st' : laureate.rank === 2 ? 'nd' : laureate.rank === 3 ? 'rd' : 'th'} Prize`}
                            </div>
                            {laureate.photo_url ? (
                              <img src={`${API_BASE}/uploads/${laureate.photo_url}`} alt={name} className="w-24 h-24 rounded-full object-cover border-2 border-[var(--color-minesec-gold)]/30 mb-4" />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center font-bold text-3xl text-[var(--color-minesec-gold)] mb-4">
                                {name.charAt(0)}
                              </div>
                            )}
                            <h4 className="text-xl font-bold mb-1">{name}</h4>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center border-white/5 flex flex-col items-center py-8">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <span className="text-2xl text-[var(--color-minesec-text-muted)]">🏆</span>
                      </div>
                      <h4 className="text-xl font-bold mb-2">{t('categoryDetails.noWinnersTitle') || 'Winners Not Yet Announced'}</h4>
                      <p className="text-[var(--color-minesec-text-muted)] max-w-md">
                        {t('categoryDetails.noWinnersDesc') || 'The laureates for this category have not been selected yet. Please check back after the evaluation period.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bento-card p-8 md:p-12 border-white/5">
                <h3 className="text-2xl font-bold mb-6">{t('categoryDetails.timeline')}</h3>
                {timeline && timeline.length > 0 ? (
                  <div className="space-y-8 pl-4 border-l border-white/10 relative">
                    {timeline.map((step, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute left-[-29px] top-1.5 w-3 h-3 rounded-full bg-[var(--color-minesec-gold)]"></div>
                        <div className="text-[var(--color-minesec-gold)] font-mono text-xs tracking-widest mb-1">
                          {new Date(step.starts_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <h4 className="text-lg font-bold mb-2">{step[`name_${language}`] || step.name_en || step.name_fr}</h4>
                        <p className="text-[var(--color-minesec-text-muted)] text-sm">
                          {(step[`description_${language}`] || step.description_en || step.description_fr || '').replace(/<[^>]+>/g, '')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-minesec-text-muted)] italic">{t('categoryDetails.noTimeline')}</p>
                )}
              </div>
            )}
          </div>

          <div className="col-span-1 space-y-6">
            <div className="bento-card p-6 border-white/5">
              <h4 className="font-mono text-xs text-[var(--color-minesec-gold)] tracking-widest uppercase mb-4">{t('categoryDetails.aboutPrize')}</h4>
              
              {category.prize_amount_fcfa && (
                <div className="mb-6">
                  <span className="block text-[10px] text-[var(--color-minesec-text-muted)] font-mono uppercase mb-1">{t('categoryDetails.financialPrize')}</span>
                  <span className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(category.prize_amount_fcfa)} FCFA</span>
                </div>
              )}

              <div className="mb-6">
                <span className="block text-[10px] text-[var(--color-minesec-text-muted)] font-mono uppercase mb-1">{t('categoryDetails.recipient')}</span>
                <span className="text-white capitalize">{category[`recipient_type_name_${language}`]}</span>
              </div>

              {category.sponsors && category.sponsors.length > 0 && (
                <div>
                  <span className="block text-[10px] text-[var(--color-minesec-text-muted)] font-mono uppercase mb-2">{t('categories.backedBy')}</span>
                  <div className="flex flex-wrap gap-2">
                    {category.sponsors.map(s => (
                      <span key={s.id} className="text-xs bg-white/10 px-2 py-1 rounded">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(() => {
              const now = new Date();
              const isOpen = category.is_always_open || 
                ((!category.applications_open_at || new Date(category.applications_open_at) <= now) && 
                 (!category.applications_close_at || new Date(category.applications_close_at) >= now));
                 
              if (isOpen) {
                return (
                  <Link to={`/apply/${category.id}`} className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-minesec-gold-dark)] to-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] text-sm font-bold shadow-[0_0_15px_rgba(207,168,94,0.3)] hover:shadow-[0_0_20px_rgba(207,168,94,0.5)] transition-all flex items-center justify-center gap-2">
                    {t('categoryDetails.apply')} &rarr;
                  </Link>
                );
              } else {
                return (
                  <div className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm font-bold flex flex-col items-center justify-center gap-1 cursor-not-allowed">
                    <span>Applications Closed</span>
                    <span className="text-xs font-mono font-normal">
                      {category.applications_open_at && new Date(category.applications_open_at) > now 
                        ? `Opens ${new Date(category.applications_open_at).toLocaleDateString()}` 
                        : 'Deadline Passed'}
                    </span>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
