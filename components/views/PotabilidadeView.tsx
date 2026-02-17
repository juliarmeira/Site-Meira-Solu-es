import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Droplets,
    Plus,
    Search,
    Edit2,
    Trash2,
    ArrowLeft,
    LogOut,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    Building2,
    FileText,
    RefreshCw,
    BarChart3,
    AlertTriangle,
    TrendingUp,
    MapPin,
    Droplet
} from 'lucide-react';
import { FormContainer, FormField } from '../internal/FormComponents';

const ADMIN_EMAIL = 'juliareismeira@gmail.com';
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxKCAT7elYq-msoEF9vMPss9TOdu7jlW-ze8xUqUAMs_z4NZHI21psoD-GJEMJJv518/exec';

interface RegistroPotabilidade {
    id: string;
    data: string;
    distrito: string;
    ponto: string;
    localColeta: string;
    turbidez: number | string;
    cor: number | string;
    cloroResidual: number | string;
    coliformesTotais: string;
    eColi: string;
    ph: string;
    tipoAgua: 'Rede de Distribuição' | 'Água Bruta';
}

interface PontoColeta {
    id: number;
    distrito: string;
    ponto: string;
    localColeta: string;
    coordenadas: string;
    observacoes: string;
}

const PotabilidadeView: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [registros, setRegistros] = useState<RegistroPotabilidade[]>([]);
    const [pontosColeta, setPontosColeta] = useState<PontoColeta[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipoAgua, setFilterTipoAgua] = useState<'todos' | 'Rede de Distribuição' | 'Água Bruta'>('todos');
    const [filterDistrito, setFilterDistrito] = useState<string>('todos');
    const [filterAno, setFilterAno] = useState<string>('todos');
    const [dashboardDistrito, setDashboardDistrito] = useState<string>('todos');
    const [dashboardAno, setDashboardAno] = useState<string>('todos');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'registros'>('dashboard');

    const emptyForm = {
        distrito: '',
        ponto: '',
        localColeta: '',
        tipoAgua: 'Rede de Distribuição' as const,
        data: new Date().toISOString().split('T')[0],
        turbidez: '',
        cor: '',
        cloroResidual: '',
        coliformesTotais: '',
        eColi: '',
        ph: '',
    };

    const [form, setForm] = useState(emptyForm);

    const parseSheetData = (data: any[][], tipoAgua: 'Rede de Distribuição' | 'Água Bruta'): RegistroPotabilidade[] => {
        if (!data || data.length < 2) return [];

        const headers = data[0];
        return data.slice(1).map((row, index) => ({
            id: row[0]?.toString() || index.toString(),
            data: row[1] || '',
            distrito: row[2] || '',
            ponto: row[3] || '',
            localColeta: row[4] || '',
            turbidez: row[5] || '',
            cor: row[6] || '',
            cloroResidual: row[7] || '',
            coliformesTotais: row[8] || '',
            eColi: row[9] || '',
            ph: row[10] || '',
            tipoAgua,
        }));
    };

    const parsePontosData = (data: any[][]): PontoColeta[] => {
        if (!data || data.length < 2) return [];

        return data.slice(1).map((row) => ({
            id: row[0] || 0,
            distrito: row[1] || '',
            ponto: row[3] || '',
            localColeta: row[4] || '',
            coordenadas: row[5] || '',
            observacoes: row[6] || '',
        }));
    };

    const loadData = useCallback(async () => {
        setDataLoading(true);
        try {
            // Load from both sheets
            const [redeResponse, brutaResponse, pontosResponse] = await Promise.all([
                fetch(`${SHEETS_API_URL}?aba=Rede%20de%20Distribui%C3%A7%C3%A3o`),
                fetch(`${SHEETS_API_URL}?aba=%C3%81gua%20Bruta`),
                fetch(`${SHEETS_API_URL}?aba=Pontos`),
            ]);

            const [redeText, brutaText, pontosText] = await Promise.all([
                redeResponse.text(),
                brutaResponse.text(),
                pontosResponse.text(),
            ]);

            let allRegistros: RegistroPotabilidade[] = [];

            try {
                const redeData = JSON.parse(redeText);
                if (Array.isArray(redeData)) {
                    allRegistros = [...allRegistros, ...parseSheetData(redeData, 'Rede de Distribuição')];
                }
            } catch (e) {
                console.log('Failed to parse Rede de Distribuição data');
            }

            try {
                const brutaData = JSON.parse(brutaText);
                if (Array.isArray(brutaData)) {
                    allRegistros = [...allRegistros, ...parseSheetData(brutaData, 'Água Bruta')];
                }
            } catch (e) {
                console.log('Failed to parse Água Bruta data');
            }

            try {
                const pontosData = JSON.parse(pontosText);
                if (Array.isArray(pontosData)) {
                    setPontosColeta(parsePontosData(pontosData));
                }
            } catch (e) {
                console.log('Failed to parse Pontos data');
            }

            // Sort by date (most recent first)
            allRegistros.sort((a, b) => {
                const dateA = parseDate(a.data);
                const dateB = parseDate(b.data);
                return dateB.getTime() - dateA.getTime();
            });

            setRegistros(allRegistros);
            console.log(`Loaded ${allRegistros.length} registros`);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setDataLoading(false);
    }, []);

    const parseDate = (dateStr: string): Date => {
        // Handle Portuguese date format like "28 de outubro de 2025"
        const months: { [key: string]: number } = {
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
            'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
            'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
        };

        const match = dateStr.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+)/);
        if (match) {
            const day = parseInt(match[1]);
            const month = months[match[2].toLowerCase()] || 0;
            const year = parseInt(match[3]);
            return new Date(year, month, day);
        }
        return new Date(dateStr);
    };

    const formatDate = (dateStr: string): string => {
        const date = parseDate(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('pt-BR');
    };

    useEffect(() => {
        if (user?.email !== ADMIN_EMAIL) {
            navigate('/sistemas');
            return;
        }
        loadData();
    }, [user, navigate, loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const sheetName = form.tipoAgua === 'Rede de Distribuição'
                ? 'Rede de Distribuição'
                : 'Água Bruta';

            await fetch(SHEETS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'create',
                    aba: sheetName,
                    data: form
                }),
                mode: 'no-cors'
            });

            setMessage({ type: 'success', text: 'Registro enviado para a planilha!' });
            resetForm();

            // Reload after a delay
            setTimeout(() => loadData(), 2000);
        } catch (error) {
            console.error('Error saving:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar registro.' });
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleEdit = (index: number) => {
        const registro = filteredRegistros[index];
        setEditingIndex(index);
        setForm({
            distrito: registro.distrito,
            ponto: registro.ponto,
            localColeta: registro.localColeta,
            tipoAgua: registro.tipoAgua,
            data: registro.data,
            turbidez: registro.turbidez?.toString() || '',
            cor: registro.cor?.toString() || '',
            cloroResidual: registro.cloroResidual?.toString() || '',
            coliformesTotais: registro.coliformesTotais,
            eColi: registro.eColi,
            ph: registro.ph,
        });
        setShowForm(true);
        setActiveTab('registros');
    };

    const handleDelete = async (index: number) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;
        setMessage({ type: 'error', text: 'Exclusão disponível apenas na planilha.' });
        setTimeout(() => setMessage(null), 5000);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingIndex(null);
        setShowForm(false);
    };

    // Get unique distritos
    const distritos = [...new Set(registros.map(r => r.distrito).filter(Boolean))];

    // Get unique years
    const anos = [...new Set(registros.map(r => {
        const date = parseDate(r.data);
        return isNaN(date.getTime()) ? null : date.getFullYear();
    }).filter(Boolean))] as number[];
    anos.sort((a, b) => b - a); // Most recent first

    // Filtered data for dashboard
    const dashboardData = registros.filter(r => {
        const matchesDistrito = dashboardDistrito === 'todos' || r.distrito === dashboardDistrito;
        const date = parseDate(r.data);
        const year = isNaN(date.getTime()) ? null : date.getFullYear();
        const matchesAno = dashboardAno === 'todos' || year?.toString() === dashboardAno;
        return matchesDistrito && matchesAno;
    });

    // Get unique locais de coleta for selected distrito
    const locaisColeta = [...new Set(
        pontosColeta
            .filter(p => !form.distrito || p.distrito === form.distrito)
            .map(p => p.localColeta)
            .filter(Boolean)
    )];

    // Dashboard KPIs - now using dashboardData for filtered view
    const kpis = {
        totalRegistros: dashboardData.length,
        aguaBruta: dashboardData.filter(r => r.tipoAgua === 'Água Bruta').length,
        aguaRede: dashboardData.filter(r => r.tipoAgua === 'Rede de Distribuição').length,
        distritosUnicos: [...new Set(dashboardData.map(r => r.distrito).filter(Boolean))].length,
        pontosColeta: pontosColeta.length,
        // Turbidez analysis (VMP = 5 uT for treated water)
        turbidezAlta: dashboardData.filter(r => Number(r.turbidez) > 5).length,
        turbidezOk: dashboardData.filter(r => Number(r.turbidez) <= 5 && Number(r.turbidez) > 0).length,
        // Cloro analysis (0.2 - 2.0 mg/L is ideal)
        cloroOk: dashboardData.filter(r => {
            const cloro = Number(r.cloroResidual);
            return cloro >= 0.2 && cloro <= 2.0;
        }).length,
        cloroBaixo: dashboardData.filter(r => {
            const cloro = Number(r.cloroResidual);
            return cloro > 0 && cloro < 0.2;
        }).length,
        cloroAlto: dashboardData.filter(r => Number(r.cloroResidual) > 2.0).length,
    };

    // Calculate averages based on filtered dashboard data
    const avgTurbidez = dashboardData.length > 0
        ? (dashboardData.reduce((acc, r) => acc + (Number(r.turbidez) || 0), 0) / dashboardData.length).toFixed(2)
        : '0';
    const avgCor = dashboardData.length > 0
        ? (dashboardData.reduce((acc, r) => acc + (Number(r.cor) || 0), 0) / dashboardData.length).toFixed(2)
        : '0';
    const avgCloro = dashboardData.length > 0
        ? (dashboardData.reduce((acc, r) => acc + (Number(r.cloroResidual) || 0), 0) / dashboardData.length).toFixed(2)
        : '0';

    const filteredRegistros = registros.filter(r => {
        const matchesSearch =
            r.distrito?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.localColeta?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipoAgua = filterTipoAgua === 'todos' || r.tipoAgua === filterTipoAgua;
        const matchesDistrito = filterDistrito === 'todos' || r.distrito === filterDistrito;
        const date = parseDate(r.data);
        const year = isNaN(date.getTime()) ? null : date.getFullYear();
        const matchesAno = filterAno === 'todos' || year?.toString() === filterAno;
        return matchesSearch && matchesTipoAgua && matchesDistrito && matchesAno;
    });

    const tipoAguaOptions = [
        { value: 'Rede de Distribuição', label: 'Rede de Distribuição' },
        { value: 'Água Bruta', label: 'Água Bruta' },
    ];

    const distritoOptions = distritos.map(d => ({ value: d, label: d }));
    const localColetaOptions = locaisColeta.map(l => ({ value: l, label: l }));

    const getTurbidezStatus = (turbidez: number | string) => {
        const val = Number(turbidez);
        if (isNaN(val) || val === 0) return { color: 'text-white/30', label: '-' };
        if (val <= 5) return { color: 'text-green-400', label: 'OK' };
        if (val <= 10) return { color: 'text-orange-400', label: 'Atenção' };
        return { color: 'text-red-400', label: 'Alto' };
    };

    const getCloroStatus = (cloro: number | string) => {
        const val = Number(cloro);
        if (isNaN(val) || val === 0) return { color: 'text-white/30', label: '-' };
        if (val >= 0.2 && val <= 2.0) return { color: 'text-green-400', label: 'OK' };
        if (val < 0.2) return { color: 'text-orange-400', label: 'Baixo' };
        return { color: 'text-red-400', label: 'Alto' };
    };

    return (
        <div className="min-h-screen bg-meira-dark">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#0d1420]/95 backdrop-blur-md border-b border-white/5 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/sistemas" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <Droplets size={20} className="text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold">Potabilidade da Água</h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                    {registros.length} registros carregados
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            disabled={dataLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={dataLoading ? 'animate-spin' : ''} />
                            Atualizar
                        </button>
                        <button
                            onClick={() => signOut().then(() => navigate('/'))}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:border-red-500/30 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                            <LogOut size={14} />
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 space-y-6">
                {message && (
                    <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === 'dashboard'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                    >
                        <BarChart3 size={16} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('registros')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === 'registros'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                    >
                        <FileText size={16} />
                        Registros
                    </button>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Dashboard Filters */}
                        <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-white/40" />
                                <select
                                    value={dashboardDistrito}
                                    onChange={(e) => setDashboardDistrito(e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/30"
                                >
                                    <option value="todos">Todos os Distritos</option>
                                    {distritos.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-white/40" />
                                <select
                                    value={dashboardAno}
                                    onChange={(e) => setDashboardAno(e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/30"
                                >
                                    <option value="todos">Todos os Anos</option>
                                    {anos.map(a => (
                                        <option key={a} value={a.toString()}>{a}</option>
                                    ))}
                                </select>
                            </div>
                            {(dashboardDistrito !== 'todos' || dashboardAno !== 'todos') && (
                                <button
                                    onClick={() => { setDashboardDistrito('todos'); setDashboardAno('todos'); }}
                                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                                >
                                    Limpar Filtros
                                </button>
                            )}
                            <span className="ml-auto text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                {dashboardData.length} de {registros.length} análises
                            </span>
                        </div>

                        {/* KPI Cards - Main */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
                                    <FileText size={18} className="text-cyan-400" />
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.totalRegistros}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total de Análises</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                                    <Droplet size={18} className="text-blue-400" />
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.aguaBruta}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Água Bruta</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                                    <Droplets size={18} className="text-purple-400" />
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.aguaRede}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Rede de Distribuição</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                                    <MapPin size={18} className="text-green-400" />
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.distritosUnicos}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Distritos</p>
                            </div>
                        </div>

                        {/* Average Values */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Turbidez Média</p>
                                    <span className="text-[10px] text-white/30">VMP: 5 uT</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{avgTurbidez} <span className="text-lg text-white/40">uT</span></p>
                                <div className="mt-3 flex gap-2">
                                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[9px] font-bold">
                                        {kpis.turbidezOk} OK
                                    </span>
                                    <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[9px] font-bold">
                                        {kpis.turbidezAlta} Acima
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cor Média</p>
                                    <span className="text-[10px] text-white/30">VMP: 15 uC</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{avgCor} <span className="text-lg text-white/40">uC</span></p>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cloro Residual Médio</p>
                                    <span className="text-[10px] text-white/30">Ideal: 0.2-2.0 mg/L</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{avgCloro} <span className="text-lg text-white/40">mg/L</span></p>
                                <div className="mt-3 flex gap-2">
                                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[9px] font-bold">
                                        {kpis.cloroOk} OK
                                    </span>
                                    <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-[9px] font-bold">
                                        {kpis.cloroBaixo} Baixo
                                    </span>
                                    <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[9px] font-bold">
                                        {kpis.cloroAlto} Alto
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Alerts */}
                        {(kpis.turbidezAlta > 0 || kpis.cloroBaixo > 0) && (
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-400" />
                                    Alertas de Qualidade
                                </h3>
                                <div className="space-y-2">
                                    {kpis.turbidezAlta > 0 && (
                                        <p className="text-red-400 text-sm">
                                            ⚠️ {kpis.turbidezAlta} análise(s) com turbidez acima do VMP (5 uT)
                                        </p>
                                    )}
                                    {kpis.cloroBaixo > 0 && (
                                        <p className="text-orange-400 text-sm">
                                            ⚠️ {kpis.cloroBaixo} análise(s) com cloro residual abaixo do mínimo (0.2 mg/L)
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Distribution Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <h3 className="text-white font-bold mb-4">Por Tipo de Água</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white/60 text-sm flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                Água Bruta
                                            </span>
                                            <span className="text-white font-bold">{kpis.aguaBruta}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all"
                                                style={{ width: `${kpis.totalRegistros > 0 ? (kpis.aguaBruta / kpis.totalRegistros) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white/60 text-sm flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                                Rede de Distribuição
                                            </span>
                                            <span className="text-white font-bold">{kpis.aguaRede}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full transition-all"
                                                style={{ width: `${kpis.totalRegistros > 0 ? (kpis.aguaRede / kpis.totalRegistros) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <h3 className="text-white font-bold mb-4">Por Distrito</h3>
                                <div className="space-y-2">
                                    {distritos.slice(0, 5).map(distrito => {
                                        const count = registros.filter(r => r.distrito === distrito).length;
                                        return (
                                            <div key={distrito} className="flex items-center justify-between">
                                                <span className="text-white/60 text-sm">{distrito}</span>
                                                <span className="text-white font-bold">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent Records */}
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                            <h3 className="text-white font-bold mb-4">Últimas Análises</h3>
                            {dataLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                </div>
                            ) : registros.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Nenhum registro encontrado</p>
                            ) : (
                                <div className="space-y-2">
                                    {registros.slice(0, 8).map((r, i) => {
                                        const turbidezStatus = getTurbidezStatus(r.turbidez);
                                        const cloroStatus = getCloroStatus(r.cloroResidual);
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.tipoAgua === 'Água Bruta' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                                                        }`}>
                                                        {r.tipoAgua === 'Água Bruta'
                                                            ? <Droplet size={14} className="text-blue-400" />
                                                            : <Droplets size={14} className="text-purple-400" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-bold">{r.distrito}</p>
                                                        <div className="flex items-center gap-2 text-white/40 text-[10px]">
                                                            <span>{r.localColeta}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(r.data)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px]">
                                                    <div className="text-right">
                                                        <span className="text-white/40">Turb:</span>
                                                        <span className={`ml-1 font-bold ${turbidezStatus.color}`}>{r.turbidez || '-'}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-white/40">Cl:</span>
                                                        <span className={`ml-1 font-bold ${cloroStatus.color}`}>{r.cloroResidual || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Registros Tab */}
                {activeTab === 'registros' && (
                    <div className="space-y-6">
                        {/* Action Bar */}
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex gap-3 flex-wrap">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar..."
                                        className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/30 w-40"
                                    />
                                </div>
                                <select
                                    value={filterDistrito}
                                    onChange={(e) => setFilterDistrito(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/30"
                                >
                                    <option value="todos">Todos Distritos</option>
                                    {distritos.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterAno}
                                    onChange={(e) => setFilterAno(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/30"
                                >
                                    <option value="todos">Todos Anos</option>
                                    {anos.map(a => (
                                        <option key={a} value={a.toString()}>{a}</option>
                                    ))}
                                </select>
                                <div className="flex gap-1">
                                    {(['todos', 'Rede de Distribuição', 'Água Bruta'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setFilterTipoAgua(t)}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterTipoAgua === t
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {t === 'todos' ? 'Todos' : t === 'Rede de Distribuição' ? 'Rede' : 'Bruta'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                            >
                                <Plus size={14} />
                                {showForm ? 'Cancelar' : 'Nova Análise'}
                            </button>
                        </div>

                        {/* Form */}
                        {showForm && (
                            <FormContainer
                                title={editingIndex !== null ? 'Editar Análise' : 'Nova Análise'}
                                subtitle="Preencha os dados da análise de potabilidade"
                                onSubmit={handleSubmit}
                                loading={loading}
                                submitLabel={editingIndex !== null ? 'Atualizar' : 'Cadastrar'}
                            >
                                {/* Location Fields */}
                                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Localização da Coleta</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField
                                            label="Distrito"
                                            type="select"
                                            value={form.distrito}
                                            onChange={(v) => setForm({ ...form, distrito: v })}
                                            options={distritoOptions}
                                            placeholder="Selecione..."
                                            required
                                        />
                                        <FormField
                                            label="Local de Coleta"
                                            type="select"
                                            value={form.localColeta}
                                            onChange={(v) => setForm({ ...form, localColeta: v })}
                                            options={localColetaOptions}
                                            placeholder="Selecione..."
                                            required
                                        />
                                        <FormField
                                            label="Tipo de Água"
                                            type="select"
                                            value={form.tipoAgua}
                                            onChange={(v) => setForm({ ...form, tipoAgua: v as any })}
                                            options={tipoAguaOptions}
                                            required
                                        />
                                    </div>
                                </div>

                                <FormField
                                    label="Data da Coleta"
                                    type="date"
                                    value={form.data}
                                    onChange={(v) => setForm({ ...form, data: v })}
                                    required
                                />

                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Parâmetros Físico-Químicos</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                        <FormField
                                            label="Turbidez (uT)"
                                            type="text"
                                            value={form.turbidez}
                                            onChange={(v) => setForm({ ...form, turbidez: v })}
                                            placeholder="0.0"
                                        />
                                        <FormField
                                            label="Cor (uC)"
                                            type="text"
                                            value={form.cor}
                                            onChange={(v) => setForm({ ...form, cor: v })}
                                            placeholder="0.0"
                                        />
                                        <FormField
                                            label="Cloro Residual (mg/L)"
                                            type="text"
                                            value={form.cloroResidual}
                                            onChange={(v) => setForm({ ...form, cloroResidual: v })}
                                            placeholder="0.0"
                                        />
                                        <FormField
                                            label="pH"
                                            type="text"
                                            value={form.ph}
                                            onChange={(v) => setForm({ ...form, ph: v })}
                                            placeholder="7.0"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Parâmetros Microbiológicos</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormField
                                            label="Coliformes Totais (S/N)"
                                            type="text"
                                            value={form.coliformesTotais}
                                            onChange={(v) => setForm({ ...form, coliformesTotais: v })}
                                            placeholder="S ou N"
                                        />
                                        <FormField
                                            label="Escherichia Coli (S/N)"
                                            type="text"
                                            value={form.eColi}
                                            onChange={(v) => setForm({ ...form, eColi: v })}
                                            placeholder="S ou N"
                                        />
                                    </div>
                                </div>

                                {editingIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full py-3 border border-white/10 text-white/40 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-colors"
                                    >
                                        Cancelar Edição
                                    </button>
                                )}
                            </FormContainer>
                        )}

                        {/* Registros List */}
                        <div className="space-y-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-1">
                                {filteredRegistros.length} registro(s) encontrado(s)
                            </p>

                            {dataLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                </div>
                            ) : filteredRegistros.length === 0 ? (
                                <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
                                    <Droplets size={32} className="mx-auto text-white/20 mb-3" />
                                    <p className="text-white/30 text-sm">Nenhum registro encontrado</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
                                                <th className="text-left p-3">Data</th>
                                                <th className="text-left p-3">Distrito</th>
                                                <th className="text-left p-3">Local</th>
                                                <th className="text-left p-3">Tipo</th>
                                                <th className="text-right p-3">Turbidez</th>
                                                <th className="text-right p-3">Cor</th>
                                                <th className="text-right p-3">Cloro</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRegistros.slice(0, 50).map((registro, index) => {
                                                const turbidezStatus = getTurbidezStatus(registro.turbidez);
                                                const cloroStatus = getCloroStatus(registro.cloroResidual);

                                                return (
                                                    <tr
                                                        key={registro.id || index}
                                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <td className="p-3 text-white/60 text-sm">{formatDate(registro.data)}</td>
                                                        <td className="p-3 text-white font-bold text-sm">{registro.distrito}</td>
                                                        <td className="p-3 text-white/60 text-sm">{registro.localColeta}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${registro.tipoAgua === 'Água Bruta'
                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                : 'bg-purple-500/20 text-purple-400'
                                                                }`}>
                                                                {registro.tipoAgua === 'Água Bruta' ? 'Bruta' : 'Rede'}
                                                            </span>
                                                        </td>
                                                        <td className={`p-3 text-right text-sm font-bold ${turbidezStatus.color}`}>
                                                            {registro.turbidez || '-'}
                                                        </td>
                                                        <td className="p-3 text-right text-sm text-white/60">
                                                            {registro.cor || '-'}
                                                        </td>
                                                        <td className={`p-3 text-right text-sm font-bold ${cloroStatus.color}`}>
                                                            {registro.cloroResidual || '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PotabilidadeView;
