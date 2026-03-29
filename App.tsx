import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import ProtectedRoute from './components/ProtectedRoute';
import HomeView from './components/views/Home';
import ServicesView from './components/views/Services';
import MaterialsView from './components/views/Materials';
import LinkTreeView from './components/views/LinkTree';
import DashboardView from './components/views/Dashboard';
import SystemSelectionView from './components/views/SystemSelection';
import ClientesView from './components/views/ClientesView';
import PotabilidadeView from './components/views/PotabilidadeView';
import CurriculumPage from './components/views/CurriculumPage';

// Internal Area Components
import {
  InternalLayout,
  InternalDashboard,
  MateriaPrimaPage,
  FermentacaoPage,
  DestilacaoPage,
  ArmazenamentoPage,
  EnvasePage,
  POPsPage,
  LaudosLicencasPage,
} from './components/internal';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isContactPage = location.pathname === '/contato';
  const isDashboard = location.pathname === '/dashboard';
  const isInternalArea = location.pathname.startsWith('/painel');
  const isSystemSelection = location.pathname === '/sistemas';
  const isClientes = location.pathname === '/clientes';
  const isPotabilidade = location.pathname === '/potabilidade';
  const isCurriculum = location.pathname === '/curriculo';
  const isProtectedArea = isInternalArea || isSystemSelection || isClientes || isPotabilidade;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Check if redirected from ProtectedRoute
  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLogin(true);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    navigate('/sistemas');
  };

  // Render system selection page
  if (isSystemSelection) {
    return (
      <Routes>
        <Route
          path="/sistemas"
          element={
            <ProtectedRoute>
              <SystemSelectionView />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  // Render curriculum page
  if (isCurriculum) {
    return (
      <Routes>
        <Route path="/curriculo" element={<CurriculumPage />} />
      </Routes>
    );
  }

  // Render clientes page
  if (isClientes) {
    return (
      <Routes>
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <ClientesView />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  // Render potabilidade page
  if (isPotabilidade) {
    return (
      <Routes>
        <Route
          path="/potabilidade"
          element={
            <ProtectedRoute>
              <PotabilidadeView />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  // Render internal area layout separately
  if (isInternalArea) {
    return (
      <Routes>
        <Route
          path="/painel/*"
          element={
            <ProtectedRoute>
              <InternalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InternalDashboard />} />
          <Route path="materia-prima" element={<MateriaPrimaPage />} />
          <Route path="fermentacao" element={<FermentacaoPage />} />
          <Route path="destilacao" element={<DestilacaoPage />} />
          <Route path="armazenamento" element={<ArmazenamentoPage />} />
          <Route path="envase" element={<EnvasePage />} />
          <Route path="pops" element={<POPsPage />} />
          <Route path="laudos" element={<LaudosLicencasPage />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className={`min-h-screen bg-meira-dark text-meira-soft-white selection:bg-meira-accent selection:text-meira-dark font-sans overflow-x-hidden transition-colors duration-500`}>
      {!isContactPage && !isDashboard && <Navbar setShowLogin={setShowLogin} />}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />}

      <main className={`${isContactPage ? 'pt-10' : isDashboard ? 'pt-20' : 'pt-40'} pb-20 px-6 max-w-6xl mx-auto`}>
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isContactPage && !isDashboard && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
