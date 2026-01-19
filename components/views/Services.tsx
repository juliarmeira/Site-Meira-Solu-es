import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Target
} from 'lucide-react';
import { servicesData } from "../../data/constants";

interface ServicesViewProps {
    expandedService: number | null;
    setExpandedService: (index: number | null) => void;
}

const ServicesView: React.FC<ServicesViewProps> = ({ expandedService, setExpandedService }) => {
    const toggleService = (index: number) => {
        setExpandedService(expandedService === index ? null : index);
    };

    return (
        <div className="space-y-16 pb-20">
            <header className="text-center max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl md:text-5xl font-light tracking-tight uppercase leading-none text-white">
                    SERVIÇOS & <span className="font-bold text-meira-accent">ENTREGAS.</span>
                </h1>
                <p className="text-white/50 text-[11px] font-bold leading-relaxed max-w-xl mx-auto">
                    Estruturação técnica, regulatória e digital de empreendimentos, integrando ciência e operação.
                </p>
            </header>

            <div className="max-w-3xl mx-auto space-y-3">
                {servicesData.map((s, i) => (
                    <div
                        key={i}
                        className={`rounded-2xl border transition-all overflow-hidden ${expandedService === i
                                ? 'border-meira-accent/20 bg-white/[0.03]'
                                : 'border-white/5 hover:border-white/10 bg-white/[0.01]'
                            }`}
                    >
                        {/* Header */}
                        <button
                            onClick={() => toggleService(i)}
                            className="w-full px-6 py-5 flex items-center justify-between gap-4 group"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${expandedService === i
                                        ? 'bg-meira-accent text-meira-dark'
                                        : 'bg-meira-accent/10 text-meira-accent border border-meira-accent/20'
                                    }`}>
                                    {s.icon}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-base font-bold uppercase tracking-tight group-hover:text-meira-accent transition-colors">
                                        {s.title}
                                    </h3>
                                    <p className={`text-[8px] font-bold tracking-widest uppercase mt-0.5 ${expandedService === i ? 'text-meira-accent/80' : 'text-white/30'
                                        }`}>
                                        {s.slogan}
                                    </p>
                                </div>
                            </div>
                            <ChevronDown
                                size={18}
                                className={`transition-all duration-300 ${expandedService === i ? 'rotate-180 text-meira-accent' : 'text-white/20'
                                    }`}
                            />
                        </button>

                        {/* Conteúdo Expandido - Layout Vertical Organizado */}
                        <div className={`grid transition-all duration-400 ${expandedService === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}>
                            <div className="overflow-hidden">
                                <div className="px-6 pb-6 space-y-5 border-t border-white/5 pt-5">

                                    {/* Descrição */}
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        {s.summary}
                                    </p>

                                    {/* Entregas em grid de tags */}
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-bold text-meira-accent/60 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 size={12} />
                                            O que inclui
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {s.includes.map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[10px] text-white/60 font-medium hover:border-meira-accent/20 hover:text-white/80 transition-colors cursor-default"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resultado + CTA */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                                        <div className="flex items-start gap-3">
                                            <Target size={16} className="text-meira-accent shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Resultado</p>
                                                <p className="text-[11px] text-meira-accent font-medium mt-0.5">{s.result}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/contato"
                                            className="inline-flex items-center justify-center gap-2 bg-meira-accent text-meira-dark px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-meira-soft-white transition-colors shrink-0"
                                        >
                                            Solicitar
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesView;
