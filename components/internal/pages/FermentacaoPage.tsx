import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { FlaskConical } from 'lucide-react';
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
            ph_inicial: parseFloat(form.ph_inicial as string),
            ph_final: form.ph_final ? parseFloat(form.ph_final as string) : null,
            temperatura_maxima: form.temperatura_maxima ? parseFloat(form.temperatura_maxima as string) : null,
            brix_final_atenuacao: form.brix_final_atenuacao ? parseFloat(form.brix_final_atenuacao as string) : null,
            nutrientes_fermentos: form.nutrientes_fermentos || null,
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar registro. Tente novamente.' });
        } else {
            setMessage({ type: 'success', text: 'Registro salvo com sucesso!' });
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
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        const { error } = await supabase
            .from('controle_fermentacao')
            .delete()
            .eq('id', id);

        if (!error) {
            setRecords(records.filter(r => r.id !== id));
        }
    };

    // Calculate cycle time
    const tempoCiclo = form.data_hora_inicio && form.data_hora_termino
        ? Math.round((new Date(form.data_hora_termino).getTime() - new Date(form.data_hora_inicio).getTime()) / 3600000 * 10) / 10
        : null;

    const columns = [
        { key: 'data_hora_inicio', label: 'Início', format: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
        { key: 'id_dorna', label: 'Dorna' },
        { key: 'ph_inicial', label: 'pH Inicial' },
        { key: 'ph_final', label: 'pH Final', format: (v: number | null) => v ? v.toString() : '-' },
        { key: 'temperatura_maxima', label: 'Temp. Máx', format: (v: number | null) => v ? `${v}°C` : '-' },
        { key: 'brix_final_atenuacao', label: 'Brix Final', format: (v: number | null) => v !== null ? `${v}°` : '-' },
    ];

    return (
        <div className="max-w-4xl space-y-8">
            <PageHeader
                title="Controle de Fermentação"
                subtitle="Monitoramento do processo fermentativo"
                icon={<FlaskConical size={24} />}
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
                subtitle="Preencha os dados da fermentação"
                onSubmit={handleSubmit}
                loading={loading}
            >
                <FormField
                    label="ID da Dorna"
                    type="text"
                    value={form.id_dorna}
                    onChange={(v) => setForm({ ...form, id_dorna: v })}
                    placeholder="Ex: D-001"
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Data/Hora Início"
                        type="datetime-local"
                        value={form.data_hora_inicio}
                        onChange={(v) => setForm({ ...form, data_hora_inicio: v })}
                        required
                    />
                    <FormField
                        label="Data/Hora Término"
                        type="datetime-local"
                        value={form.data_hora_termino}
                        onChange={(v) => setForm({ ...form, data_hora_termino: v })}
                    />
                </div>

                {tempoCiclo !== null && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/70">Tempo de Ciclo</p>
                        <p className="text-2xl font-bold text-blue-400">{tempoCiclo}h</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="pH Inicial"
                        type="number"
                        value={form.ph_inicial}
                        onChange={(v) => setForm({ ...form, ph_inicial: v })}
                        placeholder="0.00"
                        min={0}
                        max={14}
                        step={0.01}
                        required
                    />
                    <FormField
                        label="pH Final"
                        type="number"
                        value={form.ph_final}
                        onChange={(v) => setForm({ ...form, ph_final: v })}
                        placeholder="0.00"
                        min={0}
                        max={14}
                        step={0.01}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Temperatura Máxima"
                        type="number"
                        value={form.temperatura_maxima}
                        onChange={(v) => setForm({ ...form, temperatura_maxima: v })}
                        placeholder="0.0"
                        suffix="°C"
                        min={0}
                        max={50}
                        step={0.1}
                    />
                    <FormField
                        label="Brix Final (Atenuação)"
                        type="number"
                        value={form.brix_final_atenuacao}
                        onChange={(v) => setForm({ ...form, brix_final_atenuacao: v })}
                        placeholder="0.0"
                        suffix="°Bx"
                        min={0}
                        max={30}
                        step={0.1}
                    />
                </div>

                <FormField
                    label="Nutrientes/Fermentos Utilizados"
                    type="textarea"
                    value={form.nutrientes_fermentos}
                    onChange={(v) => setForm({ ...form, nutrientes_fermentos: v })}
                    placeholder="Descreva os insumos utilizados..."
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
                    emptyMessage="Nenhum registro de fermentação"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default FermentacaoPage;
