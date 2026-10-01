import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    TrendingUp,
    FlaskConical,
    ShieldCheck,
    AlertTriangle,
    Wheat,
    Flame,
    Wine,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import type {
    ControleDestilacao,
    ControleFermentacao,
    ControleMateriaPrima,
    POP
} from '../../types/alambique';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | null;
    trendValue?: string;
    color?: 'green' | 'blue' | 'orange' | 'red';
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    color = 'green'
}) => {
    const colors = {
        green: 'bg-green-50 border-green-100 text-green-600',
        blue: 'bg-blue-50 border-blue-100 text-blue-600',
        orange: 'bg-orange-50 border-orange-100 text-orange-600',
        red: 'bg-red-50 border-red-100 text-red-600',
    };

    return (
        <div className={`rounded-[2rem] border p-8 transition-all hover:scale-[1.02] hover:shadow-xl shadow-slate-200/50 ${colors[color]}`}>
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[11px] font-black ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 mb-2">{title}</p>
            <p className="text-4xl font-black tracking-tight mb-2">{value}</p>
            {subtitle && <p className="text-[12px] font-bold opacity-40">{subtitle}</p>}
        </div>
    );
};

interface AlertItemProps {
    title: string;
    description: string;
    type: 'warning' | 'danger' | 'info';
    date?: string;
}

const AlertItem: React.FC<AlertItemProps> = ({ title, description, type, date }) => {
    const colors = {
        warning: 'border-amber-200 bg-amber-50/50',
        danger: 'border-red-200 bg-red-50/50',
        info: 'border-blue-200 bg-blue-50/50',
    };
    const iconColors = {
        warning: 'text-amber-500',
        danger: 'text-red-500',
        info: 'text-blue-500',
    };

    return (
        <div className={`flex items-start gap-4 p-5 rounded-3xl border ${colors[type]} animate-in slide-in-from-right-4 duration-300`}>
            <div className={`w-10 h-10 rounded-2xl bg-white border border-inherit flex items-center justify-center ${iconColors[type]} shadow-sm`}>
                <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
                <p className="text-slate-900 font-extrabold text-sm mb-0.5">{title}</p>
                <p className="text-slate-500 text-[12px] font-medium leading-relaxed">{description}</p>
            </div>
            {date && (
                <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-widest">{date}</span>
            )}
        </div>
    );
};

interface RecentActivityProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    date: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ icon, title, subtitle, date }) => (
    <div className="flex items-center gap-5 p-5 rounded-3xl bg-white border border-slate-100 hover:border-meira-accent/20 transition-all hover:shadow-lg shadow-slate-200/20 group">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-meira-accent/10 group-hover:text-meira-accent transition-colors">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-slate-900 font-extrabold text-sm">{title}</p>
            <p className="text-slate-400 text-[12px] font-medium">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-widest">{date}</span>
            <ChevronRight size={14} className="text-slate-200 group-hover:text-meira-accent transition-colors" />
        </div>
    </div>
);

const InternalDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDestilacoes: 0,
        volumeCoracao: 0,
        mediaTemperatura: 0,
        popsVencidos: 0,
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<AlertItemProps[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        if (!user) return;

        try {
            const { data: destilacoes } = await supabase
                .from('controle_destilacao')
                .select('*')
                .eq('user_id', user.id)
                .order('data_destilacao', { ascending: false })
                .limit(30);

            const { data: fermentacoes } = await supabase
                .from('controle_fermentacao')
                .select('*')
                .eq('user_id', user.id)
                .order('data_hora_inicio', { ascending: false })
                .limit(10);

            const { data: pops } = await supabase
                .from('pops')
                .select('*')
                .eq('user_id', user.id);

            const totalDestilacoes = destilacoes?.length || 0;
            const volumeCoracao = destilacoes?.reduce((acc, d) => acc + (d.volume_coracao_litros || 0), 0) || 0;
            const mediaTemperatura = fermentacoes?.length
                ? fermentacoes.reduce((acc, f) => acc + (f.temperatura_maxima || 0), 0) / fermentacoes.length
                : 0;

            const today = new Date();
            const popsVencidos = pops?.filter(p => p.proxima_revisao && new Date(p.proxima_revisao) < today).length || 0;

            setStats({
                totalDestilacoes,
                volumeCoracao: Math.round(volumeCoracao * 10) / 10,
                mediaTemperatura: Math.round(mediaTemperatura * 10) / 10,
                popsVencidos,
            });

            const newAlerts: AlertItemProps[] = [];
            if (popsVencidos > 0) {
                newAlerts.push({
                    title: `${popsVencidos} procedimento(s) vencido(s)`,
                    description: 'A auditoria de BPF requer revisão imediata.',
                    type: 'danger',
                });
            }

            const popsProximos = pops?.filter(p => {
                if (!p.proxima_revisao) return false;
                const revisao = new Date(p.proxima_revisao);
                const diffDays = Math.ceil((revisao.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 30;
            }).length || 0;

            if (popsProximos > 0) {
                newAlerts.push({
                    title: `${popsProximos} revisão(ões) pendente(s)`,
                    description: 'Alguns POPs vencem nos próximos 30 dias.',
                    type: 'warning',
                });
            }

            if (newAlerts.length === 0) {
                newAlerts.push({
                    title: 'Auditoria em Dia',
                    description: 'Sua produção segue todos os padrões de qualidade.',
                    type: 'info',
                });
            }
            setAlerts(newAlerts);

            const activities: any[] = [];
            destilacoes?.slice(0, 3).forEach(d => {
                activities.push({
                    icon: <Flame size={20} />,
                    title: `Destilação Finalizada`,
                    subtitle: `${d.id_alambique} colheu ${d.volume_coracao_litros}L de Cachaça.`,
                    date: new Date(d.data_destilacao).toLocaleDateString('pt-BR'),
                    timestamp: new Date(d.created_at),
                });
            });

            fermentacoes?.slice(0, 3).forEach(f => {
                activities.push({
                    icon: <FlaskConical size={20} />,
                    title: `Início de Ciclo`,
                    subtitle: `Dorna ${f.id_dorna} com pH inicial de ${f.ph_inicial}.`,
                    date: new Date(f.data_hora_inicio).toLocaleDateString('pt-BR'),
                    timestamp: new Date(f.created_at),
                });
            });

            activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setRecentActivities(activities.slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const todayDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-meira-accent rounded-full animate-spin" />
                <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Sincronizando dados...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-6xl pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Dashboard <span className="text-meira-accent">Geral</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} />
                        {todayDate}
                    </p>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-meira-accent/10 flex items-center justify-center text-meira-accent">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Brix Ideal</p>
                        <p className="text-sm font-black text-slate-900 leading-none mt-1">15° Brix</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
                <KPICard
                    title="Alambicadas (30d)"
                    value={stats.totalDestilacoes}
                    subtitle="Ciclos concluídos"
                    icon={<Flame size={24} />}
                    color="orange"
                />
                <KPICard
                    title="Produção Total"
                    value={`${stats.volumeCoracao}L`}
                    subtitle="Cachaça de coração"
                    icon={<Wine size={24} />}
                    trend="up"
                    trendValue="+12%"
                    color="blue"
                />
                <KPICard
                    title="T. Média Fermentação"
                    value={`${stats.mediaTemperatura}°C`}
                    subtitle="Saúde biológica"
                    icon={<FlaskConical size={24} />}
                    color="green"
                />
                <KPICard
                    title="Alertas BPF"
                    value={stats.popsVencidos}
                    subtitle="Higiene e Auditoria"
                    icon={<ShieldCheck size={24} />}
                    color={stats.popsVencidos > 0 ? 'red' : 'green'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Recent Activity */}
                <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                            Atividade em Tempo Real
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, idx) => (
                                <RecentActivity key={idx} {...activity} />
                            ))
                        ) : (
                            <div className="text-center py-20 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white">
                                <Calendar size={48} className="mx-auto text-slate-100 mb-6" />
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Nenhuma atividade registrada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400 px-2">
                        Central de Qualidade
                    </h2>
                    <div className="space-y-4">
                        {alerts.map((alert, idx) => (
                            <AlertItem key={idx} {...alert} />
                        ))}
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
                        <div className="relative z-10 space-y-4">
                            <h4 className="text-xl font-black tracking-tight italic">Excelência no Alambique</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Lembre-se: O padrão de 15° Brix garante uma fermentação equilibrada e cachaça de alta qualidade.
                            </p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-10">
                            <Wheat size={120} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternalDashboard;
