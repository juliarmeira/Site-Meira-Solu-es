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
    User
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
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                ? 'bg-meira-accent/10 text-meira-accent border border-meira-accent/20'
                : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
            }`
        }
    >
        <span className="w-5 h-5">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider flex-1">{label}</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
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
    ];

    return (
        <div className="min-h-screen bg-meira-dark flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0d1420] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center">
                            <LogoIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-tight">MEU ALAMBIQUE</p>
                            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Painel de Controle</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-4 py-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        Produção
                    </p>
                    {navItems.map((item) => (
                        <NavItem key={item.to} {...item} onClick={closeSidebar} />
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02]">
                        <div className="w-8 h-8 rounded-full bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center">
                            <User size={14} className="text-meira-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Logado como</p>
                            <p className="text-white text-[11px] font-bold truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/5 text-white/40 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                        <LogOut size={14} />
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 bg-[#0d1420]/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <LogoIcon className="w-6 h-6" />
                            <span className="text-white font-bold text-sm">MEU ALAMBIQUE</span>
                        </div>
                        <div className="w-10" /> {/* Spacer */}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default InternalLayout;
