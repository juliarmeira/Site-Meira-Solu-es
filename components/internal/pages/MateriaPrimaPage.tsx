import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Wheat } from 'lucide-react';
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
        volume_caldo_litros: '',
        brix_original: '',
        volume_agua_litros: '',
        brix_final_mosto: '',
        observacoes: '',
    });

    useEffect(() => {
        loadRecords();
    }, [user]);

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
            volume_caldo_litros: parseFloat(form.volume_caldo_litros as string),
            brix_original: parseFloat(form.brix_original as string),
            volume_agua_litros: parseFloat(form.volume_agua_litros as string) || 0,
            brix_final_mosto: parseFloat(form.brix_final_mosto as string),
            observacoes: form.observacoes || null,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar registro. Tente novamente.' });
        } else {
            setMessage({ type: 'success', text: 'Registro salvo com sucesso!' });
            setForm({
                data_hora_corte: '',
                data_hora_moagem: '',
                id_talhao: '',
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

        const { error } = await supabase
            .from('controle_materia_prima')
            .delete()
            .eq('id', id);

        if (!error) {
            setRecords(records.filter(r => r.id !== id));
        }
    };

    // Calculate tempo de espera
    const tempoEspera = form.data_hora_corte && form.data_hora_moagem
        ? Math.round((new Date(form.data_hora_moagem).getTime() - new Date(form.data_hora_corte).getTime()) / 60000)
        : null;

    const columns = [
        { key: 'data_hora_moagem', label: 'Data Moagem', format: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
        { key: 'id_talhao', label: 'Talhão' },
        { key: 'volume_caldo_litros', label: 'Volume (L)', format: (v: number) => `${v}L` },
        { key: 'brix_original', label: 'Brix Original', format: (v: number) => `${v}°` },
        { key: 'brix_final_mosto', label: 'Brix Final', format: (v: number) => `${v}°` },
    ];

    return (
        <div className="max-w-4xl space-y-8">
            <PageHeader
                title="Controle de Matéria-Prima"
                subtitle="Registro de corte e moagem da cana"
                icon={<Wheat size={24} />}
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
                subtitle="Preencha os dados da moagem"
                onSubmit={handleSubmit}
                loading={loading}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    />
                </div>

                {tempoEspera !== null && (
                    <div className="p-4 rounded-xl bg-meira-accent/10 border border-meira-accent/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-meira-accent/70">Tempo de Espera</p>
                        <p className="text-2xl font-bold text-meira-accent">
                            {Math.floor(tempoEspera / 60)}h {tempoEspera % 60}min
                        </p>
                    </div>
                )}

                <FormField
                    label="ID do Talhão"
                    type="text"
                    value={form.id_talhao}
                    onChange={(v) => setForm({ ...form, id_talhao: v })}
                    placeholder="Ex: T-001"
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Volume de Caldo Extraído"
                        type="number"
                        value={form.volume_caldo_litros}
                        onChange={(v) => setForm({ ...form, volume_caldo_litros: v })}
                        placeholder="0.00"
                        suffix="L"
                        min={0}
                        step={0.1}
                        required
                    />
                    <FormField
                        label="Brix Original da Cana"
                        type="number"
                        value={form.brix_original}
                        onChange={(v) => setForm({ ...form, brix_original: v })}
                        placeholder="0.0"
                        suffix="°Bx"
                        min={0}
                        max={30}
                        step={0.1}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        label="Volume de Água Adicionado"
                        type="number"
                        value={form.volume_agua_litros}
                        onChange={(v) => setForm({ ...form, volume_agua_litros: v })}
                        placeholder="0.00"
                        suffix="L"
                        min={0}
                        step={0.1}
                    />
                    <FormField
                        label="Brix Final do Mosto"
                        type="number"
                        value={form.brix_final_mosto}
                        onChange={(v) => setForm({ ...form, brix_final_mosto: v })}
                        placeholder="0.0"
                        suffix="°Bx"
                        min={0}
                        max={30}
                        step={0.1}
                        required
                    />
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
                    emptyMessage="Nenhum registro de matéria-prima"
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default MateriaPrimaPage;
