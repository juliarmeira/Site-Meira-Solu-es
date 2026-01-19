import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { FileText, CheckCircle, AlertTriangle, Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import { FormContainer, FormField, PageHeader } from '../FormComponents';
import { POPS_PADRAO, type POP } from '../../../types/alambique';

const POPsPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [pops, setPops] = useState<POP[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editingPop, setEditingPop] = useState<POP | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        codigo: '',
        titulo: '',
        descricao: '',
        frequencia: '',
        ultima_revisao: '',
        proxima_revisao: '',
    });

    useEffect(() => {
        loadPops();
    }, [user]);

    const loadPops = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('pops')
            .select('*')
            .eq('user_id', user.id)
            .order('codigo', { ascending: true });

        if (!error && data) {
            setPops(data);
        }
        setTableLoading(false);
    };

    const initializeDefaultPops = async () => {
        if (!user) return;
        setLoading(true);

        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const nextYearStr = nextYear.toISOString().split('T')[0];

        const defaultPops = POPS_PADRAO.map(pop => ({
            user_id: user.id,
            codigo: pop.codigo,
            titulo: pop.titulo,
            descricao: pop.descricao,
            frequencia: 'Anual',
            ultima_revisao: today,
            proxima_revisao: nextYearStr,
        }));

        const { error } = await supabase.from('pops').insert(defaultPops);

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao criar POPs padrão.' });
        } else {
            setMessage({ type: 'success', text: 'POPs padrão criados com sucesso!' });
            loadPops();
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        if (editingPop) {
            // Update
            const { error } = await supabase
                .from('pops')
                .update({
                    codigo: form.codigo,
                    titulo: form.titulo,
                    descricao: form.descricao || null,
                    frequencia: form.frequencia || null,
                    ultima_revisao: form.ultima_revisao || null,
                    proxima_revisao: form.proxima_revisao || null,
                })
                .eq('id', editingPop.id);

            if (error) {
                setMessage({ type: 'error', text: 'Erro ao atualizar POP.' });
            } else {
                setMessage({ type: 'success', text: 'POP atualizado com sucesso!' });
                resetForm();
                loadPops();
            }
        } else {
            // Insert
            const { error } = await supabase.from('pops').insert({
                user_id: user.id,
                codigo: form.codigo,
                titulo: form.titulo,
                descricao: form.descricao || null,
                frequencia: form.frequencia || null,
                ultima_revisao: form.ultima_revisao || null,
                proxima_revisao: form.proxima_revisao || null,
            });

            if (error) {
                setMessage({ type: 'error', text: 'Erro ao criar POP.' });
            } else {
                setMessage({ type: 'success', text: 'POP criado com sucesso!' });
                resetForm();
                loadPops();
            }
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleEdit = (pop: POP) => {
        setEditingPop(pop);
        setForm({
            codigo: pop.codigo,
            titulo: pop.titulo,
            descricao: pop.descricao || '',
            frequencia: pop.frequencia || '',
            ultima_revisao: pop.ultima_revisao || '',
            proxima_revisao: pop.proxima_revisao || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este POP?')) return;

        const { error } = await supabase
            .from('pops')
            .delete()
            .eq('id', id);

        if (!error) {
            setPops(pops.filter(p => p.id !== id));
        }
    };

    const resetForm = () => {
        setForm({
            codigo: '',
            titulo: '',
            descricao: '',
            frequencia: '',
            ultima_revisao: '',
            proxima_revisao: '',
        });
        setEditingPop(null);
        setShowForm(false);
    };

    const getPopStatus = (pop: POP): 'ok' | 'warning' | 'expired' => {
        if (!pop.proxima_revisao) return 'ok';
        const today = new Date();
        const revisao = new Date(pop.proxima_revisao);
        const diffDays = Math.ceil((revisao.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired';
        if (diffDays <= 30) return 'warning';
        return 'ok';
    };

    const frequenciaOptions = [
        { value: 'Diária', label: 'Diária' },
        { value: 'Semanal', label: 'Semanal' },
        { value: 'Quinzenal', label: 'Quinzenal' },
        { value: 'Mensal', label: 'Mensal' },
        { value: 'Trimestral', label: 'Trimestral' },
        { value: 'Semestral', label: 'Semestral' },
        { value: 'Anual', label: 'Anual' },
    ];

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
                title="Procedimentos Operacionais Padrão"
                subtitle="Gerenciamento dos POPs conforme normativas"
                icon={<FileText size={24} />}
            />

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {pops.length === 0 && !showForm ? (
                <div className="text-center py-16 space-y-6 rounded-2xl border border-dashed border-white/10">
                    <FileText size={48} className="mx-auto text-white/20" />
                    <div className="space-y-2">
                        <p className="text-white/40 text-lg font-bold">Nenhum POP cadastrado</p>
                        <p className="text-white/30 text-sm">Crie os POPs obrigatórios para seu alambique</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={initializeDefaultPops}
                            disabled={loading}
                            className="px-6 py-3 bg-meira-accent text-meira-dark rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-meira-soft-white transition-colors disabled:opacity-50"
                        >
                            Criar 7 POPs Padrão
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-3 border border-white/10 text-white/60 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:border-meira-accent/30 hover:text-meira-accent transition-colors"
                        >
                            Criar Manualmente
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-meira-accent text-meira-dark rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-meira-soft-white transition-colors"
                        >
                            <Plus size={14} />
                            {showForm ? 'Cancelar' : 'Novo POP'}
                        </button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <FormContainer
                            title={editingPop ? 'Editar POP' : 'Novo POP'}
                            subtitle="Preencha os dados do procedimento"
                            onSubmit={handleSubmit}
                            loading={loading}
                            submitLabel={editingPop ? 'Atualizar' : 'Salvar'}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField
                                    label="Código"
                                    type="text"
                                    value={form.codigo}
                                    onChange={(v) => setForm({ ...form, codigo: v })}
                                    placeholder="Ex: POP-01"
                                    required
                                />
                                <FormField
                                    label="Frequência"
                                    type="select"
                                    value={form.frequencia}
                                    onChange={(v) => setForm({ ...form, frequencia: v })}
                                    options={frequenciaOptions}
                                    placeholder="Selecione..."
                                />
                            </div>

                            <FormField
                                label="Título"
                                type="text"
                                value={form.titulo}
                                onChange={(v) => setForm({ ...form, titulo: v })}
                                placeholder="Nome do procedimento"
                                required
                            />

                            <FormField
                                label="Descrição"
                                type="textarea"
                                value={form.descricao}
                                onChange={(v) => setForm({ ...form, descricao: v })}
                                placeholder="Descreva o procedimento..."
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField
                                    label="Última Revisão"
                                    type="date"
                                    value={form.ultima_revisao}
                                    onChange={(v) => setForm({ ...form, ultima_revisao: v })}
                                />
                                <FormField
                                    label="Próxima Revisão"
                                    type="date"
                                    value={form.proxima_revisao}
                                    onChange={(v) => setForm({ ...form, proxima_revisao: v })}
                                />
                            </div>

                            {editingPop && (
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

                    {/* POP List */}
                    <div className="space-y-4">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-1">
                            POPs Cadastrados ({pops.length})
                        </h2>
                        <div className="space-y-3">
                            {pops.map((pop) => {
                                const status = getPopStatus(pop);
                                const statusConfig = {
                                    ok: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Em dia' },
                                    warning: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Vence em breve' },
                                    expired: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Vencido' },
                                };
                                const config = statusConfig[status];
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={pop.id}
                                        className={`p-5 rounded-xl border ${config.bg} transition-all hover:scale-[1.01]`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${config.color}`}>
                                                    <StatusIcon size={18} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] font-bold text-white/40">{pop.codigo}</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-white font-bold">{pop.titulo}</p>
                                                    {pop.descricao && (
                                                        <p className="text-white/40 text-[11px]">{pop.descricao}</p>
                                                    )}
                                                    <div className="flex flex-wrap gap-4 text-[10px] text-white/30 pt-1">
                                                        {pop.frequencia && <span>Frequência: {pop.frequencia}</span>}
                                                        {pop.proxima_revisao && (
                                                            <span>Próxima revisão: {new Date(pop.proxima_revisao).toLocaleDateString('pt-BR')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(pop)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-meira-accent hover:bg-meira-accent/10 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pop.id)}
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
                    </div>
                </>
            )}
        </div>
    );
};

export default POPsPage;
