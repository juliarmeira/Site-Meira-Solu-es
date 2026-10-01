import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Flame, Info, Percent, Beaker, Scissors, Zap } from 'lucide-react';
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

    const volumeVinho = parseFloat(form.volume_vinho_litros) || 0;
    const teorVinho = parseFloat(form.teor_alcoolico_vinho) || 0;

    // Theoretical volume of distillate (crude)
    // Formula: (Volume Vinho * Teor Alcohol Vinho) / Average Output GL (~40-45%)
    const volumeTeoricoBruto = (volumeVinho * teorVinho) / 40;

    // Suggested cuts based on theoretical volume
    const sugCabeca = volumeTeoricoBruto * 0.05;
    const sugCoracao = volumeTeoricoBruto * 0.80;
    const sugCauda = volumeTeoricoBruto * 0.15;

    const volumeRealTotal = (parseFloat(form.volume_cabeca_litros) || 0) +
                          (parseFloat(form.volume_coracao_litros) || 0) +
                          (parseFloat(form.volume_cauda_litros) || 0);

    const eficiencia = volumeTeoricoBruto > 0 ? (volumeRealTotal / volumeTeoricoBruto * 100) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.from('controle_destilacao').insert({
            user_id: user.id,
            id_alambique: form.id_alambique,
            data_destilacao: form.data_destilacao,
            volume_vinho_litros: parseFloat(form.volume_vinho_litros),
            teor_alcoolico_vinho: parseFloat(form.teor_alcoolico_vinho),
            volume_cabeca_litros: parseFloat(form.volume_cabeca_litros),
            volume_coracao_litros: parseFloat(form.volume_coracao_litros),
            volume_cauda_litros: parseFloat(form.volume_cauda_litros),
            graduacao_coracao_gl: parseFloat(form.graduacao_coracao_gl),
            limpeza_previa_cobre: form.limpeza_previa_cobre,
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar destilação. Verifique os dados.' });
        } else {
            setMessage({ type: 'success', text: 'Destilação registrada com sucesso!' });
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
        if (!confirm('Excluir este registro?')) return;
        const { error } = await supabase.from('controle_destilacao').delete().eq('id', id);
        if (!error) setRecords(records.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-10 pb-20">
            <PageHeader
                title="Processo de Destilação"
                subtitle="Controle de cortes, rendimento e eficiência térmica"
                icon={<Flame />}
            />

            {message && (
                <div className={`p-5 rounded-3xl font-bold flex items-center gap-3 animate-in fade-in duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                    <Info size={18} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <FormContainer
                        title="Nova Alambicada"
                        subtitle="Determine os volumes teórico e real"
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel="Registrar Destilação"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Equipamento"
                                type="text"
                                value={form.id_alambique}
                                onChange={(v) => setForm({ ...form, id_alambique: v })}
                                placeholder="ex: Alambique de Cobre #1"
                                required
                            />
                            <FormField
                                label="Data da Queima"
                                type="date"
                                value={form.data_destilacao}
                                onChange={(v) => setForm({ ...form, data_destilacao: v })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Vinho Carregado"
                                type="number"
                                value={form.volume_vinho_litros}
                                onChange={(v) => setForm({ ...form, volume_vinho_litros: v })}
                                placeholder="0"
                                suffix="L"
                                required
                                info="Volume total de vinho colocado na panela do alambique."
                            />
                            <FormField
                                label="Força do Vinho"
                                type="number"
                                value={form.teor_alcoolico_vinho}
                                onChange={(v) => setForm({ ...form, teor_alcoolico_vinho: v })}
                                placeholder="0.0"
                                suffix="% GL"
                                required
                                info="Teor alcoólico do vinho fermentado (geralmente entre 7% e 12%)."
                            />
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-widest">
                                    <Scissors size={20} className="text-meira-accent" />
                                    Cortes Reais Colhidos
                                </div>
                                {volumeTeoricoBruto > 0 && (
                                    <div className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                        Expectativa: {volumeTeoricoBruto.toFixed(1)}L Total
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    label="Cabeça (Tóxico)"
                                    type="number"
                                    value={form.volume_cabeca_litros}
                                    onChange={(v) => setForm({ ...form, volume_cabeca_litros: v })}
                                    placeholder="0.0"
                                    suffix="L"
                                    required
                                    info={`Sugerido: ~${sugCabeca.toFixed(1)}L`}
                                    error={parseFloat(form.volume_cabeca_litros) > 0 && parseFloat(form.volume_cabeca_litros) < sugCabeca ? "Aviso: Corte de cabeça baixo!" : undefined}
                                />
                                <FormField
                                    label="Coração (Cachaça)"
                                    type="number"
                                    value={form.volume_coracao_litros}
                                    onChange={(v) => setForm({ ...form, volume_coracao_litros: v })}
                                    placeholder="0.0"
                                    suffix="L"
                                    required
                                    info={`Sugerido: ~${sugCoracao.toFixed(1)}L`}
                                />
                                <FormField
                                    label="Cauda (Vinhoto)"
                                    type="number"
                                    value={form.volume_cauda_litros}
                                    onChange={(v) => setForm({ ...form, volume_cauda_litros: v })}
                                    placeholder="0.0"
                                    suffix="L"
                                    required
                                    info={`Sugerido: ~${sugCauda.toFixed(1)}L`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Graduação do Coração"
                                type="number"
                                value={form.graduacao_coracao_gl}
                                onChange={(v) => setForm({ ...form, graduacao_coracao_gl: v })}
                                placeholder="0.0"
                                suffix="% GL"
                                required
                                info="Graduação alcoólica da cachaça pura colhida (antes da padronização)."
                            />
                            <div className="flex items-center h-full pt-6">
                                <FormField
                                    label="Limpeza de Cobre Realizada"
                                    type="checkbox"
                                    value={form.limpeza_previa_cobre}
                                    onChange={(v) => setForm({ ...form, limpeza_previa_cobre: v })}
                                />
                            </div>
                        </div>

                        <FormField
                            label="Observações"
                            type="textarea"
                            value={form.observacoes}
                            onChange={(v) => setForm({ ...form, observacoes: v })}
                            placeholder="Alguma anomalia no fogo ou resfriamento?"
                        />
                    </FormContainer>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                            <Zap className="text-amber-400" size={20} />
                            Desempenho
                        </h3>

                        <div className="space-y-6">
                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Eficiência do Alambique</p>
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-meira-accent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - (eficiencia / 100))} strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute font-black text-xl text-slate-900">{eficiencia.toFixed(0)}%</span>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-center">
                                {eficiencia > 90 ? "✨ Excelente extração de álcool." : eficiencia > 70 ? "✅ Dentro do esperado." : "⚠️ Verifique vazamentos de vapor."}
                            </p>
                        </div>
                    </div>

                    <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-indigo-200/40">
                        <div className="flex items-center gap-2 text-indigo-300">
                            <Scissors size={20} />
                            <h4 className="font-bold text-xs uppercase tracking-widest leading-none">Guia de Cortes</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-indigo-200">Cabeça (5-10%)</span>
                                <span className="font-bold text-red-300">{sugCabeca.toFixed(1)}L</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-indigo-200">Coração (~80%)</span>
                                <span className="font-bold text-green-300">{sugCoracao.toFixed(1)}L</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-indigo-200">Cauda (10-15%)</span>
                                <span className="font-bold text-amber-300">{sugCauda.toFixed(1)}L</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-indigo-300 italic opacity-60">
                            *Valores baseados no rendimento teórico de 1L destilado bruto a cada 4L de vinho.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400 px-4">
                    Histórico de Produção
                </h2>
                <DataTable
                    columns={[
                        { key: 'data_destilacao', label: 'Data', format: (v) => new Date(v).toLocaleDateString('pt-BR') },
                        { key: 'id_alambique', label: 'Alambique' },
                        { key: 'volume_vinho_litros', label: 'Vinho (L)', format: (v) => `${v}L` },
                        { key: 'volume_coracao_litros', label: 'Coração', format: (v) => <span className="text-meira-accent font-bold">{v}L</span> },
                        { key: 'graduacao_coracao_gl', label: 'Força Coração', format: (v) => <span className="font-bold">{v}%</span> },
                    ]}
                    data={records}
                    loading={tableLoading}
                    emptyMessage="Nenhuma destilação registrada"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default DestilacaoPage;
