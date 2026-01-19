import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Warehouse } from 'lucide-react';
import { FormContainer, FormField, DataTable, PageHeader } from '../FormComponents';
import { TIPOS_MADEIRA, type ControleArmazenamento } from '../../../types/alambique';

const ArmazenamentoPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [records, setRecords] = useState<ControleArmazenamento[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [form, setForm] = useState({
        id_recipiente: '',
        tipo_material: '',
        volume_entrada_litros: '',
        volume_saida_litros: '',
        data_inicio: '',
        data_termino: '',
        observacoes: '',
    });

    useEffect(() => {
        loadRecords();
    }, [user]);

    const loadRecords = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('controle_armazenamento')
            .select('*')
            .eq('user_id', user.id)
            .order('data_inicio', { ascending: false })
            .limit(50);

        if (!error && data) {
            setRecords(data);
        }
        setTableLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.from('controle_armazenamento').insert({
            user_id: user.id,
            id_recipiente: form.id_recipiente,
            tipo_material: form.tipo_material,
            volume_entrada_litros: parseFloat(form.volume_entrada_litros as string),
            volume_saida_litros: form.volume_saida_litros ? parseFloat(form.volume_saida_litros as string) : null,
            data_inicio: form.data_inicio,
            data_termino: form.data_termino || null,
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar registro. Tente novamente.' });
        } else {
            setMessage({ type: 'success', text: 'Registro salvo com sucesso!' });
            setForm({
                id_recipiente: '',
                tipo_material: '',
                volume_entrada_litros: '',
                volume_saida_litros: '',
                data_inicio: '',
                data_termino: '',
                observacoes: '',
            });
            loadRecords();
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        const { error } = await supabase
            .from('controle_armazenamento')
            .delete()
            .eq('id', id);

        if (!error) {
            setRecords(records.filter(r => r.id !== id));
        }
    };

    // Calculate angel's share
    const volumeEntrada = parseFloat(form.volume_entrada_litros as string) || 0;
    const volumeSaida = parseFloat(form.volume_saida_litros as string) || 0;
    const perdaEvaporacao = volumeEntrada > 0 && volumeSaida > 0
        ? ((volumeEntrada - volumeSaida) / volumeEntrada * 100)
        : null;

    // Calculate aging time
    const tempoEnvelhecimento = form.data_inicio && form.data_termino
        ? Math.round((new Date(form.data_termino).getTime() - new Date(form.data_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : null;

    const materialOptions = TIPOS_MADEIRA.map(m => ({ value: m, label: m }));

    const columns = [
        { key: 'data_inicio', label: 'Início', format: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
        { key: 'id_recipiente', label: 'Recipiente' },
        { key: 'tipo_material', label: 'Material' },
        { key: 'volume_entrada_litros', label: 'Entrada (L)', format: (v: number) => `${v}L` },
        { key: 'volume_saida_litros', label: 'Saída (L)', format: (v: number | null) => v ? `${v}L` : '-' },
        { key: 'data_termino', label: 'Término', format: (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR') : 'Em curso' },
    ];

    return (
        <div className="max-w-4xl space-y-8">
            <PageHeader
                title="Controle de Armazenamento"
                subtitle="Gestão de envelhecimento e estocagem"
                icon={<Warehouse size={24} />}
            />

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <FormContainer
                title="Novo Registro"
                subtitle="Preencha os dados do armazenamento"
                onSubmit={handleSubmit}
                loading={loading}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="ID do Recipiente"
                        type="text"
                        value={form.id_recipiente}
                        onChange={(v) => setForm({ ...form, id_recipiente: v })}
                        placeholder="Ex: BRL-001, TNQ-002"
                        required
                    />
                    <FormField
                        label="Tipo de Material"
                        type="select"
                        value={form.tipo_material}
                        onChange={(v) => setForm({ ...form, tipo_material: v })}
                        options={materialOptions}
                        placeholder="Selecione o material"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Volume de Entrada"
                        type="number"
                        value={form.volume_entrada_litros}
                        onChange={(v) => setForm({ ...form, volume_entrada_litros: v })}
                        placeholder="0.00"
                        suffix="L"
                        min={0}
                        step={0.1}
                        required
                    />
                    <FormField
                        label="Volume de Saída"
                        type="number"
                        value={form.volume_saida_litros}
                        onChange={(v) => setForm({ ...form, volume_saida_litros: v })}
                        placeholder="0.00"
                        suffix="L"
                        min={0}
                        step={0.1}
                    />
                </div>

                {perdaEvaporacao !== null && (
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/70">Perda por Evaporação ("Angel's Share")</p>
                        <p className="text-2xl font-bold text-purple-400">{perdaEvaporacao.toFixed(1)}%</p>
                        <p className="text-[11px] text-purple-400/60">{(volumeEntrada - volumeSaida).toFixed(2)}L perdidos</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Data de Início"
                        type="date"
                        value={form.data_inicio}
                        onChange={(v) => setForm({ ...form, data_inicio: v })}
                        required
                    />
                    <FormField
                        label="Data de Término"
                        type="date"
                        value={form.data_termino}
                        onChange={(v) => setForm({ ...form, data_termino: v })}
                    />
                </div>

                {tempoEnvelhecimento !== null && tempoEnvelhecimento >= 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">Tempo de Envelhecimento</p>
                        <p className="text-2xl font-bold text-amber-400">
                            {tempoEnvelhecimento >= 12
                                ? `${Math.floor(tempoEnvelhecimento / 12)} ano(s) e ${tempoEnvelhecimento % 12} mês(es)`
                                : `${tempoEnvelhecimento} mês(es)`}
                        </p>
                    </div>
                )}

                <FormField
                    label="Observações"
                    type="textarea"
                    value={form.observacoes}
                    onChange={(v) => setForm({ ...form, observacoes: v })}
                    placeholder="Anotações adicionais..."
                />
            </FormContainer>

            <div className="space-y-4">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-1">
                    Histórico de Registros
                </h2>
                <DataTable
                    columns={columns}
                    data={records}
                    loading={tableLoading}
                    emptyMessage="Nenhum registro de armazenamento"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default ArmazenamentoPage;
