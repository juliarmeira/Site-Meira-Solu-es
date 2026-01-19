import React from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface FormFieldProps {
    label: string;
    type?: 'text' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'checkbox';
    value: string | number | boolean;
    onChange: (value: any) => void;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    options = [],
    min,
    max,
    step,
    suffix,
    disabled = false,
}) => {
    const baseInputClasses = `w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-[12px] font-medium text-white outline-none focus:border-meira-accent/40 focus:bg-white/[0.08] transition-all placeholder:text-white/30 disabled:opacity-50`;

    if (type === 'checkbox') {
        return (
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-lg border ${value ? 'bg-meira-accent border-meira-accent' : 'bg-white/5 border-white/20'} flex items-center justify-center transition-all`}>
                    {value && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                            <path d="M1 5L4.5 8.5L11 1" stroke="#151e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                    disabled={disabled}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white transition-colors">
                    {label}
                </span>
            </label>
        );
    }

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {label}
                {required && <span className="text-meira-accent">*</span>}
            </label>
            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        value={value as string}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        rows={3}
                        className={`${baseInputClasses} resize-none`}
                    />
                ) : type === 'select' ? (
                    <select
                        value={value as string}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        disabled={disabled}
                        className={`${baseInputClasses} appearance-none cursor-pointer`}
                    >
                        <option value="" className="bg-meira-dark">{placeholder || 'Selecione...'}</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-meira-dark">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value as string | number}
                        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        min={min}
                        max={max}
                        step={step}
                        className={baseInputClasses}
                    />
                )}
                {suffix && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/30">
                        {suffix}
                    </span>
                )}
                {type === 'select' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

interface FormContainerProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
    submitLabel?: string;
}

export const FormContainer: React.FC<FormContainerProps> = ({
    title,
    subtitle,
    children,
    onSubmit,
    loading = false,
    submitLabel = 'Salvar Registro',
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    {subtitle && <p className="text-white/40 text-[11px] mt-1">{subtitle}</p>}
                </div>
                <div className="p-6 space-y-5">
                    {children}
                </div>
                <div className="p-6 pt-0">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-meira-accent text-meira-dark py-4 rounded-xl font-bold text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-meira-soft-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                {submitLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

interface DataTableProps {
    columns: { key: string; label: string; format?: (value: any) => string }[];
    data: any[];
    loading?: boolean;
    emptyMessage?: string;
    onDelete?: (id: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
    columns,
    data,
    loading = false,
    emptyMessage = 'Nenhum registro encontrado',
    onDelete,
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-meira-accent" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
                <p className="text-white/30 text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-white/40"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {onDelete && <th className="px-4 py-3 w-16" />}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={row.id || idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-4 text-[12px] text-white/70">
                                        {col.format ? col.format(row[col.key]) : row[col.key]}
                                    </td>
                                ))}
                                {onDelete && (
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => onDelete(row.id)}
                                            className="text-white/30 hover:text-red-400 transition-colors text-[10px] font-bold uppercase"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon }) => (
    <div className="flex items-center gap-4 mb-8">
        {icon && (
            <div className="w-12 h-12 rounded-xl bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center text-meira-accent">
                {icon}
            </div>
        )}
        <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/40 text-[11px]">{subtitle}</p>}
        </div>
    </div>
);
