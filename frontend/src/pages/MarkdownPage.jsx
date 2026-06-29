import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import FloatingNav from '../components/FloatingNav';
import Footer from '../components/Footer';

const MarkdownPage = ({ fileUrl, title }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(fileUrl)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => setContent('# Error loading page'));
  }, [fileUrl]);

  return (
    <div className="min-h-screen bg-[#020b08] text-white">
      <FloatingNav />
      <div className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-gradient-to-r from-[var(--color-minesec-gold)] to-transparent w-12"></div>
            <h1 className="font-sans text-3xl font-bold tracking-wider uppercase text-[var(--color-minesec-gold)]">{title}</h1>
          </div>
          <div className="bento-card p-8 md:p-12 prose prose-invert prose-green max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MarkdownPage;
