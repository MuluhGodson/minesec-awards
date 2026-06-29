import React from 'react';
import FloatingNav from '../components/FloatingNav';
import Footer from '../components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#020b08] text-white">
      <FloatingNav />
      <div className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-gradient-to-r from-[var(--color-minesec-gold)] to-transparent w-12"></div>
            <h1 className="font-sans text-3xl font-bold tracking-wider uppercase text-[var(--color-minesec-gold)]">Contact & Support</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Support Card */}
            <div className="bento-card p-8 md:p-12 border-t border-[var(--color-minesec-gold)]/30">
              <h2 className="text-xl font-bold mb-4 font-sans text-white">Technical Support</h2>
              <p className="text-[var(--color-minesec-text-muted)] mb-6">
                For issues related to the platform, account access, or technical errors, please contact our technical team.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <a href="mailto:contact@ndahi.net" className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 transition-colors font-mono text-sm">
                  contact@ndahi.net
                </a>
              </div>
            </div>

            {/* Other Support Card */}
            <div className="bento-card p-8 md:p-12 border-t border-[#22c55e]/30">
              <h2 className="text-xl font-bold mb-4 font-sans text-white">Other Support</h2>
              <p className="text-[var(--color-minesec-text-muted)] mb-6">
                For all other inquiries, please contact the Ministry of Secondary Education directly.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-[var(--color-minesec-gold)] font-mono text-xs uppercase tracking-widest mb-4">Contacts et Informations Clés :</h3>
                
                <div className="text-sm font-sans space-y-3 text-[var(--color-minesec-text-muted)]">
                  <p><strong className="text-white">Adresse :</strong> Yaoundé, Cameroun.</p>
                  <p><strong className="text-white">Téléphone :</strong> +237 222 22 67 16 / +237 222 1940.</p>
                  <p><strong className="text-white">Fax :</strong> +237 222 22 27 11 / +237 222 2711.</p>
                  <p><strong className="text-white">Email :</strong> <a href="mailto:contact@minesec.cm" className="text-[var(--color-minesec-gold)] hover:underline">contact@minesec.cm</a></p>
                  <p><strong className="text-white">Site internet :</strong> <a href="http://www.minesec.gov.cm" target="_blank" rel="noopener noreferrer" className="text-[var(--color-minesec-gold)] hover:underline">www.minesec.gov.cm</a></p>
                  <p><strong className="text-white">Page Facebook :</strong> Ministère des Enseignements Secondaires du Cameroun.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
