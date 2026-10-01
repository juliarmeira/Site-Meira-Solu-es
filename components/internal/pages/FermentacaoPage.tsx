import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { FlaskConical, Info, Thermometer, Droplets, Clock, Activity } from 'lucide-react';
import { FormContainer, FormField, DataTable, PageHeader } from '../FormComponents';
import type { ControleFermentacao } from '../../../types/alambique';

const FermentacaoPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [records, setRecords] = useState<ControleFermentacao[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [form, setForm] = useState({
        id_dorna: '',
        data_hora_inicio: '',
        data_hora_termino: '',
        ph_inicial: '',
        ph_final: '',
        temperatura_maxima: '',
        brix_final_atenuacao: '',
        nutrientes_fermentos: '',
        observacoes: '',
    });

    useEffect(() => {
        loadRecords();
    }, [user]);

    const loadRecords = async () => {
        if (!user) return;
        setTableLoading(true);
        const { data, error } = await supabase
            .from('controle_fermentacao')
            .select('*')
            .eq('user_id', user.id)
            .order('data_hora_inicio', { ascending: false })
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

        const { error } = await supabase.from('controle_fermentacao').insert({
            user_id: user.id,
            id_dorna: form.id_dorna,
            data_hora_inicio: form.data_hora_inicio,
            data_hora_termino: form.data_hora_termino || null,
            ph_inicial: parseFloat(form.ph_inicial),
            ph_final: form.ph_final ? parseFloat(form.ph_final) : null,
            temperatura_maxima: form.temperatura_maxima ? parseFloat(form.temperatura_maxima) : null,
            brix_final_atenuacao: form.brix_final_atenuacao ? parseFloat(form.brix_final_atenuacao) : null,
            nutrientes_fermentos: form.nutrientes_fermentos || null,
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar registro de fermentação.' });
        } else {
            setMessage({ type: 'success', text: 'Fermentação iniciada/atualizada com sucesso!' });
            setForm({
                id_dorna: '',
                data_hora_inicio: '',
                data_hora_termino: '',
                ph_inicial: '',
                ph_final: '',
                temperatura_maxima: '',
                brix_final_atenuacao: '',
                nutrientes_fermentos: '',
                observacoes: '',
            });
            loadRecords();
        }

        setLoading(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este registro?')) return;
        const { error } = await supabase.from('controle_fermentacao').delete().eq('id', id);
        if (!error) setRecords(records.filter(r => r.id !== id));
    };

    const tempoCiclo = form.data_hora_inicio && form.data_hora_termino
        ? (new Date(form.data_hora_termino).getTime() - new Date(form.data_hora_inicio).getTime()) / 3600000
        : null;

    const phOk = parseFloat(form.ph_inicial) >= 4.0 && parseFloat(form.ph_inicial) <= 5.0;
    const tempOk = !form.temperatura_maxima || parseFloat(form.temperatura_maxima) <= 32;

    return (
        <div className="space-y-10 pb-20">
            <PageHeader
                title="Controle de Fermentação"
                subtitle="Monitore a saúde do pé-de-cuba e a conversão de açúcares"
                icon={<FlaskConical />}
            />

            {message && (
                <div className={`p-5 rounded-3xl font-bold flex items-center gap-3 animate-in fade-in duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                    <Activity size={18} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <FormContainer
                        title="Registrar Ciclo de Fermentação"
                        subtitle="Acompanhe desde o início até a atenuação total"
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel="Salvar Dados da Dorna"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Identificação da Dorna"
                                type="text"
                                value={form.id_dorna}
                                onChange={(v) => setForm({ ...form, id_dorna: v })}
                                placeholder="ex: Dorna 01"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    label="Início"
                                    type="datetime-local"
                                    value={form.data_hora_inicio}
                                    onChange={(v) => setForm({ ...form, data_hora_inicio: v })}
                                    required
                                />
                                <FormField
                                    label="Término"
                                    type="datetime-local"
                                    value={form.data_hora_termino}
                                    onChange={(v) => setForm({ ...form, data_hora_termino: v })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                label="pH Inicial"
                                type="number"
                                value={form.ph_inicial}
                                onChange={(v) => setForm({ ...form, ph_inicial: v })}
                                placeholder="4.5"
                                step={0.1}
                                required
                                error={parseFloat(form.ph_inicial) > 5.0 ? "pH muito alto! Adicione ácido cítrico." : (parseFloat(form.ph_inicial) < 4.0 ? "pH baixo! Risco de travar fermentação." : undefined)}
                                info="O ideal é entre 4.0 e 5.0 para evitar bactérias."
                            />
                            <FormField
                                label="pH Final"
                                type="number"
                                value={form.ph_final}
                                onChange={(v) => setForm({ ...form, ph_final: v })}
                                placeholder="3.8"
                                step={0.1}
                            />
                            <FormField
                                label="Atenuação (Brix Final)"
                                type="number"
                                value={form.brix_final_atenuacao}
                                onChange={(v) => setForm({ ...form, brix_final_atenuacao: v })}
                                placeholder="0.0"
                                suffix="°Bx"
                                info="A fermentação termina quando o Brix chega a zero (ou negativo)."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Temperatura Máxima"
                                type="number"
                                value={form.temperatura_maxima}
                                onChange={(v) => setForm({ ...form, temperatura_maxima: v })}
                                placeholder="30"
                                suffix="°C"
                                error={parseFloat(form.temperatura_maxima) > 32 ? "Atenção: Temperatura acima de 32°C mata o fermento!" : undefined}
                            />
                            <FormField
                                label="Nutrientes/Insumos"
                                type="text"
                                value={form.nutrientes_fermentos}
                                onChange={(v) => setForm({ ...form, nutrientes_fermentos: v })}
                                placeholder="ex: Farelo de Arroz / Antibiótico"
                            />
                        </div>

                        <FormField
                            label="Observações da Fermentação"
                            type="textarea"
                            value={form.observacoes}
                            onChange={(v) => setForm({ ...form, observacoes: v })}
                            placeholder="Descreva o odor, cor ou qualquer anormalidade."
                        />
                    </FormContainer>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                            <Activity className="text-meira-accent" size={20} />
                            Status Dinâmico
                        </h3>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${phOk ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                <Droplets size={18} />
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Controle de pH</p>
                                    <p className="text-sm font-bold">{phOk ? 'pH Ideal (Seguro)' : 'Fora do Padrão'}</p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${tempOk ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                <Thermometer size={18} />
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Temperatura</p>
                                    <p className="text-sm font-bold">{tempOk ? 'Estável' : 'Crítica!'}</p>
                                </div>
                            </div>

                            {tempoCiclo && (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-slate-700">
                                    <Clock size={18} />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Duração do Ciclo</p>
                                        <p className="text-sm font-bold">{tempoCiclo.toFixed(1)} Horas</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
                        <div className="flex items-center gap-2 text-meira-accent">
                            <Info size={18} />
                            <h4 className="font-bold text-xs uppercase tracking-widest">Dica de POP</h4>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            Nunca deixe a temperatura passar de 32°C. Use o sistema de resfriamento (serpentina ou chuva) se necessário.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-400 px-4">
                    Monitoramento das Dornas
                </h2>
                <DataTable
                    columns={[
                        { key: 'data_hora_inicio', label: 'Início', format: (v) => new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) },
                        { key: 'id_dorna', label: 'Dorna' },
                        { key: 'ph_inicial', label: 'pH Ini', format: (v) => <span className={v > 5 ? 'text-red-500 font-bold' : 'font-medium'}>{v}</span> },
                        { key: 'temperatura_maxima', label: 'T. Máx', format: (v) => `${v}°C` },
                        { key: 'brix_final_atenuacao', label: 'Brix Final', format: (v) => <span className="text-meira-accent font-bold">{v}°</span> },
                    ]}
                    data={records}
                    loading={tableLoading}
                    emptyMessage="Nenhuma fermentação em andamento"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default FermentacaoPage;
