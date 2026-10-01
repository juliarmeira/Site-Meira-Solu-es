import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Warehouse, Info, Calendar, Sparkles, Clock } from 'lucide-react';
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
            volume_entrada_litros: parseFloat(form.volume_entrada_litros),
            volume_saida_litros: form.volume_saida_litros ? parseFloat(form.volume_saida_litros) : null,
            data_inicio: form.data_inicio,
            data_termino: form.data_termino || null,
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar registro de armazenamento.' });
        } else {
            setMessage({ type: 'success', text: 'Estocagem registrada com sucesso!' });
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
        if (!confirm('Excluir este registro?')) return;
        const { error } = await supabase.from('controle_armazenamento').delete().eq('id', id);
        if (!error) setRecords(records.filter(r => r.id !== id));
    };

    const volumeEntrada = parseFloat(form.volume_entrada_litros) || 0;
    const volumeSaida = parseFloat(form.volume_saida_litros) || 0;
    const perdaEvaporacao = volumeEntrada > 0 && volumeSaida > 0
        ? ((volumeEntrada - volumeSaida) / volumeEntrada * 100)
        : null;

    const tempoEnvelhecimentoMeses = form.data_inicio && form.data_termino
        ? Math.round((new Date(form.data_termino).getTime() - new Date(form.data_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : null;

    return (
        <div className="space-y-10 pb-20">
            <PageHeader
                title="Armazenamento e Envelhecimento"
                subtitle="Gestão da maturação em tonéis de madeira ou inox"
                icon={<Warehouse />}
            />

            {message && (
                <div className={`p-5 rounded-3xl font-bold flex items-center gap-3 animate-in fade-in duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                    <Sparkles size={18} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <FormContainer
                        title="Registrar Estocagem"
                        subtitle="Acompanhe o ganho de complexidade sensorial"
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel="Salvar Registro"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="ID do Recipiente"
                                type="text"
                                value={form.id_recipiente}
                                onChange={(v) => setForm({ ...form, id_recipiente: v })}
                                placeholder="ex: Barril Carvalho 01"
                                required
                            />
                            <FormField
                                label="Material / Madeira"
                                type="select"
                                value={form.tipo_material}
                                onChange={(v) => setForm({ ...form, tipo_material: v })}
                                options={TIPOS_MADEIRA.map(m => ({ value: m, label: m }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Volume de Entrada"
                                type="number"
                                value={form.volume_entrada_litros}
                                onChange={(v) => setForm({ ...form, volume_entrada_litros: v })}
                                placeholder="0.0"
                                suffix="L"
                                required
                            />
                            <FormField
                                label="Volume de Saída"
                                type="number"
                                value={form.volume_saida_litros}
                                onChange={(v) => setForm({ ...form, volume_saida_litros: v })}
                                placeholder="0.0"
                                suffix="L"
                                info="Preencha apenas ao finalizar o armazenamento."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Data de Entrada"
                                type="date"
                                value={form.data_inicio}
                                onChange={(v) => setForm({ ...form, data_inicio: v })}
                                required
                            />
                            <FormField
                                label="Data de Saída"
                                type="date"
                                value={form.data_termino}
                                onChange={(v) => setForm({ ...form, data_termino: v })}
                            />
                        </div>

                        <FormField
                            label="Observações do Lote"
                            type="textarea"
                            value={form.observacoes}
                            onChange={(v) => setForm({ ...form, observacoes: v })}
                            placeholder="Alguma nota sobre a tosta da madeira ou selagem?"
                        />
                    </FormContainer>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                             <Clock className="text-meira-accent" size={20} />
                            Métricas de Tempo
                        </h3>

                        <div className="space-y-4">
                            {tempoEnvelhecimentoMeses !== null && (
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-2">Tempo de Maturação</p>
                                    <p className="text-2xl font-black text-amber-600">
                                        {tempoEnvelhecimentoMeses >= 12
                                            ? `${Math.floor(tempoEnvelhecimentoMeses / 12)} ano(s) e ${tempoEnvelhecimentoMeses % 12} mês(es)`
                                            : `${tempoEnvelhecimentoMeses} mês(es)`}
                                    </p>
                                </div>
                            )}

                            {perdaEvaporacao !== null && (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Perda do Anjo (Evaporação)</p>
                                    <p className="text-2xl font-black text-slate-900">{perdaEvaporacao.toFixed(1)}%</p>
                                    <p className="text-[11px] text-slate-400 mt-1 font-medium italic">{(volumeEntrada - volumeSaida).toFixed(1)} Litros evaporados.</p>
                                </div>
                            )}

                            {!tempoEnvelhecimentoMeses && !perdaEvaporacao && (
                                <p className="text-xs text-slate-300 italic">As métricas aparecerão conforme os dados de saída forem preenchidos.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
                        <div className="flex items-center gap-2 text-meira-accent">
                            <Info size={18} />
                            <h4 className="font-bold text-xs uppercase tracking-widest">Aviso BPF</h4>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            Tonéis de madeira devem ser inspecionados regularmente contra vazamentos e proliferação de fungos externos.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400 px-4">
                    Estoque em Maturação
                </h2>
                <DataTable
                    columns={[
                        { key: 'data_inicio', label: 'Entrada', format: (v) => new Date(v).toLocaleDateString('pt-BR') },
                        { key: 'id_recipiente', label: 'Recipiente' },
                        { key: 'tipo_material', label: 'Material' },
                        { key: 'volume_entrada_litros', label: 'Vol. (L)', format: (v) => <span className="font-bold">{v}L</span> },
                        { key: 'data_termino', label: 'Status', format: (v) => v ? 'Finalizado' : <span className="text-green-500 font-bold">Em curso</span> },
                    ]}
                    data={records}
                    loading={tableLoading}
                    emptyMessage="Nenhum barril ou tanque em uso"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default ArmazenamentoPage;
