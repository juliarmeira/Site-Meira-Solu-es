import React from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    Download
} from 'lucide-react';
import { LogoIcon } from '../ui/Icons';
import { servicesData, pillars } from "../../data/constants";

interface HomeViewProps {
    expandedService: number | null;
    setExpandedService: (index: number | null) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ expandedService, setExpandedService }) => {
    const toggleService = (index: number) => {
        setExpandedService(expandedService === index ? null : index);
    };

    return (
        <div className="space-y-32 pb-20">
            {/* HERO */}
            <section className="text-center space-y-10 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-meira-accent/30 bg-meira-accent/5 text-[10px] font-black text-meira-accent tracking-[0.4em] uppercase">
                    <LogoIcon className="w-4 h-4" /> ENGENHARIA QUÍMICA & AMBIENTAL
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-light tracking-tighter uppercase leading-[0.9] text-white">
                    REGULARIZAÇÃO DE <br />
                    <span className="font-bold text-meira-accent">ALAMBIQUES</span> E <br />
                    BEBIDAS.
                </h1>
                <p className="text-white/80 text-[13px] md:text-[15px] font-bold leading-relaxed uppercase tracking-[0.25em] max-w-3xl mx-auto">
                    FOCO TÉCNICO EM CONFORMIDADE MAPA, EXCELÊNCIA REGULATÓRIA E GESTÃO INTELIGENTE.
                </p>
                <div className="pt-8 flex justify-center">
                    <Link
                        to="/contato"
                        className="bg-meira-accent text-meira-dark px-14 py-5 rounded-full font-black text-[11px] tracking-[0.3em] uppercase hover:bg-meira-soft-white transition-colors"
                    >
                        ENTRE EM CONTATO
                    </Link>
                </div>
            </section>

            {/* MÉTODO - Metodologia de Trabalho */}
            <section className="py-24 border-y border-white/5">
                <div className="text-center space-y-4 mb-16">
                    <p className="text-[10px] font-black text-meira-accent tracking-[0.5em] uppercase">METODOLOGIA</p>
                    <h2 className="text-3xl md:text-4xl font-light uppercase tracking-tight text-white">
                        COMO <span className="font-black">TRABALHAMOS.</span>
                    </h2>
                </div>

                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-6">
                        {pillars.map((pillar, idx) => (
                            <div
                                key={idx}
                                className="group relative"
                            >
                                {/* Seta conectora (apenas desktop) */}
                                {idx < 4 && (
                                    <div className="hidden md:flex absolute top-6 left-[calc(50%+30px)] w-[calc(100%-60px)] items-center justify-center">
                                        <div className="w-full h-[1px] bg-gradient-to-r from-meira-accent/20 via-meira-accent/10 to-transparent" />
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center space-y-4">
                                    {/* Ícone */}
                                    <div className="w-12 h-12 rounded-xl bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center text-meira-accent group-hover:bg-meira-accent group-hover:text-meira-dark transition-all duration-300">
                                        {pillar.icon}
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="space-y-2">
                                        <h4 className="text-[11px] font-black tracking-[0.1em] uppercase text-white">
                                            {pillar.title}
                                        </h4>
                                        <p className="text-[9px] font-bold text-meira-accent/80 uppercase tracking-wide">
                                            {pillar.subtitle}
                                        </p>
                                        <p className="text-[10px] text-white/40 leading-relaxed max-w-[140px] mx-auto">
                                            {pillar.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVIÇOS */}
            <section className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-[11px] font-black text-meira-accent tracking-[0.5em] uppercase">SOLUÇÕES TÉCNICAS</h2>
                    <h3 className="text-3xl font-light uppercase tracking-tight text-white">NOSSAS <span className="font-bold">ESPECIALIDADES.</span></h3>
                </div>

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

                            <div className={`transition-all duration-500 ease-in-out ${expandedService === i ? 'max-h-[600px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'}`}>
                                <div className="p-8 space-y-8 bg-white/[0.01]">
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-meira-accent tracking-[0.4em] uppercase border-l-2 border-meira-accent pl-4">Escopo técnico</p>
                                        <p className="text-[13px] text-white/90 font-bold leading-relaxed uppercase tracking-widest">{s.summary}</p>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">RESULTADO TÉCNICO</p>
                                            <p className="text-[10px] text-meira-accent font-bold uppercase tracking-widest">{s.result}</p>
                                        </div>
                                        <Link to="/servicos" className="bg-white/10 text-white px-8 py-3 rounded-full font-black text-[9px] tracking-[0.3em] uppercase hover:bg-meira-accent hover:text-meira-dark transition-colors">VER DETALHES</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* DOWNLOAD BPF */}
            <section className="max-w-5xl mx-auto pb-32">
                <div className="glass-card rounded-[2rem] p-12 md:p-16 border-meira-accent/20 bg-gradient-to-br from-meira-accent/5 via-transparent to-transparent relative overflow-hidden group">
                    <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-[0.05] pointer-events-none">
                        <LogoIcon className="w-48 h-48" />
                    </div>
                    <div className="relative z-10 space-y-10">
                        <div className="space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-meira-accent/5 text-[9px] font-black text-meira-accent tracking-[0.5em] uppercase border border-meira-accent/10">CONTEÚDO TÉCNICO</div>
                            <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tight leading-[0.9] text-white">MANUAL DE <br /><span className="font-black text-meira-accent">BOAS PRÁTICAS.</span></h2>
                            <p className="text-white/70 text-[13px] font-bold max-w-xl leading-relaxed uppercase tracking-[0.15em]">SISTEMÁTICA HIGIÊNICO-SANITÁRIA PARA CONFORMIDADE MAPA E EXCELÊNCIA NAS OPERAÇÕES INDUSTRIAIS.</p>
                        </div>
                        <div className="flex justify-center md:justify-start">
                            <Link
                                to="/contato"
                                className="inline-flex items-center gap-5 bg-meira-soft-white text-meira-dark px-12 py-5 rounded-full font-black text-[11px] tracking-[0.4em] uppercase hover:bg-meira-accent transition-colors"
                            >
                                SOLICITAR ACESSO <Download size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomeView;
