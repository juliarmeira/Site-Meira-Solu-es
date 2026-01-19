import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowUpRight,
    CheckCircle2,
    ChevronDown
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
        <div className="space-y-24 pb-20">
            <header className="text-center max-w-4xl mx-auto space-y-10">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-light tracking-tight uppercase leading-none text-white">
                        SERVIÇOS & <br /> <span className="font-bold text-meira-accent">ENTREGAS TÉCNICAS.</span>
                    </h1>
                    <p className="text-meira-accent text-[10px] md:text-[11px] font-black tracking-[0.4em] uppercase opacity-80">
                        Engenharia · Regulação · Dados · Tecnologia Aplicada
                    </p>
                </div>
                <p className="text-white/70 text-[13px] md:text-[14px] font-bold leading-relaxed uppercase tracking-widest text-center px-4 max-w-2xl mx-auto">
                    ESTRUTURAÇÃO TÉCNICA, REGULATÓRIA E DIGITAL DE EMPREENDIMENTOS, INTEGRANDO CIÊNCIA E OPERAÇÃO.
                </p>
            </header>

            <div className="max-w-4xl mx-auto space-y-4">
                {servicesData.map((s, i) => (
                    <div key={i} className={`glass-card rounded-[1.5rem] border-white/5 transition-all overflow-hidden ${expandedService === i ? 'border-meira-accent/20 bg-white/[0.04]' : 'hover:border-white/10'}`}>
                        <button
                            onClick={() => toggleService(i)}
                            className="w-full px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-6 text-left group"
                        >
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${expandedService === i ? 'bg-meira-accent text-meira-dark' : 'bg-white/5 text-meira-accent group-hover:scale-105'}`}>
                                    {s.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-meira-accent transition-colors leading-none">{s.title}</h3>
                                    <p className={`text-[8px] font-black tracking-[0.25em] uppercase transition-colors ${expandedService === i ? 'text-meira-accent' : 'text-white/30'}`}>
                                        {s.slogan}
                                    </p>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all ${expandedService === i ? 'rotate-180 bg-meira-accent/10 text-meira-accent' : 'text-white/20'}`}>
                                <ChevronDown size={16} />
                            </div>
                        </button>

                        <div className={`transition-all duration-500 ease-in-out ${expandedService === i ? 'max-h-[1200px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'}`}>
                            <div className="p-8 lg:p-12 space-y-12 bg-white/[0.01]">
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-meira-accent tracking-[0.4em] uppercase border-l-2 border-meira-accent pl-4">Escopo técnico</p>
                                            <p className="text-[13px] text-white/90 font-bold leading-relaxed uppercase tracking-widest">{s.summary}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-meira-accent tracking-[0.4em] uppercase border-l-2 border-meira-accent pl-4">Resultado técnico</p>
                                            <div className="p-5 bg-meira-accent/5 rounded-2xl border border-meira-accent/10">
                                                <p className="text-[11px] text-meira-accent font-black uppercase tracking-widest leading-relaxed">{s.result}</p>
                                            </div>
                                        </div>
                                        <Link to="/contato" className="inline-flex items-center gap-4 bg-meira-soft-white text-meira-dark px-10 py-5 rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:bg-meira-accent transition-colors">REQUISITAR AGORA <ArrowUpRight size={16} /></Link>
                                    </div>
                                    <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 space-y-6">
                                        <p className="text-[9px] font-black text-white/30 tracking-[0.4em] uppercase">Entregas técnicas / Serviços</p>
                                        <ul className="space-y-4">
                                            {s.includes.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 group/li">
                                                    <CheckCircle2 size={16} className="text-meira-accent shrink-0 mt-0.5" />
                                                    <span className="text-[11px] text-white/70 font-bold uppercase tracking-widest leading-relaxed group-hover/li:text-white transition-colors">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
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
