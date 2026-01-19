import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-meira-dark">
                <div className="text-center space-y-4">
                    <Loader2 size={32} className="animate-spin text-meira-accent mx-auto" />
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                        Verificando autenticação...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to home with state to show login modal
        return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
