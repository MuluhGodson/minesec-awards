import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020b08] px-6">
      <div className="w-full max-w-md bento-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(207,168,94,0.2)] border border-white/10 overflow-hidden">
            <img src="/favicon.png" alt="MINESEC Logo" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="text-2xl font-sans font-bold">Admin Portal</h2>
          <p className="text-[var(--color-minesec-text-muted)] text-sm mt-2">Sign in to manage the platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-mono tracking-wider text-[var(--color-minesec-text-muted)] uppercase mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-minesec-gold)] transition-colors"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-mono tracking-wider text-[var(--color-minesec-text-muted)] uppercase mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-minesec-gold)] transition-colors"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 px-8 py-3 rounded-lg bg-gradient-to-r from-[var(--color-minesec-gold-dark)] to-[var(--color-minesec-gold)] text-[var(--color-minesec-green-dark)] text-sm font-bold shadow-[0_0_15px_rgba(207,168,94,0.2)] hover:shadow-[0_0_20px_rgba(207,168,94,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
