import React, { useState, useEffect } from 'react';
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
    Users,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';
import { FormContainer, FormField } from '../internal/FormComponents';

const ADMIN_EMAIL = 'juliareismeira@gmail.com';
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxKCAT7elYq-msoEF9vMPss9TOdu7jlW-ze8xUqUAMs_z4NZHI21psoD-GJEMJJv518/exec';

interface RegistroPotabilidade {
    id?: string;
    cliente: string;
    local: string;
    dataColeta: string;
    dataVencimento: string;
    laboratorio: string;
    numeroLaudo: string;
    coliformesTotais: string;
    coliformesTermotolerantes: string;
    eColi: string;
    ph: string;
    turbidez: string;
    cor: string;
    cloroResidual: string;
    fluoreto: string;
    resultado: 'Conforme' | 'Não Conforme' | 'Pendente';
    observacoes: string;
}

const PotabilidadeView: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [registros, setRegistros] = useState<RegistroPotabilidade[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterResultado, setFilterResultado] = useState<'todos' | 'Conforme' | 'Não Conforme' | 'Pendente'>('todos');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'registros'>('dashboard');

    const [form, setForm] = useState<RegistroPotabilidade>({
        cliente: '',
        local: '',
        dataColeta: '',
        dataVencimento: '',
        laboratorio: '',
        numeroLaudo: '',
        coliformesTotais: '',
        coliformesTermotolerantes: '',
        eColi: '',
        ph: '',
        turbidez: '',
        cor: '',
        cloroResidual: '',
        fluoreto: '',
        resultado: 'Pendente',
        observacoes: '',
    });

    useEffect(() => {
        if (user?.email !== ADMIN_EMAIL) {
            navigate('/sistemas');
            return;
        }
        loadData();
    }, [user, navigate]);

    const loadData = async () => {
        setDataLoading(true);
        try {
            // Try different parameter combinations
            const response = await fetch(`${SHEETS_API_URL}?action=read&sheet=Potabilidade`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setRegistros(data);
            } else if (data.data && Array.isArray(data.data)) {
                setRegistros(data.data);
            } else {
                // If API doesn't return expected format, use empty array
                console.log('API Response:', data);
                setRegistros([]);
            }
        } catch (error) {
            console.error('Error loading data from sheets:', error);
            setRegistros([]);
        }
        setDataLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(SHEETS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    sheet: 'Potabilidade',
                    data: form
                }),
                mode: 'no-cors'
            });

            // Since no-cors doesn't return readable response, assume success
            setMessage({ type: 'success', text: 'Registro enviado para a planilha!' });

            // Add to local state
            if (editingIndex !== null) {
                const updated = [...registros];
                updated[editingIndex] = form;
                setRegistros(updated);
            } else {
                setRegistros([...registros, { ...form, id: Date.now().toString() }]);
            }

            resetForm();

            // Reload after a delay
            setTimeout(() => loadData(), 2000);
        } catch (error) {
            console.error('Error saving:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar. Registro adicionado localmente.' });
            setRegistros([...registros, { ...form, id: Date.now().toString() }]);
            resetForm();
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setForm(registros[index]);
        setShowForm(true);
        setActiveTab('registros');
    };

    const handleDelete = async (index: number) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        const updated = registros.filter((_, i) => i !== index);
        setRegistros(updated);

        try {
            await fetch(SHEETS_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete',
                    sheet: 'Potabilidade',
                    index: index
                }),
                mode: 'no-cors'
            });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const resetForm = () => {
        setForm({
            cliente: '',
            local: '',
            dataColeta: '',
            dataVencimento: '',
            laboratorio: '',
            numeroLaudo: '',
            coliformesTotais: '',
            coliformesTermotolerantes: '',
            eColi: '',
            ph: '',
            turbidez: '',
            cor: '',
            cloroResidual: '',
            fluoreto: '',
            resultado: 'Pendente',
            observacoes: '',
        });
        setEditingIndex(null);
        setShowForm(false);
    };

    // Dashboard KPIs
    const kpis = {
        totalRegistros: registros.length,
        conformes: registros.filter(r => r.resultado === 'Conforme').length,
        naoConformes: registros.filter(r => r.resultado === 'Não Conforme').length,
        pendentes: registros.filter(r => r.resultado === 'Pendente').length,
        clientesUnicos: [...new Set(registros.map(r => r.cliente))].length,
        vencidos: registros.filter(r => {
            if (!r.dataVencimento) return false;
            return new Date(r.dataVencimento) < new Date();
        }).length,
        vencemEm30Dias: registros.filter(r => {
            if (!r.dataVencimento) return false;
            const venc = new Date(r.dataVencimento);
            const today = new Date();
            const diff = Math.ceil((venc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diff > 0 && diff <= 30;
        }).length,
    };

    const taxaConformidade = kpis.totalRegistros > 0
        ? ((kpis.conformes / (kpis.conformes + kpis.naoConformes)) * 100).toFixed(1)
        : '0';

    const filteredRegistros = registros.filter(r => {
        const matchesSearch = r.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.local?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesResultado = filterResultado === 'todos' || r.resultado === filterResultado;
        return matchesSearch && matchesResultado;
    });

    const resultadoOptions = [
        { value: 'Pendente', label: 'Pendente' },
        { value: 'Conforme', label: 'Conforme' },
        { value: 'Não Conforme', label: 'Não Conforme' },
    ];

    const getResultadoConfig = (resultado: string) => {
        switch (resultado) {
            case 'Conforme':
                return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
            case 'Não Conforme':
                return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
            default:
                return { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
        }
    };

    const getVencimentoStatus = (dataVencimento?: string) => {
        if (!dataVencimento) return null;
        const today = new Date();
        const vencimento = new Date(dataVencimento);
        const diffDays = Math.ceil((vencimento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: `Vencido há ${Math.abs(diffDays)} dias`, color: 'text-red-400' };
        if (diffDays <= 30) return { label: `Vence em ${diffDays} dias`, color: 'text-orange-400' };
        return { label: 'Em dia', color: 'text-green-400' };
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
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Controle de Laudos</p>
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
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <FileText size={18} className="text-cyan-400" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.totalRegistros}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total de Laudos</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle size={18} className="text-green-400" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.conformes}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Conformes</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                        <XCircle size={18} className="text-red-400" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.naoConformes}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Não Conformes</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <Clock size={18} className="text-orange-400" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-white">{kpis.pendentes}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pendentes</p>
                            </div>
                        </div>

                        {/* Secondary KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Users size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">{kpis.clientesUnicos}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Clientes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <TrendingUp size={18} className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">{taxaConformidade}%</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Taxa Conformidade</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                            <AlertTriangle size={18} className="text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">{kpis.vencidos}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Laudos Vencidos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alerts */}
                        {(kpis.vencidos > 0 || kpis.vencemEm30Dias > 0) && (
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-400" />
                                    Alertas de Vencimento
                                </h3>
                                <div className="space-y-2">
                                    {kpis.vencidos > 0 && (
                                        <p className="text-red-400 text-sm">
                                            ⚠️ {kpis.vencidos} laudo(s) vencido(s) - Ação imediata necessária
                                        </p>
                                    )}
                                    {kpis.vencemEm30Dias > 0 && (
                                        <p className="text-orange-400 text-sm">
                                            ⏰ {kpis.vencemEm30Dias} laudo(s) vencem nos próximos 30 dias
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recent Records */}
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                            <h3 className="text-white font-bold mb-4">Últimos Registros</h3>
                            {registros.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Nenhum registro encontrado</p>
                            ) : (
                                <div className="space-y-2">
                                    {registros.slice(0, 5).map((r, i) => {
                                        const config = getResultadoConfig(r.resultado);
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <config.icon size={16} className={config.color} />
                                                    <div>
                                                        <p className="text-white text-sm font-bold">{r.cliente}</p>
                                                        <p className="text-white/40 text-[10px]">{r.local}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase ${config.color}`}>
                                                    {r.resultado}
                                                </span>
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
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex gap-3 flex-wrap">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar cliente ou local..."
                                        className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/30"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    {(['todos', 'Conforme', 'Não Conforme', 'Pendente'] as const).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setFilterResultado(r)}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterResultado === r
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {r === 'todos' ? 'Todos' : r === 'Não Conforme' ? 'Não Conf.' : r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                            >
                                <Plus size={14} />
                                {showForm ? 'Cancelar' : 'Novo Registro'}
                            </button>
                        </div>

                        {/* Form */}
                        {showForm && (
                            <FormContainer
                                title={editingIndex !== null ? 'Editar Registro' : 'Novo Registro'}
                                subtitle="Preencha os dados da análise de potabilidade"
                                onSubmit={handleSubmit}
                                loading={loading}
                                submitLabel={editingIndex !== null ? 'Atualizar' : 'Cadastrar'}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="Nome do Cliente"
                                        type="text"
                                        value={form.cliente}
                                        onChange={(v) => setForm({ ...form, cliente: v })}
                                        placeholder="Nome do cliente"
                                        required
                                    />
                                    <FormField
                                        label="Local de Coleta"
                                        type="text"
                                        value={form.local}
                                        onChange={(v) => setForm({ ...form, local: v })}
                                        placeholder="Ex: Poço artesiano, Caixa d'água..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <FormField
                                        label="Data da Coleta"
                                        type="date"
                                        value={form.dataColeta}
                                        onChange={(v) => setForm({ ...form, dataColeta: v })}
                                        required
                                    />
                                    <FormField
                                        label="Data de Vencimento"
                                        type="date"
                                        value={form.dataVencimento}
                                        onChange={(v) => setForm({ ...form, dataVencimento: v })}
                                    />
                                    <FormField
                                        label="Resultado"
                                        type="select"
                                        value={form.resultado}
                                        onChange={(v) => setForm({ ...form, resultado: v as any })}
                                        options={resultadoOptions}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="Laboratório"
                                        type="text"
                                        value={form.laboratorio}
                                        onChange={(v) => setForm({ ...form, laboratorio: v })}
                                        placeholder="Nome do laboratório"
                                    />
                                    <FormField
                                        label="Número do Laudo"
                                        type="text"
                                        value={form.numeroLaudo}
                                        onChange={(v) => setForm({ ...form, numeroLaudo: v })}
                                        placeholder="Número do laudo"
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Parâmetros Microbiológicos</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField
                                            label="Coliformes Totais"
                                            type="text"
                                            value={form.coliformesTotais}
                                            onChange={(v) => setForm({ ...form, coliformesTotais: v })}
                                            placeholder="Ausente/Presente"
                                        />
                                        <FormField
                                            label="Coliformes Termotolerantes"
                                            type="text"
                                            value={form.coliformesTermotolerantes}
                                            onChange={(v) => setForm({ ...form, coliformesTermotolerantes: v })}
                                            placeholder="Ausente/Presente"
                                        />
                                        <FormField
                                            label="E. coli"
                                            type="text"
                                            value={form.eColi}
                                            onChange={(v) => setForm({ ...form, eColi: v })}
                                            placeholder="Ausente/Presente"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Parâmetros Físico-Químicos</p>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                                        <FormField
                                            label="pH"
                                            type="text"
                                            value={form.ph}
                                            onChange={(v) => setForm({ ...form, ph: v })}
                                            placeholder="7.0"
                                        />
                                        <FormField
                                            label="Turbidez (uT)"
                                            type="text"
                                            value={form.turbidez}
                                            onChange={(v) => setForm({ ...form, turbidez: v })}
                                            placeholder="0.0"
                                        />
                                        <FormField
                                            label="Cor (uH)"
                                            type="text"
                                            value={form.cor}
                                            onChange={(v) => setForm({ ...form, cor: v })}
                                            placeholder="0.0"
                                        />
                                        <FormField
                                            label="Cloro (mg/L)"
                                            type="text"
                                            value={form.cloroResidual}
                                            onChange={(v) => setForm({ ...form, cloroResidual: v })}
                                            placeholder="0.0"
                                        />
                                        <FormField
                                            label="Fluoreto (mg/L)"
                                            type="text"
                                            value={form.fluoreto}
                                            onChange={(v) => setForm({ ...form, fluoreto: v })}
                                            placeholder="0.0"
                                        />
                                    </div>
                                </div>

                                <FormField
                                    label="Observações"
                                    type="textarea"
                                    value={form.observacoes}
                                    onChange={(v) => setForm({ ...form, observacoes: v })}
                                    placeholder="Anotações sobre a análise..."
                                />

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
                                <div className="grid gap-3">
                                    {filteredRegistros.map((registro, index) => {
                                        const resultadoConfig = getResultadoConfig(registro.resultado);
                                        const ResultadoIcon = resultadoConfig.icon;
                                        const vencimentoStatus = getVencimentoStatus(registro.dataVencimento);

                                        return (
                                            <div
                                                key={index}
                                                className={`p-5 rounded-xl border ${resultadoConfig.bg} transition-all hover:scale-[1.005]`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${resultadoConfig.color}`}>
                                                            <ResultadoIcon size={18} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-white font-bold">{registro.cliente}</p>
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${resultadoConfig.bg} ${resultadoConfig.color}`}>
                                                                    {registro.resultado}
                                                                </span>
                                                                {vencimentoStatus && (
                                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${vencimentoStatus.color}`}>
                                                                        {vencimentoStatus.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-white/50 text-[11px]">{registro.local}</p>
                                                            <div className="flex flex-wrap gap-4 text-[10px] text-white/30 pt-1">
                                                                {registro.dataColeta && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar size={10} /> Coleta: {new Date(registro.dataColeta).toLocaleDateString('pt-BR')}
                                                                    </span>
                                                                )}
                                                                {registro.laboratorio && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Building2 size={10} /> {registro.laboratorio}
                                                                    </span>
                                                                )}
                                                                {registro.numeroLaudo && (
                                                                    <span className="flex items-center gap-1">
                                                                        <FileText size={10} /> {registro.numeroLaudo}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(index)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(index)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
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
            </main>
        </div>
    );
};

export default PotabilidadeView;
