import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { ScrollText, CheckCircle, AlertTriangle, Clock, Plus, Edit2, Trash2, FileCheck, Award } from 'lucide-react';
import { FormContainer, FormField, PageHeader } from '../FormComponents';
import type { LaudoLicenca } from '../../../types/alambique';

const LaudosLicencasPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [items, setItems] = useState<LaudoLicenca[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editingItem, setEditingItem] = useState<LaudoLicenca | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<'todos' | 'laudo' | 'licenca'>('todos');

    const [form, setForm] = useState({
        tipo: 'laudo' as 'laudo' | 'licenca',
        titulo: '',
        descricao: '',
        numero_documento: '',
        orgao_emissor: '',
        data_realizacao: '',
        data_vencimento: '',
        observacoes: '',
    });

    useEffect(() => {
        loadItems();
    }, [user]);

    const loadItems = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('laudos_licencas')
            .select('*')
            .eq('user_id', user.id)
            .order('data_vencimento', { ascending: true });

        if (!error && data) {
            setItems(data);
        }
        setTableLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        if (editingItem) {
            const { error } = await supabase
                .from('laudos_licencas')
                .update({
                    tipo: form.tipo,
                    titulo: form.titulo,
                    descricao: form.descricao || null,
                    numero_documento: form.numero_documento || null,
                    orgao_emissor: form.orgao_emissor || null,
                    data_realizacao: form.data_realizacao,
                    data_vencimento: form.data_vencimento || null,
                    observacoes: form.observacoes || null,
                })
                .eq('id', editingItem.id);

            if (error) {
                setMessage({ type: 'error', text: 'Erro ao atualizar. Tente novamente.' });
            } else {
                setMessage({ type: 'success', text: 'Atualizado com sucesso!' });
                resetForm();
                loadItems();
            }
        } else {
            const { error } = await supabase.from('laudos_licencas').insert({
                user_id: user.id,
                tipo: form.tipo,
                titulo: form.titulo,
                descricao: form.descricao || null,
                numero_documento: form.numero_documento || null,
                orgao_emissor: form.orgao_emissor || null,
                data_realizacao: form.data_realizacao,
                data_vencimento: form.data_vencimento || null,
                observacoes: form.observacoes || null,
            });

            if (error) {
                setMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
            } else {
                setMessage({ type: 'success', text: 'Salvo com sucesso!' });
                resetForm();
                loadItems();
            }
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleEdit = (item: LaudoLicenca) => {
        setEditingItem(item);
        setForm({
            tipo: item.tipo,
            titulo: item.titulo,
            descricao: item.descricao || '',
            numero_documento: item.numero_documento || '',
            orgao_emissor: item.orgao_emissor || '',
            data_realizacao: item.data_realizacao,
            data_vencimento: item.data_vencimento || '',
            observacoes: item.observacoes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        const { error } = await supabase
            .from('laudos_licencas')
            .delete()
            .eq('id', id);

        if (!error) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const resetForm = () => {
        setForm({
            tipo: 'laudo',
            titulo: '',
            descricao: '',
            numero_documento: '',
            orgao_emissor: '',
            data_realizacao: '',
            data_vencimento: '',
            observacoes: '',
        });
        setEditingItem(null);
        setShowForm(false);
    };

    const getItemStatus = (item: LaudoLicenca): 'ok' | 'warning' | 'expired' => {
        if (!item.data_vencimento) return 'ok';
        const today = new Date();
        const vencimento = new Date(item.data_vencimento);
        const diffDays = Math.ceil((vencimento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired';
        if (diffDays <= 30) return 'warning';
        return 'ok';
    };

    const getDaysUntilExpiry = (dataVencimento: string): number => {
        const today = new Date();
        const vencimento = new Date(dataVencimento);
        return Math.ceil((vencimento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const tipoOptions = [
        { value: 'laudo', label: 'Laudo' },
        { value: 'licenca', label: 'Licença' },
    ];

    const filteredItems = items.filter(item => {
        if (filter === 'todos') return true;
        return item.tipo === filter;
    });

    if (tableLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-meira-accent/30 border-t-meira-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8">
            <PageHeader
                title="Laudos e Licenças"
                subtitle="Controle de documentos com vencimento"
                icon={<ScrollText size={24} />}
            />

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Filter and Action buttons */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                    {(['todos', 'laudo', 'licenca'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-meira-accent text-meira-dark'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {f === 'todos' ? 'Todos' : f === 'laudo' ? 'Laudos' : 'Licenças'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-meira-accent text-meira-dark rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-meira-soft-white transition-colors"
                >
                    <Plus size={14} />
                    {showForm ? 'Cancelar' : 'Novo Registro'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <FormContainer
                    title={editingItem ? 'Editar Registro' : 'Novo Registro'}
                    subtitle="Preencha os dados do laudo ou licença"
                    onSubmit={handleSubmit}
                    loading={loading}
                    submitLabel={editingItem ? 'Atualizar' : 'Salvar'}
                >
                    <FormField
                        label="Tipo"
                        type="select"
                        value={form.tipo}
                        onChange={(v) => setForm({ ...form, tipo: v as 'laudo' | 'licenca' })}
                        options={tipoOptions}
                        required
                    />

                    <FormField
                        label="Título / Nome do Documento"
                        type="text"
                        value={form.titulo}
                        onChange={(v) => setForm({ ...form, titulo: v })}
                        placeholder="Ex: Laudo de Potabilidade da Água, Licença Ambiental..."
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            label="Número do Documento"
                            type="text"
                            value={form.numero_documento}
                            onChange={(v) => setForm({ ...form, numero_documento: v })}
                            placeholder="Ex: 12345/2024"
                        />
                        <FormField
                            label="Órgão Emissor"
                            type="text"
                            value={form.orgao_emissor}
                            onChange={(v) => setForm({ ...form, orgao_emissor: v })}
                            placeholder="Ex: MAPA, IMA, ANVISA..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            label="Data de Realização"
                            type="date"
                            value={form.data_realizacao}
                            onChange={(v) => setForm({ ...form, data_realizacao: v })}
                            required
                        />
                        <FormField
                            label="Data de Vencimento"
                            type="date"
                            value={form.data_vencimento}
                            onChange={(v) => setForm({ ...form, data_vencimento: v })}
                        />
                    </div>

                    <FormField
                        label="Descrição"
                        type="textarea"
                        value={form.descricao}
                        onChange={(v) => setForm({ ...form, descricao: v })}
                        placeholder="Descrição do documento..."
                    />

                    <FormField
                        label="Observações"
                        type="textarea"
                        value={form.observacoes}
                        onChange={(v) => setForm({ ...form, observacoes: v })}
                        placeholder="Anotações adicionais..."
                    />

                    {editingItem && (
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

            {/* Items List */}
            <div className="space-y-4">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-1">
                    Documentos Cadastrados ({filteredItems.length})
                </h2>

                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
                        <ScrollText size={32} className="mx-auto text-white/20 mb-3" />
                        <p className="text-white/30 text-sm">Nenhum documento cadastrado</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            const status = getItemStatus(item);
                            const statusConfig = {
                                ok: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Em dia' },
                                warning: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Vence em breve' },
                                expired: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Vencido' },
                            };
                            const config = statusConfig[status];
                            const StatusIcon = config.icon;
                            const TypeIcon = item.tipo === 'laudo' ? FileCheck : Award;
                            const daysUntil = item.data_vencimento ? getDaysUntilExpiry(item.data_vencimento) : null;

                            return (
                                <div
                                    key={item.id}
                                    className={`p-5 rounded-xl border ${config.bg} transition-all hover:scale-[1.01]`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${config.color}`}>
                                                <TypeIcon size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${item.tipo === 'laudo' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                                        }`}>
                                                        {item.tipo}
                                                    </span>
                                                    {item.data_vencimento && (
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${config.color}`}>
                                                            {status === 'expired'
                                                                ? `Vencido há ${Math.abs(daysUntil!)} dias`
                                                                : status === 'warning'
                                                                    ? `Vence em ${daysUntil} dias`
                                                                    : config.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white font-bold">{item.titulo}</p>
                                                {item.descricao && (
                                                    <p className="text-white/40 text-[11px]">{item.descricao}</p>
                                                )}
                                                <div className="flex flex-wrap gap-4 text-[10px] text-white/30 pt-1">
                                                    {item.numero_documento && <span>Nº: {item.numero_documento}</span>}
                                                    {item.orgao_emissor && <span>Órgão: {item.orgao_emissor}</span>}
                                                    <span>Realizado: {new Date(item.data_realizacao).toLocaleDateString('pt-BR')}</span>
                                                    {item.data_vencimento && (
                                                        <span>Vencimento: {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-meira-accent hover:bg-meira-accent/10 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
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
    );
};

export default LaudosLicencasPage;
