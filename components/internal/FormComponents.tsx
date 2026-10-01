import React from 'react';
import { Plus, Loader2, AlertCircle, Info } from 'lucide-react';

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
    error?: string;
    info?: string;
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
    error,
    info,
}) => {
    const baseInputClasses = `w-full bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200'} rounded-2xl py-4 px-5 text-[14px] font-medium text-slate-700 outline-none focus:border-meira-accent focus:bg-white transition-all placeholder:text-slate-300 disabled:opacity-50 shadow-sm`;

    if (type === 'checkbox') {
        return (
            <label className="flex items-center gap-4 cursor-pointer group p-2">
                <div className={`w-6 h-6 rounded-xl border-2 ${value ? 'bg-meira-accent border-meira-accent' : 'bg-white border-slate-200'} flex items-center justify-center transition-all shadow-sm`}>
                    {value && (
                        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                            <path d="M1.5 6L5.5 10L12.5 1.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
                <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {label}
                </span>
            </label>
        );
    }

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-slate-400">
                    {label}
                    {required && <span className="text-red-400">*</span>}
                </label>
                {info && (
                    <div className="group relative">
                        <Info size={14} className="text-slate-300 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {info}
                        </div>
                    </div>
                )}
            </div>
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
                        <option value="">{placeholder || 'Selecione uma opção...'}</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value as string | number}
                        onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
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
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-extrabold text-slate-300">
                        {suffix}
                    </span>
                )}
                {type === 'select' && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                            <path d="M1 1L6 7L11 1" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>
            {error && (
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 mt-1 px-1">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
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
    footerContent?: React.ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = ({
    title,
    subtitle,
    children,
    onSubmit,
    loading = false,
    submitLabel = 'Salvar Registro',
    footerContent,
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-slate-900 font-extrabold text-2xl tracking-tight">{title}</h3>
                    {subtitle && <p className="text-slate-400 text-[13px] mt-2 font-medium">{subtitle}</p>}
                </div>
                <div className="p-8 lg:p-10 space-y-8">
                    {children}
                </div>
                <div className="p-8 lg:p-10 pt-0 flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-meira-accent text-white py-5 rounded-[1.5rem] font-bold text-[13px] tracking-widest uppercase flex items-center justify-center gap-3 hover:brightness-105 transition-all shadow-lg shadow-meira-accent/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                {submitLabel}
                            </>
                        )}
                    </button>
                    {footerContent}
                </div>
            </div>
        </form>
    );
};

interface DataTableProps {
    columns: { key: string; label: string; format?: (value: any) => React.ReactNode };
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
            <div className="flex items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100">
                <Loader2 size={32} className="animate-spin text-meira-accent" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-20 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white">
                <p className="text-slate-300 font-bold text-sm tracking-widest uppercase">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/20">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-6 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {onDelete && <th className="px-6 py-5 w-20" />}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((row, idx) => (
                            <tr key={row.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-5 text-[14px] font-medium text-slate-600">
                                        {col.format ? col.format(row[col.key]) : row[col.key]}
                                    </td>
                                ))}
                                {onDelete && (
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => onDelete(row.id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all text-[10px] font-extrabold uppercase tracking-widest p-2 hover:bg-red-50 rounded-lg"
                                        >
                                            Deletar
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12 animate-in fade-in duration-700 slide-in-from-left-4">
        {icon && (
            <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center text-meira-accent">
                {React.cloneElement(icon as React.ReactElement, { size: 32 })}
            </div>
        )}
        <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-slate-400 text-sm font-semibold tracking-wide">{subtitle}</p>}
        </div>
    </div>
);
