import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import HomeView from './components/views/Home';
import ServicesView from './components/views/Services';
import MaterialsView from './components/views/Materials';
import LinkTreeView from './components/views/LinkTree';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [showLogin, setShowLogin] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className={`min-h-screen ${currentView === 'CONTATO' ? 'bg-[#fcfcfc]' : 'bg-meira-dark'} text-meira-soft-white selection:bg-meira-accent selection:text-meira-dark font-sans overflow-x-hidden transition-colors duration-500`}>
      {currentView !== 'CONTATO' && <Navbar currentView={currentView} setCurrentView={setCurrentView} setShowLogin={setShowLogin} />}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <main className={`${currentView === 'CONTATO' ? 'pt-10' : 'pt-40'} pb-20 px-6 max-w-6xl mx-auto`}>
        {currentView === 'HOME' && (
          <HomeView setCurrentView={setCurrentView} expandedService={expandedService} setExpandedService={setExpandedService} />
        )}
        {currentView === 'SERVICOS' && (
          <ServicesView setCurrentView={setCurrentView} expandedService={expandedService} setExpandedService={setExpandedService} />
        )}
        {currentView === 'MATERIAIS' && (
          <MaterialsView />
        )}
        {currentView === 'CONTATO' && (
          <LinkTreeView setCurrentView={setCurrentView} />
        )}
      </main>

      {currentView !== 'CONTATO' && <Footer setCurrentView={setCurrentView} />}
    </div>
  );
};

export default App;
