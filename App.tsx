import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import HomeView from './components/views/Home';
import ServicesView from './components/views/Services';
import MaterialsView from './components/views/Materials';
import LinkTreeView from './components/views/LinkTree';

const App: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const location = useLocation();

  const isContactPage = location.pathname === '/contato';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${isContactPage ? 'bg-[#fcfcfc]' : 'bg-meira-dark'} text-meira-soft-white selection:bg-meira-accent selection:text-meira-dark font-sans overflow-x-hidden transition-colors duration-500`}>
      {!isContactPage && <Navbar setShowLogin={setShowLogin} />}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <main className={`${isContactPage ? 'pt-10' : 'pt-40'} pb-20 px-6 max-w-6xl mx-auto`}>
        <Routes>
          <Route
            path="/"
            element={
              <HomeView
                expandedService={expandedService}
                setExpandedService={setExpandedService}
              />
            }
          />
          <Route
            path="/servicos"
            element={
              <ServicesView
                expandedService={expandedService}
                setExpandedService={setExpandedService}
              />
            }
          />
          <Route path="/materiais" element={<MaterialsView />} />
          <Route path="/contato" element={<LinkTreeView />} />
        </Routes>
      </main>

      {!isContactPage && <Footer />}
    </div>
  );
};

export default App;
