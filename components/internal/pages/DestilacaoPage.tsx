import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Flame } from 'lucide-react';
import { FormContainer, FormField, DataTable, PageHeader } from '../FormComponents';
import type { ControleDestilacao } from '../../../types/alambique';

const DestilacaoPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [records, setRecords] = useState<ControleDestilacao[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [form, setForm] = useState({
        id_alambique: '',
        data_destilacao: '',
        volume_vinho_litros: '',
        teor_alcoolico_vinho: '',
        volume_cabeca_litros: '',
        volume_coracao_litros: '',
        volume_cauda_litros: '',
        graduacao_coracao_gl: '',
        limpeza_previa_cobre: false,
        observacoes: '',
    });

    useEffect(() => {
        loadRecords();
    }, [user]);

    const loadRecords = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('controle_destilacao')
            .select('*')
            .eq('user_id', user.id)
            .order('data_destilacao', { ascending: false })
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

        const { error } = await supabase.from('controle_destilacao').insert({
            user_id: user.id,
            id_alambique: form.id_alambique,
            data_destilacao: form.data_destilacao,
            volume_vinho_litros: parseFloat(form.volume_vinho_litros as string),
            teor_alcoolico_vinho: parseFloat(form.teor_alcoolico_vinho as string),
            volume_cabeca_litros: parseFloat(form.volume_cabeca_litros as string),
            volume_coracao_litros: parseFloat(form.volume_coracao_litros as string),
            volume_cauda_litros: parseFloat(form.volume_cauda_litros as string),
            graduacao_coracao_gl: parseFloat(form.graduacao_coracao_gl as string),
            limpeza_previa_cobre: form.limpeza_previa_cobre,
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar registro. Tente novamente.' });
        } else {
            setMessage({ type: 'success', text: 'Registro salvo com sucesso!' });
            setForm({
                id_alambique: '',
                data_destilacao: '',
                volume_vinho_litros: '',
                teor_alcoolico_vinho: '',
                volume_cabeca_litros: '',
                volume_coracao_litros: '',
                volume_cauda_litros: '',
                graduacao_coracao_gl: '',
                limpeza_previa_cobre: false,
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
            .from('controle_destilacao')
            .delete()
            .eq('id', id);

        if (!error) {
            setRecords(records.filter(r => r.id !== id));
        }
    };

    // Calculate rendimento
    const volumeTotal = (parseFloat(form.volume_cabeca_litros as string) || 0) +
        (parseFloat(form.volume_coracao_litros as string) || 0) +
        (parseFloat(form.volume_cauda_litros as string) || 0);
    const volumeVinho = parseFloat(form.volume_vinho_litros as string) || 0;
    const rendimento = volumeVinho > 0 ? ((parseFloat(form.volume_coracao_litros as string) || 0) / volumeVinho * 100) : 0;

    const columns = [
        { key: 'data_destilacao', label: 'Data', format: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
        { key: 'id_alambique', label: 'Alambique' },
        { key: 'volume_vinho_litros', label: 'Vinho (L)', format: (v: number) => `${v}L` },
        { key: 'volume_coracao_litros', label: 'Coração (L)', format: (v: number) => `${v}L` },
        { key: 'graduacao_coracao_gl', label: 'GL', format: (v: number) => `${v}%` },
        { key: 'limpeza_previa_cobre', label: 'Limpeza', format: (v: boolean) => v ? '✓' : '✗' },
    ];

    return (
        <div className="max-w-4xl space-y-8">
            <PageHeader
                title="Controle de Destilação"
                subtitle="Registro de cortes e rendimento"
                icon={<Flame size={24} />}
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
                subtitle="Preencha os dados da destilação"
                onSubmit={handleSubmit}
                loading={loading}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="ID do Alambique"
                        type="text"
                        value={form.id_alambique}
                        onChange={(v) => setForm({ ...form, id_alambique: v })}
                        placeholder="Ex: ALB-001"
                        required
                    />
                    <FormField
                        label="Data da Destilação"
                        type="date"
                        value={form.data_destilacao}
                        onChange={(v) => setForm({ ...form, data_destilacao: v })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Volume de Vinho Carregado"
                        type="number"
                        value={form.volume_vinho_litros}
                        onChange={(v) => setForm({ ...form, volume_vinho_litros: v })}
                        placeholder="0.00"
                        suffix="L"
                        min={0}
                        step={0.1}
                        required
                    />
                    <FormField
                        label="Teor Alcoólico do Vinho"
                        type="number"
                        value={form.teor_alcoolico_vinho}
                        onChange={(v) => setForm({ ...form, teor_alcoolico_vinho: v })}
                        placeholder="0.0"
                        suffix="% GL"
                        min={0}
                        max={20}
                        step={0.1}
                        required
                    />
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cortes da Destilação</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <FormField
                            label="Volume Cabeça"
                            type="number"
                            value={form.volume_cabeca_litros}
                            onChange={(v) => setForm({ ...form, volume_cabeca_litros: v })}
                            placeholder="0.00"
                            suffix="L"
                            min={0}
                            step={0.1}
                            required
                        />
                        <FormField
                            label="Volume Coração"
                            type="number"
                            value={form.volume_coracao_litros}
                            onChange={(v) => setForm({ ...form, volume_coracao_litros: v })}
                            placeholder="0.00"
                            suffix="L"
                            min={0}
                            step={0.1}
                            required
                        />
                        <FormField
                            label="Volume Cauda"
                            type="number"
                            value={form.volume_cauda_litros}
                            onChange={(v) => setForm({ ...form, volume_cauda_litros: v })}
                            placeholder="0.00"
                            suffix="L"
                            min={0}
                            step={0.1}
                            required
                        />
                    </div>
                    {volumeTotal > 0 && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-orange-400/70">Volume Total</p>
                                <p className="text-xl font-bold text-orange-400">{volumeTotal.toFixed(2)}L</p>
                            </div>
                            <div className="p-3 rounded-lg bg-meira-accent/10 border border-meira-accent/20">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-meira-accent/70">Rendimento Coração</p>
                                <p className="text-xl font-bold text-meira-accent">{rendimento.toFixed(1)}%</p>
                            </div>
                        </div>
                    )}
                </div>

                <FormField
                    label="Graduação Alcoólica do Coração"
                    type="number"
                    value={form.graduacao_coracao_gl}
                    onChange={(v) => setForm({ ...form, graduacao_coracao_gl: v })}
                    placeholder="0.0"
                    suffix="% GL"
                    min={30}
                    max={85}
                    step={0.1}
                    required
                />

                <FormField
                    label="Limpeza Prévia do Cobre"
                    type="checkbox"
                    value={form.limpeza_previa_cobre}
                    onChange={(v) => setForm({ ...form, limpeza_previa_cobre: v })}
                />

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
                    emptyMessage="Nenhum registro de destilação"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default DestilacaoPage;
