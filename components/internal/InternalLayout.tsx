import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoIcon } from '../ui/Icons';
import {
    LayoutDashboard,
    Wheat,
    FlaskConical,
    Flame,
    Warehouse,
    Wine,
    FileText,
    ScrollText,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    Scale
} from 'lucide-react';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${isActive
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`
        }
    >
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
        <span className="text-[11px] font-extrabold uppercase tracking-wider flex-1 ml-1">{label}</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-all transform group-hover:translate-x-1" />
    </NavLink>
);

const InternalLayout: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const closeSidebar = () => setSidebarOpen(false);

    const navItems = [
        { to: '/painel', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/painel/materia-prima', icon: <Wheat size={18} />, label: 'Matéria-Prima' },
        { to: '/painel/fermentacao', icon: <FlaskConical size={18} />, label: 'Fermentação' },
        { to: '/painel/destilacao', icon: <Flame size={18} />, label: 'Destilação' },
        { to: '/painel/armazenamento', icon: <Warehouse size={18} />, label: 'Armazenamento' },
        { to: '/painel/envase', icon: <Wine size={18} />, label: 'Envase' },
        { to: '/painel/pops', icon: <FileText size={18} />, label: 'POPs' },
        { to: '/painel/laudos', icon: <ScrollText size={18} />, label: 'Laudos e Licenças' },
        { to: '/painel/regulatorio-mapa', icon: <Scale size={18} />, label: 'Legislação MAPA' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 font-inter">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center text-meira-accent">
                            <LogoIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-900 font-bold text-sm tracking-tight">MEU ALAMBIQUE</p>
                            <p className="text-slate-400 text-[9px] font-extrabold uppercase tracking-widest leading-tight">Painel de Controle</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-4 py-2 text-[9px] font-extrabold text-slate-300 uppercase tracking-widest mb-2">
                        Processo Produtivo
                    </p>
                    {navItems.map((item) => (
                        <NavItem key={item.to} {...item} onClick={closeSidebar} />
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <User size={14} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Usuário</p>
                            <p className="text-slate-900 text-[11px] font-bold truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow"
                    >
                        <LogOut size={14} />
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <LogoIcon className="w-6 h-6 text-meira-accent" />
                            <span className="text-slate-900 font-bold text-sm">MEU ALAMBIQUE</span>
                        </div>
                        <div className="w-10" />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-5 lg:p-12 overflow-y-auto max-w-6xl mx-auto w-full">
                    <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InternalLayout;
