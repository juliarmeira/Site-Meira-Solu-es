import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Wine, Info, Calculator, Droplets, FlaskConical, ClipboardCheck } from 'lucide-react';
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

    // Calc states
    const [calc, setCalc] = useState({
        volInicial: '',
        glInicial: '',
        glFinal: '40',
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
            graduacao_final_gl: parseFloat(form.graduacao_final_gl),
            lavagem_garrafas_conforme: form.lavagem_garrafas_conforme,
            resultado_cobre_mg_l: form.resultado_cobre_mg_l ? parseFloat(form.resultado_cobre_mg_l) : null,
            resultado_acidez: form.resultado_acidez ? parseFloat(form.resultado_acidez) : null,
            resultado_metanol: form.resultado_metanol ? parseFloat(form.resultado_metanol) : null,
            resultado_carbamato: form.resultado_carbamato ? parseFloat(form.resultado_carbamato) : null,
            quantidade_garrafas: form.quantidade_garrafas ? parseInt(form.quantidade_garrafas) : null,
            volume_garrafa_ml: parseInt(form.volume_garrafa_ml),
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao registrar lote de envase.' });
        } else {
            setMessage({ type: 'success', text: 'Lote envasado com sucesso!' });
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
        if (!confirm('Excluir este lote?')) return;
        const { error } = await supabase.from('controle_envase').delete().eq('id', id);
        if (!error) setRecords(records.filter(r => r.id !== id));
    };

    // Padronização Calc
    const volWaterToLink = (parseFloat(calc.volInicial) * (parseFloat(calc.glInicial) - parseFloat(calc.glFinal))) / parseFloat(calc.glFinal);
    const volumeTotalCalc = (parseFloat(calc.volInicial) || 0) + (volWaterToLink || 0);

    return (
        <div className="space-y-10 pb-20">
            <PageHeader
                title="Padronização e Envase"
                subtitle="Ajuste fino do teor alcoólico e rastreabilidade total"
                icon={<Wine />}
            />

            {message && (
                <div className={`p-5 rounded-3xl font-bold flex items-center gap-3 animate-in fade-in duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                    <ClipboardCheck size={18} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <FormContainer
                        title="Registrar Novo Lote"
                        subtitle="Gerencie as garrafas e resultados laboratoriais"
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel="Finalizar Envase"
                    >
                        <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 mb-6">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Rastreabilidade</p>
                            <p className="text-xl font-black text-indigo-600 font-mono tracking-tight">{form.numero_lote}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Data do Envase"
                                type="date"
                                value={form.data_envase}
                                onChange={(v) => setForm({ ...form, data_envase: v })}
                                required
                            />
                            <FormField
                                label="Graduação Final"
                                type="number"
                                value={form.graduacao_final_gl}
                                onChange={(v) => setForm({ ...form, graduacao_final_gl: v })}
                                suffix="% GL"
                                placeholder="40.0"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Qtd. de Garrafas"
                                type="number"
                                value={form.quantidade_garrafas}
                                onChange={(v) => setForm({ ...form, quantidade_garrafas: v })}
                                placeholder="0"
                            />
                            <FormField
                                label="Volume p/ Garrafa"
                                type="select"
                                value={form.volume_garrafa_ml}
                                onChange={(v) => setForm({ ...form, volume_garrafa_ml: v })}
                                options={[
                                    { value: '350', label: '350ml' },
                                    { value: '500', label: '500ml' },
                                    { value: '700', label: '700ml' },
                                    { value: '750', label: '750ml' },
                                    { value: '1000', label: '1 Litro' },
                                ]}
                            />
                        </div>

                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            <h4 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-400">Resultados Laboratoriais (BPF)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    label="Cobre (Max 5.0)"
                                    type="number"
                                    value={form.resultado_cobre_mg_l}
                                    onChange={(v) => setForm({ ...form, resultado_cobre_mg_l: v })}
                                    suffix="mg/L"
                                    placeholder="0.0"
                                    error={parseFloat(form.resultado_cobre_mg_l) > 5 ? "ALERTA: Acima do limite legal!" : undefined}
                                />
                                <FormField
                                    label="Metanol (Max 20.0)"
                                    type="number"
                                    value={form.resultado_metanol}
                                    onChange={(v) => setForm({ ...form, resultado_metanol: v })}
                                    suffix="mg/100ml"
                                    placeholder="0.0"
                                    error={parseFloat(form.resultado_metanol) > 20 ? "ALERTA: Acima do limite legal!" : undefined}
                                />
                            </div>
                        </div>

                        <FormField
                            label="Lavagem das Garrafas Conforme POP"
                            type="checkbox"
                            value={form.lavagem_garrafas_conforme}
                            onChange={(v) => setForm({ ...form, lavagem_garrafas_conforme: v })}
                        />

                        <FormField
                            label="Observações do Lote"
                            type="textarea"
                            value={form.observacoes}
                            onChange={(v) => setForm({ ...form, observacoes: v })}
                            placeholder="Alguma observação sobre o rótulo ou tampa?"
                        />
                    </FormContainer>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                            <Calculator className="text-meira-accent" size={20} />
                            Calculadora de Diluição
                        </h3>

                        <div className="space-y-4">
                            <FormField
                                label="Volume Original"
                                type="number"
                                value={calc.volInicial}
                                onChange={(v) => setCalc({ ...calc, volInicial: v })}
                                suffix="L"
                                placeholder="0"
                            />
                            <FormField
                                label="Graduação Atual"
                                type="number"
                                value={calc.glInicial}
                                onChange={(v) => setCalc({ ...calc, glInicial: v })}
                                suffix="% GL"
                                placeholder="48"
                            />

                            {volWaterToLink > 0 && (
                                <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Água Desmineralizada</p>
                                        <p className="text-2xl font-black text-amber-600">+{volWaterToLink.toFixed(1)} L</p>
                                    </div>
                                    <div className="pt-4 border-t border-amber-100/50">
                                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Volume Final Esperado</p>
                                        <p className="text-xl font-black text-amber-700">{volumeTotalCalc.toFixed(1)} L</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
                        <div className="flex items-center gap-2 text-meira-accent">
                            <Info size={18} />
                            <h4 className="font-bold text-xs uppercase tracking-widest">Dica Legal</h4>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            A cachaça deve ter entre 38% e 48% de graduação alcoólica por lei. Fora disso, é classificada como Aguardente de Cana.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400 px-4">
                    Histórico de Lotes
                </h2>
                <DataTable
                    columns={[
                        { key: 'data_envase', label: 'Data', format: (v) => new Date(v).toLocaleDateString('pt-BR') },
                        { key: 'numero_lote', label: 'Lote' },
                        { key: 'graduacao_final_gl', label: 'GL', format: (v) => <span className="font-bold">{v}%</span> },
                        { key: 'quantidade_garrafas', label: 'Qtd', format: (v) => <span className="text-meira-accent font-bold">{v}</span> },
                        { key: 'volume_garrafa_ml', label: 'Vol (ml)' },
                    ]}
                    data={records}
                    loading={tableLoading}
                    emptyMessage="Nenhum lote envasado ainda"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default EnvasePage;
