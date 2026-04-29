import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// Public Components
import FloatingNav from './components/FloatingNav';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import CategoryDetails from './pages/CategoryDetails';
import ApplicationForm from './pages/ApplicationForm';
import EvaluationPortal from './pages/EvaluationPortal';

// Admin Components
import AdminLogin from './admin/Login';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import AdminEditions from './admin/Editions';
import AdminCategories from './admin/Categories';
import CategoryManager from './admin/CategoryManager';
import AdminSponsors from './admin/Sponsors';
import AdminRecipientTypes from './admin/RecipientTypes';

const PublicLayout = () => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.bento-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        card.classList.add('spotlight');
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen selection:bg-[var(--color-minesec-gold)]/30 selection:text-white">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)' }}></div>
      
      <FloatingNav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="category/:id" element={<CategoryDetails />} />
            <Route path="apply/:categoryId" element={<ApplicationForm />} />
          </Route>
          
          <Route path="/evaluate" element={<EvaluationPortal />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="editions" element={<AdminEditions />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/:id" element={<CategoryManager />} />
              <Route path="sponsors" element={<AdminSponsors />} />
              <Route path="recipient-types" element={<AdminRecipientTypes />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
