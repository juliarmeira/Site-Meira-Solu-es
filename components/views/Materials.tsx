import React from 'react';
import { Download, FileText, BookOpen } from 'lucide-react';

const MaterialsView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-20 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-light uppercase tracking-tight text-white leading-none">DOCS & <span className="font-bold text-meira-accent">MATERIAIS.</span></h1>
                <p className="text-white/60 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">RECURSOS PARA A GESTÃO TÉCNICA E OPERACIONAL.</p>
            </header>

            <section className="glass-card rounded-[2rem] p-10 md:p-16 border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-all duration-500 pointer-events-none">
                    <BookOpen size={200} />
                </div>

                <div className="flex items-center gap-5 mb-12 relative z-10">
                    <div className="w-12 h-12 bg-meira-accent/5 rounded-xl flex items-center justify-center text-meira-accent border border-meira-accent/20"><FileText size={22} /></div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white/90">MANUAL DE BPF</h2>
                </div>

                <div className="space-y-8 relative z-10">
                    <p className="text-white/60 text-sm leading-relaxed">
                        As Boas Práticas de Fabricação (BPF) são essenciais para garantir a qualidade e segurança na produção de bebidas.
                        Este manual técnico apresenta os procedimentos, requisitos e orientações para implementação em sua operação.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.25em]">CONTEÚDO</p>
                            <ul className="text-white/60 text-xs space-y-1">
                                <li>• Estrutura documental</li>
                                <li>• Procedimentos operacionais</li>
                                <li>• Controle de qualidade</li>
                                <li>• Higiene e sanitização</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.25em]">NORMATIVAS</p>
                            <ul className="text-white/60 text-xs space-y-1">
                                <li>• IN 05/2000 MAPA</li>
                                <li>• RDC 275 ANVISA</li>
                                <li>• IN 60/2019 MAPA</li>
                                <li>• Portaria 326 MS</li>
                            </ul>
                        </div>
                    </div>

                    <a
                        href="/manual_bpf.pdf"
                        download
                        className="w-full flex items-center justify-center gap-4 bg-meira-accent text-meira-dark font-black uppercase tracking-widest text-sm py-5 px-8 rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-meira-accent/20"
                    >
                        <Download size={20} />
                        BAIXAR MANUAL DE BPF
                    </a>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic">
                        Material técnico de apoio. Consulte um especialista para adequação específica à sua operação.
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MaterialsView;
