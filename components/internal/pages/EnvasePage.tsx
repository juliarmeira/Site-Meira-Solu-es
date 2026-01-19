import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Wine } from 'lucide-react';
import { FormContainer, FormField, DataTable, PageHeader } from '../FormComponents';
import type { ControleEnvase } from '../../../types/alambique';

const EnvasePage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [records, setRecords] = useState<ControleEnvase[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [form, setForm] = useState({
        numero_lote: '',
        data_envase: '',
        graduacao_final_gl: '',
        lavagem_garrafas_conforme: false,
        resultado_cobre_mg_l: '',
        resultado_acidez: '',
        resultado_metanol: '',
        resultado_carbamato: '',
        quantidade_garrafas: '',
        volume_garrafa_ml: '700',
        observacoes: '',
    });

    useEffect(() => {
        loadRecords();
        generateLoteNumber();
    }, [user]);

    const generateLoteNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        setForm(f => ({ ...f, numero_lote: `LOT-${year}${month}${day}-${random}` }));
    };

    const loadRecords = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('controle_envase')
            .select('*')
            .eq('user_id', user.id)
            .order('data_envase', { ascending: false })
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

        const { error } = await supabase.from('controle_envase').insert({
            user_id: user.id,
            numero_lote: form.numero_lote,
            data_envase: form.data_envase,
            graduacao_final_gl: parseFloat(form.graduacao_final_gl as string),
            lavagem_garrafas_conforme: form.lavagem_garrafas_conforme,
            resultado_cobre_mg_l: form.resultado_cobre_mg_l ? parseFloat(form.resultado_cobre_mg_l as string) : null,
            resultado_acidez: form.resultado_acidez ? parseFloat(form.resultado_acidez as string) : null,
            resultado_metanol: form.resultado_metanol ? parseFloat(form.resultado_metanol as string) : null,
            resultado_carbamato: form.resultado_carbamato ? parseFloat(form.resultado_carbamato as string) : null,
            quantidade_garrafas: form.quantidade_garrafas ? parseInt(form.quantidade_garrafas as string) : null,
            volume_garrafa_ml: parseInt(form.volume_garrafa_ml as string),
            observacoes: form.observacoes || null,
        });

        if (error) {
            if (error.code === '23505') {
                setMessage({ type: 'error', text: 'Número do lote já existe. Gerando novo número...' });
                generateLoteNumber();
            } else {
                setMessage({ type: 'error', text: 'Erro ao salvar registro. Tente novamente.' });
            }
        } else {
            setMessage({ type: 'success', text: 'Registro salvo com sucesso!' });
            setForm({
                numero_lote: '',
                data_envase: '',
                graduacao_final_gl: '',
                lavagem_garrafas_conforme: false,
                resultado_cobre_mg_l: '',
                resultado_acidez: '',
                resultado_metanol: '',
                resultado_carbamato: '',
                quantidade_garrafas: '',
                volume_garrafa_ml: '700',
                observacoes: '',
            });
            generateLoteNumber();
            loadRecords();
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        const { error } = await supabase
            .from('controle_envase')
            .delete()
            .eq('id', id);

        if (!error) {
            setRecords(records.filter(r => r.id !== id));
        }
    };

    // Calculate total volume
    const quantidadeGarrafas = parseInt(form.quantidade_garrafas as string) || 0;
    const volumeGarrafa = parseInt(form.volume_garrafa_ml as string) || 700;
    const volumeTotal = quantidadeGarrafas * volumeGarrafa / 1000;

    const volumeOptions = [
        { value: '350', label: '350ml' },
        { value: '500', label: '500ml' },
        { value: '700', label: '700ml' },
        { value: '750', label: '750ml' },
        { value: '1000', label: '1000ml' },
    ];

    const columns = [
        { key: 'data_envase', label: 'Data', format: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
        { key: 'numero_lote', label: 'Lote' },
        { key: 'graduacao_final_gl', label: 'GL', format: (v: number) => `${v}%` },
        { key: 'quantidade_garrafas', label: 'Garrafas', format: (v: number | null) => v ? v.toString() : '-' },
        { key: 'lavagem_garrafas_conforme', label: 'Lavagem', format: (v: boolean) => v ? '✓' : '✗' },
    ];

    return (
        <div className="max-w-4xl space-y-8">
            <PageHeader
                title="Controle de Envase"
                subtitle="Rastreabilidade e qualidade final"
                icon={<Wine size={24} />}
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
                subtitle="Preencha os dados do envase"
                onSubmit={handleSubmit}
                loading={loading}
            >
                <div className="p-4 rounded-xl bg-meira-accent/10 border border-meira-accent/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-meira-accent/70">Número do Lote (Gerado Automaticamente)</p>
                    <p className="text-xl font-bold text-meira-accent font-mono">{form.numero_lote}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Data do Envase"
                        type="date"
                        value={form.data_envase}
                        onChange={(v) => setForm({ ...form, data_envase: v })}
                        required
                    />
                    <FormField
                        label="Graduação Final Padronizada"
                        type="number"
                        value={form.graduacao_final_gl}
                        onChange={(v) => setForm({ ...form, graduacao_final_gl: v })}
                        placeholder="38.0"
                        suffix="% GL"
                        min={38}
                        max={54}
                        step={0.1}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Quantidade de Garrafas"
                        type="number"
                        value={form.quantidade_garrafas}
                        onChange={(v) => setForm({ ...form, quantidade_garrafas: v })}
                        placeholder="0"
                        min={0}
                        step={1}
                    />
                    <FormField
                        label="Volume da Garrafa"
                        type="select"
                        value={form.volume_garrafa_ml}
                        onChange={(v) => setForm({ ...form, volume_garrafa_ml: v })}
                        options={volumeOptions}
                    />
                </div>

                {volumeTotal > 0 && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/70">Volume Total Envasado</p>
                        <p className="text-2xl font-bold text-blue-400">{volumeTotal.toFixed(2)}L</p>
                    </div>
                )}

                <FormField
                    label="Lavagem das Garrafas Conforme"
                    type="checkbox"
                    value={form.lavagem_garrafas_conforme}
                    onChange={(v) => setForm({ ...form, lavagem_garrafas_conforme: v })}
                />

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Resultados Laboratoriais</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            label="Cobre"
                            type="number"
                            value={form.resultado_cobre_mg_l}
                            onChange={(v) => setForm({ ...form, resultado_cobre_mg_l: v })}
                            placeholder="0.000"
                            suffix="mg/L"
                            min={0}
                            step={0.001}
                        />
                        <FormField
                            label="Acidez Volátil"
                            type="number"
                            value={form.resultado_acidez}
                            onChange={(v) => setForm({ ...form, resultado_acidez: v })}
                            placeholder="0.00"
                            suffix="mg/100mL"
                            min={0}
                            step={0.01}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            label="Metanol"
                            type="number"
                            value={form.resultado_metanol}
                            onChange={(v) => setForm({ ...form, resultado_metanol: v })}
                            placeholder="0.00"
                            suffix="mg/100mL"
                            min={0}
                            step={0.01}
                        />
                        <FormField
                            label="Carbamato de Etila"
                            type="number"
                            value={form.resultado_carbamato}
                            onChange={(v) => setForm({ ...form, resultado_carbamato: v })}
                            placeholder="0.000"
                            suffix="µg/L"
                            min={0}
                            step={0.001}
                        />
                    </div>
                </div>

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
                    emptyMessage="Nenhum registro de envase"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default EnvasePage;
