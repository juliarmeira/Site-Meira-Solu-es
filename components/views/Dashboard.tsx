import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoIcon } from '../ui/Icons';
import {
    LogOut,
    User,
    FileText,
    Settings,
    LayoutDashboard,
    ChevronRight
} from 'lucide-react';

const DashboardView: React.FC = () => {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    const menuItems = [
        { icon: FileText, label: 'Meus Documentos', description: 'Acesse seus arquivos e materiais', href: '#' },
        { icon: Settings, label: 'Configurações', description: 'Gerencie sua conta', href: '#' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <header className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center">
                            <LayoutDashboard size={20} className="text-meira-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-light uppercase tracking-tight text-white">
                                ÁREA <span className="font-bold text-meira-accent">RESTRITA.</span>
                            </h1>
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">
                                Painel do Colaborador
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-white/50 hover:border-red-500/30 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
                </div>
            </header>

            {/* User Card */}
            <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center">
                        <User size={24} className="text-meira-accent" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Logado como</p>
                        <p className="text-white font-bold text-sm">{user?.email}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-meira-accent/10 border border-meira-accent/20">
                        <p className="text-[8px] font-bold text-meira-accent uppercase tracking-widest">Membro Ativo</p>
                    </div>
                </div>
            </section>

            {/* Menu Items */}
            <section className="space-y-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2">Acesso Rápido</p>
                {menuItems.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.href}
                        className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-meira-accent/20 hover:bg-white/[0.02] transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-meira-accent group-hover:bg-meira-accent/10 transition-all">
                                <item.icon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white group-hover:text-meira-accent transition-colors">
                                    {item.label}
                                </p>
                                <p className="text-[10px] text-white/40">{item.description}</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-white/20 group-hover:text-meira-accent transition-colors" />
                    </a>
                ))}
            </section>

            {/* Em breve */}
            <section className="text-center py-12 space-y-4 border border-dashed border-white/10 rounded-2xl">
                <LogoIcon className="w-12 h-12 mx-auto opacity-20" />
                <div className="space-y-2">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                        Mais funcionalidades em breve
                    </p>
                    <p className="text-white/20 text-[9px]">
                        Esta área está em desenvolvimento
                    </p>
                </div>
            </section>

            {/* Back to site */}
            <div className="text-center">
                <Link
                    to="/"
                    className="text-white/30 text-[10px] font-bold uppercase tracking-widest hover:text-meira-accent transition-colors"
                >
                    ← Voltar ao Site
                </Link>
            </div>
        </div>
    );
};

export default DashboardView;
