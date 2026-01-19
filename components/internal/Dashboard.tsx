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
    ArrowDownRight
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
        green: 'from-meira-accent/20 to-meira-accent/5 border-meira-accent/20 text-meira-accent',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
        orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
        red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    };

    return (
        <div className={`rounded-2xl border bg-gradient-to-br p-6 ${colors[color]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {subtitle && <p className="text-[11px] text-white/40">{subtitle}</p>}
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
        warning: 'border-orange-500/30 bg-orange-500/5',
        danger: 'border-red-500/30 bg-red-500/5',
        info: 'border-blue-500/30 bg-blue-500/5',
    };
    const iconColors = {
        warning: 'text-orange-400',
        danger: 'text-red-400',
        info: 'text-blue-400',
    };

    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${colors[type]}`}>
            <AlertTriangle size={18} className={iconColors[type]} />
            <div className="flex-1">
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-white/40 text-[11px]">{description}</p>
            </div>
            {date && (
                <span className="text-[10px] text-white/30 font-bold">{date}</span>
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
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-white font-bold text-sm">{title}</p>
            <p className="text-white/40 text-[11px]">{subtitle}</p>
        </div>
        <span className="text-[10px] text-white/30 font-bold">{date}</span>
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
            // Load destilações stats
            const { data: destilacoes } = await supabase
                .from('controle_destilacao')
                .select('*')
                .eq('user_id', user.id)
                .order('data_destilacao', { ascending: false })
                .limit(30);

            // Load fermentações stats
            const { data: fermentacoes } = await supabase
                .from('controle_fermentacao')
                .select('*')
                .eq('user_id', user.id)
                .order('data_hora_inicio', { ascending: false })
                .limit(10);

            // Load POPs for alerts
            const { data: pops } = await supabase
                .from('pops')
                .select('*')
                .eq('user_id', user.id);

            // Calculate stats
            const totalDestilacoes = destilacoes?.length || 0;
            const volumeCoracao = destilacoes?.reduce((acc, d) => acc + (d.volume_coracao_litros || 0), 0) || 0;
            const mediaTemperatura = fermentacoes?.length
                ? fermentacoes.reduce((acc, f) => acc + (f.temperatura_maxima || 0), 0) / fermentacoes.length
                : 0;

            // Check for expired POPs
            const today = new Date();
            const popsVencidos = pops?.filter(p => p.proxima_revisao && new Date(p.proxima_revisao) < today).length || 0;

            setStats({
                totalDestilacoes,
                volumeCoracao: Math.round(volumeCoracao * 10) / 10,
                mediaTemperatura: Math.round(mediaTemperatura * 10) / 10,
                popsVencidos,
            });

            // Build alerts
            const newAlerts: AlertItemProps[] = [];

            if (popsVencidos > 0) {
                newAlerts.push({
                    title: `${popsVencidos} POP(s) vencido(s)`,
                    description: 'Revise os procedimentos operacionais padrão',
                    type: 'danger',
                });
            }

            // Check for POPs close to expiring (within 30 days)
            const popsProximos = pops?.filter(p => {
                if (!p.proxima_revisao) return false;
                const revisao = new Date(p.proxima_revisao);
                const diffDays = Math.ceil((revisao.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 30;
            }).length || 0;

            if (popsProximos > 0) {
                newAlerts.push({
                    title: `${popsProximos} POP(s) próximo(s) do vencimento`,
                    description: 'Revisão necessária nos próximos 30 dias',
                    type: 'warning',
                });
            }

            if (newAlerts.length === 0) {
                newAlerts.push({
                    title: 'Tudo em dia!',
                    description: 'Nenhum alerta de auditoria no momento',
                    type: 'info',
                });
            }

            setAlerts(newAlerts);

            // Build recent activities
            const activities: any[] = [];

            destilacoes?.slice(0, 3).forEach(d => {
                activities.push({
                    icon: <Flame size={18} />,
                    title: `Destilação - ${d.id_alambique}`,
                    subtitle: `${d.volume_coracao_litros}L de coração`,
                    date: new Date(d.data_destilacao).toLocaleDateString('pt-BR'),
                    timestamp: new Date(d.created_at),
                });
            });

            fermentacoes?.slice(0, 3).forEach(f => {
                activities.push({
                    icon: <FlaskConical size={18} />,
                    title: `Fermentação - ${f.id_dorna}`,
                    subtitle: `pH: ${f.ph_inicial} → ${f.ph_final || '...'}`,
                    date: new Date(f.data_hora_inicio).toLocaleDateString('pt-BR'),
                    timestamp: new Date(f.created_at),
                });
            });

            // Sort by timestamp
            activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setRecentActivities(activities.slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-meira-accent/30 border-t-meira-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-light text-white mb-1">
                    Olá, <span className="font-bold text-meira-accent">Produtor</span>
                </h1>
                <p className="text-white/40 text-sm capitalize">{today}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Destilações (30 dias)"
                    value={stats.totalDestilacoes}
                    subtitle="Operações realizadas"
                    icon={<Flame size={20} />}
                    color="green"
                />
                <KPICard
                    title="Volume Coração"
                    value={`${stats.volumeCoracao}L`}
                    subtitle="Total produzido"
                    icon={<Wine size={20} />}
                    color="blue"
                />
                <KPICard
                    title="Temp. Média Fermentação"
                    value={`${stats.mediaTemperatura}°C`}
                    subtitle="Últimas fermentações"
                    icon={<FlaskConical size={20} />}
                    color="orange"
                />
                <KPICard
                    title="POPs Vencidos"
                    value={stats.popsVencidos}
                    subtitle="Requer atenção"
                    icon={<ShieldCheck size={20} />}
                    color={stats.popsVencidos > 0 ? 'red' : 'green'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alerts */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-1">
                        Alertas de Auditoria
                    </h2>
                    <div className="space-y-3">
                        {alerts.map((alert, idx) => (
                            <AlertItem key={idx} {...alert} />
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-1">
                        Atividade Recente
                    </h2>
                    <div className="space-y-3">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, idx) => (
                                <RecentActivity key={idx} {...activity} />
                            ))
                        ) : (
                            <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
                                <Calendar size={32} className="mx-auto text-white/20 mb-3" />
                                <p className="text-white/30 text-sm">Nenhuma atividade registrada</p>
                                <p className="text-white/20 text-[11px]">Comece a registrar suas operações</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternalDashboard;
