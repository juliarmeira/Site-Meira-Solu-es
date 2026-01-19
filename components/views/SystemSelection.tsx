import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoIcon } from '../ui/Icons';
import {
    Beaker,
    Users,
    Droplets,
    ChevronRight,
    LogOut,
    Lock
} from 'lucide-react';

const ADMIN_EMAIL = 'juliareismeira@gmail.com';

interface SystemCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: 'green' | 'blue' | 'cyan';
    locked?: boolean;
}

const SystemCard: React.FC<SystemCardProps> = ({ title, description, icon, href, color, locked }) => {
    const navigate = useNavigate();

    const colors = {
        green: 'from-meira-accent/20 to-meira-accent/5 border-meira-accent/30 hover:border-meira-accent/50',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50',
        cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-500/50',
    };

    const iconColors = {
        green: 'text-meira-accent bg-meira-accent/10',
        blue: 'text-blue-400 bg-blue-500/10',
        cyan: 'text-cyan-400 bg-cyan-500/10',
    };

    if (locked) {
        return (
            <div className={`relative rounded-2xl border bg-gradient-to-br p-6 opacity-50 cursor-not-allowed ${colors[color]}`}>
                <div className="absolute top-4 right-4">
                    <Lock size={16} className="text-white/30" />
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${iconColors[color]}`}>
                    {icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-white/40 text-sm mb-4">{description}</p>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                    Acesso restrito
                </p>
            </div>
        );
    }

    return (
        <button
            onClick={() => navigate(href)}
            className={`text-left rounded-2xl border bg-gradient-to-br p-6 transition-all hover:scale-[1.02] group ${colors[color]}`}
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${iconColors[color]}`}>
                {icon}
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-white/40 text-sm mb-4">{description}</p>
            <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">Acessar</span>
                <ChevronRight size={14} />
            </div>
        </button>
    );
};

const SystemSelectionView: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const isAdmin = user?.email === ADMIN_EMAIL;

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const systems = [
        {
            title: 'Gestão de Clientes',
            description: 'Controle de clientes, contratos e serviços prestados',
            icon: <Users size={28} />,
            href: '/clientes',
            color: 'blue' as const,
            adminOnly: true,
        },
        {
            title: 'Meu Alambique',
            description: 'Gestão completa da produção de cachaça artesanal',
            icon: <Beaker size={28} />,
            href: '/painel',
            color: 'green' as const,
            adminOnly: false,
        },
        {
            title: 'Potabilidade da Água',
            description: 'Controle de laudos e análises de potabilidade',
            icon: <Droplets size={28} />,
            href: '/potabilidade',
            color: 'cyan' as const,
            adminOnly: true,
        },
    ];

    return (
        <div className="min-h-screen bg-meira-dark flex items-center justify-center p-6">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center mx-auto">
                        <LogoIcon className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-light text-white">
                            Bem-vindo, <span className="font-bold text-meira-accent">{user?.email?.split('@')[0]}</span>
                        </h1>
                        <p className="text-white/40 text-sm mt-1">Selecione o sistema que deseja acessar</p>
                    </div>
                </div>

                {/* Systems Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {systems.map((system) => (
                        <SystemCard
                            key={system.href}
                            {...system}
                            locked={system.adminOnly && !isAdmin}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-xl border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:border-white/20 hover:text-white transition-colors"
                    >
                        ← Voltar ao Site
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:border-red-500/30 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemSelectionView;
