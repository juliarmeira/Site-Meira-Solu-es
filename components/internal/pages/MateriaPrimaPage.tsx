import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Wheat, Info, AlertTriangle, Droplets, Scale } from 'lucide-react';
import { FormContainer, FormField, DataTable, PageHeader } from '../FormComponents';
import type { ControleMateriaPrima } from '../../../types/alambique';

const MateriaPrimaPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [records, setRecords] = useState<ControleMateriaPrima[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [form, setForm] = useState({
        data_hora_corte: '',
        data_hora_moagem: '',
        id_talhao: '',
        peso_cana_kg: '',
        volume_caldo_litros: '',
        brix_original: '',
        volume_agua_litros: '',
        brix_final_mosto: '',
        observacoes: '',
    });

    useEffect(() => {
        loadRecords();
    }, [user]);

    // Auto-calculate suggested water
    useEffect(() => {
        const caldo = parseFloat(form.volume_caldo_litros);
        const brix = parseFloat(form.brix_original);
        const targetBrix = 15;

        if (!isNaN(caldo) && !isNaN(brix) && brix > targetBrix) {
            const aguaSugerida = (caldo * (brix - targetBrix)) / targetBrix;
            setForm(prev => ({
                ...prev,
                volume_agua_litros: aguaSugerida.toFixed(1),
                brix_final_mosto: targetBrix.toString()
            }));
        }
    }, [form.volume_caldo_litros, form.brix_original]);

    const loadRecords = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('controle_materia_prima')
            .select('*')
            .eq('user_id', user.id)
            .order('data_hora_moagem', { ascending: false })
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

        const { error } = await supabase.from('controle_materia_prima').insert({
            user_id: user.id,
            data_hora_corte: form.data_hora_corte,
            data_hora_moagem: form.data_hora_moagem,
            id_talhao: form.id_talhao,
            peso_cana_kg: parseFloat(form.peso_cana_kg) || null,
            volume_caldo_litros: parseFloat(form.volume_caldo_litros),
            brix_original: parseFloat(form.brix_original),
            volume_agua_litros: parseFloat(form.volume_agua_litros) || 0,
            brix_final_mosto: parseFloat(form.brix_final_mosto),
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar registro. Verifique a conexão.' });
        } else {
            setMessage({ type: 'success', text: 'Registro de moagem salvo com sucesso!' });
            setForm({
                data_hora_corte: '',
                data_hora_moagem: '',
                id_talhao: '',
                peso_cana_kg: '',
                volume_caldo_litros: '',
                brix_original: '',
                volume_agua_litros: '',
                brix_final_mosto: '',
                observacoes: '',
            });
            loadRecords();
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;
        const { error } = await supabase.from('controle_materia_prima').delete().eq('id', id);
        if (!error) setRecords(records.filter(r => r.id !== id));
    };

    const tempoEsperaHoras = form.data_hora_corte && form.data_hora_moagem
        ? (new Date(form.data_hora_moagem).getTime() - new Date(form.data_hora_corte).getTime()) / 3600000
        : null;

    const rendimentoExtração = parseFloat(form.peso_cana_kg) > 0 && parseFloat(form.volume_caldo_litros) > 0
        ? (parseFloat(form.volume_caldo_litros) / (parseFloat(form.peso_cana_kg) / 1000))
        : null;

    return (
        <div className="space-y-10 pb-20">
            <PageHeader
                title="Entrada de Matéria-Prima"
                subtitle="Gerencie a colheita, moagem e a diluição do mosto"
                icon={<Wheat />}
            />

            {message && (
                <div className={`p-5 rounded-3xl font-bold flex items-center gap-3 animate-in zoom-in-95 duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                    <Info size={18} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <FormContainer
                        title="Registrar Nova Moagem"
                        subtitle="Insira os dados técnicos para cálculos automáticos"
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel="Finalizar Registro"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Data/Hora do Corte"
                                type="datetime-local"
                                value={form.data_hora_corte}
                                onChange={(v) => setForm({ ...form, data_hora_corte: v })}
                                required
                            />
                            <FormField
                                label="Data/Hora da Moagem"
                                type="datetime-local"
                                value={form.data_hora_moagem}
                                onChange={(v) => setForm({ ...form, data_hora_moagem: v })}
                                required
                                error={tempoEsperaHoras > 24 ? "Alerta: Mais de 24h desde o corte!" : undefined}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                label="Identificação do Talhão"
                                type="text"
                                value={form.id_talhao}
                                onChange={(v) => setForm({ ...form, id_talhao: v })}
                                placeholder="ex: Talhão Norte"
                                required
                            />
                            <FormField
                                label="Peso da Cana"
                                type="number"
                                value={form.peso_cana_kg}
                                onChange={(v) => setForm({ ...form, peso_cana_kg: v })}
                                placeholder="0"
                                suffix="Kg"
                                info="Opcional: usado para calcular o rendimento de caldo por tonelada."
                            />
                            <FormField
                                label="Caldo Extraído"
                                type="number"
                                value={form.volume_caldo_litros}
                                onChange={(v) => setForm({ ...form, volume_caldo_litros: v })}
                                placeholder="0"
                                suffix="L"
                                required
                            />
                        </div>

                        <div className="p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100 space-y-6">
                            <div className="flex items-center gap-2 text-amber-700">
                                <Droplets size={20} />
                                <h4 className="font-bold text-sm uppercase tracking-widest">Ajuste do Mosto (Alvo 15° Brix)</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    label="Brix da Cana"
                                    type="number"
                                    value={form.brix_original}
                                    onChange={(v) => setForm({ ...form, brix_original: v })}
                                    placeholder="0.0"
                                    suffix="°Bx"
                                    required
                                    info="Medido com o refratômetro logo após a moagem."
                                />
                                <FormField
                                    label="Água a Adicionar"
                                    type="number"
                                    value={form.volume_agua_litros}
                                    onChange={(v) => setForm({ ...form, volume_agua_litros: v })}
                                    placeholder="0.0"
                                    suffix="L"
                                    info="Calculado automaticamente para atingir 15° Brix."
                                />
                                <FormField
                                    label="Brix Final (Mosto)"
                                    type="number"
                                    value={form.brix_final_mosto}
                                    onChange={(v) => setForm({ ...form, brix_final_mosto: v })}
                                    placeholder="15.0"
                                    suffix="°Bx"
                                    required
                                />
                            </div>
                        </div>

                        <FormField
                            label="Anotações Gerais"
                            type="textarea"
                            value={form.observacoes}
                            onChange={(v) => setForm({ ...form, observacoes: v })}
                            placeholder="Alguma observação sobre a qualidade da cana?"
                        />
                    </FormContainer>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                            <Scale className="text-meira-accent" size={20} />
                            Rendimento
                        </h3>

                        {rendimentoExtração !== null ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Caldo por Tonelada</p>
                                    <p className="text-3xl font-black text-slate-900">{rendimentoExtração.toFixed(0)} L/t</p>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {rendimentoExtração >= 550 && rendimentoExtração <= 650
                                        ? "✅ Rendimento dentro do padrão esperado (~600L/t)."
                                        : rendimentoExtração < 550
                                            ? "⚠️ Rendimento abaixo do esperado. Verifique a pressão da moenda."
                                            : "✨ Rendimento excepcional!"}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-300 italic py-4">Preencha o peso da cana e o volume de caldo para ver o rendimento.</p>
                        )}
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
                        <div className="flex items-center gap-2 text-meira-accent">
                            <Info size={18} />
                            <h4 className="font-bold text-xs uppercase tracking-widest">Dica de BPF</h4>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            O caldo deve ser decantado por 20 a 30 minutos antes de ir para a fermentação para remover impurezas sólidas.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400 px-4">
                    Últimas Moagens
                </h2>
                <DataTable
                    columns={[
                        { key: 'data_hora_moagem', label: 'Data', format: (v) => new Date(v).toLocaleDateString('pt-BR') },
                        { key: 'id_talhao', label: 'Origem' },
                        { key: 'volume_caldo_litros', label: 'Caldo (L)', format: (v) => <span className="font-bold">{v}L</span> },
                        { key: 'brix_original', label: 'Original', format: (v) => `${v}°` },
                        { key: 'brix_final_mosto', label: 'Final', format: (v) => <span className="text-meira-accent font-bold">{v}°</span> },
                    ]}
                    data={records}
                    loading={tableLoading}
                    emptyMessage="Nenhuma moagem registrada"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default MateriaPrimaPage;
