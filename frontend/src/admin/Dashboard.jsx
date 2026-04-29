import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/stats');
        const data = await response.json();
        if (data.status === 'success') {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-[var(--color-minesec-text-muted)] p-6 font-mono">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-400 p-6 font-mono">Failed to load dashboard.</div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bento-card p-6">
          <span className="font-mono text-xs text-[var(--color-minesec-text-muted)] tracking-widest uppercase">Active Edition</span>
          <h3 className="text-3xl font-sans font-bold mt-2">{stats.activeEdition.year} <span className="font-serif italic font-normal text-[var(--color-minesec-gold)]">{stats.activeEdition.roman_numeral}</span></h3>
        </div>
        <div className="bento-card p-6">
          <span className="font-mono text-xs text-[var(--color-minesec-text-muted)] tracking-widest uppercase">Total Categories</span>
          <h3 className="text-3xl font-sans font-bold mt-2">{stats.totalCategories}</h3>
        </div>
        <div className="bento-card p-6">
          <span className="font-mono text-xs text-[var(--color-minesec-text-muted)] tracking-widest uppercase">Applications</span>
          <h3 className="text-3xl font-sans font-bold mt-2">{stats.applications.total} <span className="text-sm text-[var(--color-minesec-text-muted)] font-sans font-normal">{stats.applications.pending} Pending</span></h3>
        </div>
      </div>

      <div className="bento-card p-8 min-h-[300px] flex items-center justify-center border border-dashed border-white/10 bg-transparent shadow-none">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="font-serif italic text-2xl text-[var(--color-minesec-gold)]">M</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Welcome to SIGEP Admin</h3>
          <p className="text-[var(--color-minesec-text-muted)] text-sm">Select an option from the sidebar to manage platform data.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
