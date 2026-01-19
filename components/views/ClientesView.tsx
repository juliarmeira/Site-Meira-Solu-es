import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoIcon } from '../ui/Icons';
import { supabase } from '../../supabase';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Phone,
    Mail,
    MapPin,
    ArrowLeft,
    LogOut,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { FormContainer, FormField, PageHeader } from '../internal/FormComponents';

const ADMIN_EMAIL = 'juliareismeira@gmail.com';

interface Cliente {
    id: string;
    user_id: string;
    nome: string;
    email?: string;
    telefone?: string;
    cpf_cnpj?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    tipo_servico?: string;
    status: 'ativo' | 'inativo' | 'prospecto';
    valor_contrato?: number;
    data_inicio_contrato?: string;
    data_fim_contrato?: string;
    observacoes?: string;
    created_at: string;
    updated_at: string;
}

const ClientesView: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo' | 'prospecto'>('todos');

    const [form, setForm] = useState({
        nome: '',
        email: '',
        telefone: '',
        cpf_cnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        tipo_servico: '',
        status: 'prospecto' as 'ativo' | 'inativo' | 'prospecto',
        valor_contrato: '',
        data_inicio_contrato: '',
        data_fim_contrato: '',
        observacoes: '',
    });

    useEffect(() => {
        // Check admin access
        if (user?.email !== ADMIN_EMAIL) {
            navigate('/sistemas');
            return;
        }
        loadClientes();
    }, [user, navigate]);

    const loadClientes = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('user_id', user.id)
            .order('nome', { ascending: true });

        if (!error && data) {
            setClientes(data);
        }
        setTableLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        const clienteData = {
            user_id: user.id,
            nome: form.nome,
            email: form.email || null,
            telefone: form.telefone || null,
            cpf_cnpj: form.cpf_cnpj || null,
            endereco: form.endereco || null,
            cidade: form.cidade || null,
            estado: form.estado || null,
            tipo_servico: form.tipo_servico || null,
            status: form.status,
            valor_contrato: form.valor_contrato ? parseFloat(form.valor_contrato) : null,
            data_inicio_contrato: form.data_inicio_contrato || null,
            data_fim_contrato: form.data_fim_contrato || null,
            observacoes: form.observacoes || null,
        };

        if (editingCliente) {
            const { error } = await supabase
                .from('clientes')
                .update(clienteData)
                .eq('id', editingCliente.id);

            if (error) {
                setMessage({ type: 'error', text: 'Erro ao atualizar cliente.' });
            } else {
                setMessage({ type: 'success', text: 'Cliente atualizado!' });
                resetForm();
                loadClientes();
            }
        } else {
            const { error } = await supabase.from('clientes').insert(clienteData);

            if (error) {
                setMessage({ type: 'error', text: 'Erro ao cadastrar cliente.' });
            } else {
                setMessage({ type: 'success', text: 'Cliente cadastrado!' });
                resetForm();
                loadClientes();
            }
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleEdit = (cliente: Cliente) => {
        setEditingCliente(cliente);
        setForm({
            nome: cliente.nome,
            email: cliente.email || '',
            telefone: cliente.telefone || '',
            cpf_cnpj: cliente.cpf_cnpj || '',
            endereco: cliente.endereco || '',
            cidade: cliente.cidade || '',
            estado: cliente.estado || '',
            tipo_servico: cliente.tipo_servico || '',
            status: cliente.status,
            valor_contrato: cliente.valor_contrato?.toString() || '',
            data_inicio_contrato: cliente.data_inicio_contrato || '',
            data_fim_contrato: cliente.data_fim_contrato || '',
            observacoes: cliente.observacoes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

        const { error } = await supabase.from('clientes').delete().eq('id', id);

        if (!error) {
            setClientes(clientes.filter(c => c.id !== id));
        }
    };

    const resetForm = () => {
        setForm({
            nome: '',
            email: '',
            telefone: '',
            cpf_cnpj: '',
            endereco: '',
            cidade: '',
            estado: '',
            tipo_servico: '',
            status: 'prospecto',
            valor_contrato: '',
            data_inicio_contrato: '',
            data_fim_contrato: '',
            observacoes: '',
        });
        setEditingCliente(null);
        setShowForm(false);
    };

    const filteredClientes = clientes.filter(c => {
        const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.telefone?.includes(searchTerm);
        const matchesStatus = filterStatus === 'todos' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: 'prospecto', label: 'Prospecto' },
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
    ];

    const estadoOptions = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
        'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ].map(e => ({ value: e, label: e }));

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ativo':
                return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
            case 'inativo':
                return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
            default:
                return { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
        }
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
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold">Gestão de Clientes</h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Meira Soluções</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut().then(() => navigate('/'))}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:border-red-500/30 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
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

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-3 flex-wrap">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar cliente..."
                                className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500/30"
                            />
                        </div>
                        <div className="flex gap-1">
                            {(['todos', 'ativo', 'inativo', 'prospecto'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === s
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-colors"
                    >
                        <Plus size={14} />
                        {showForm ? 'Cancelar' : 'Novo Cliente'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <FormContainer
                        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                        subtitle="Preencha os dados do cliente"
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingCliente ? 'Atualizar' : 'Cadastrar'}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                label="Nome"
                                type="text"
                                value={form.nome}
                                onChange={(v) => setForm({ ...form, nome: v })}
                                placeholder="Nome completo ou razão social"
                                required
                            />
                            <FormField
                                label="CPF/CNPJ"
                                type="text"
                                value={form.cpf_cnpj}
                                onChange={(v) => setForm({ ...form, cpf_cnpj: v })}
                                placeholder="000.000.000-00"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                label="Email"
                                type="text"
                                value={form.email}
                                onChange={(v) => setForm({ ...form, email: v })}
                                placeholder="email@exemplo.com"
                            />
                            <FormField
                                label="Telefone"
                                type="text"
                                value={form.telefone}
                                onChange={(v) => setForm({ ...form, telefone: v })}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <FormField
                            label="Endereço"
                            type="text"
                            value={form.endereco}
                            onChange={(v) => setForm({ ...form, endereco: v })}
                            placeholder="Rua, número, bairro..."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FormField
                                label="Cidade"
                                type="text"
                                value={form.cidade}
                                onChange={(v) => setForm({ ...form, cidade: v })}
                                placeholder="Cidade"
                            />
                            <FormField
                                label="Estado"
                                type="select"
                                value={form.estado}
                                onChange={(v) => setForm({ ...form, estado: v })}
                                options={estadoOptions}
                                placeholder="UF"
                            />
                            <FormField
                                label="Status"
                                type="select"
                                value={form.status}
                                onChange={(v) => setForm({ ...form, status: v as any })}
                                options={statusOptions}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                label="Tipo de Serviço"
                                type="text"
                                value={form.tipo_servico}
                                onChange={(v) => setForm({ ...form, tipo_servico: v })}
                                placeholder="Ex: Consultoria, Projeto..."
                            />
                            <FormField
                                label="Valor do Contrato"
                                type="number"
                                value={form.valor_contrato}
                                onChange={(v) => setForm({ ...form, valor_contrato: v })}
                                placeholder="0.00"
                                suffix="R$"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                label="Início do Contrato"
                                type="date"
                                value={form.data_inicio_contrato}
                                onChange={(v) => setForm({ ...form, data_inicio_contrato: v })}
                            />
                            <FormField
                                label="Fim do Contrato"
                                type="date"
                                value={form.data_fim_contrato}
                                onChange={(v) => setForm({ ...form, data_fim_contrato: v })}
                            />
                        </div>

                        <FormField
                            label="Observações"
                            type="textarea"
                            value={form.observacoes}
                            onChange={(v) => setForm({ ...form, observacoes: v })}
                            placeholder="Anotações sobre o cliente..."
                        />

                        {editingCliente && (
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

                {/* Clients List */}
                <div className="space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-1">
                        {filteredClientes.length} cliente(s) encontrado(s)
                    </p>

                    {tableLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : filteredClientes.length === 0 ? (
                        <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
                            <Users size={32} className="mx-auto text-white/20 mb-3" />
                            <p className="text-white/30 text-sm">Nenhum cliente encontrado</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredClientes.map((cliente) => {
                                const statusConfig = getStatusConfig(cliente.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={cliente.id}
                                        className={`p-5 rounded-xl border ${statusConfig.bg} transition-all hover:scale-[1.005]`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${statusConfig.color}`}>
                                                    <StatusIcon size={18} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-white font-bold">{cliente.nome}</p>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${statusConfig.bg} ${statusConfig.color}`}>
                                                            {cliente.status}
                                                        </span>
                                                    </div>
                                                    {cliente.tipo_servico && (
                                                        <p className="text-white/50 text-[11px]">{cliente.tipo_servico}</p>
                                                    )}
                                                    <div className="flex flex-wrap gap-4 text-[10px] text-white/30 pt-1">
                                                        {cliente.email && (
                                                            <span className="flex items-center gap-1">
                                                                <Mail size={10} /> {cliente.email}
                                                            </span>
                                                        )}
                                                        {cliente.telefone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone size={10} /> {cliente.telefone}
                                                            </span>
                                                        )}
                                                        {cliente.cidade && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={10} /> {cliente.cidade}/{cliente.estado}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(cliente)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cliente.id)}
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
            </main>
        </div>
    );
};

export default ClientesView;
