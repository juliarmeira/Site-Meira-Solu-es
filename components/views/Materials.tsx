import React, { useState } from 'react';
import { Download, FileText, ChevronDown } from 'lucide-react';

interface MaterialItem {
    id: string;
    title: string;
    description: string;
    downloadUrl: string;
}

const materials: MaterialItem[] = [
    {
        id: 'bpf',
        title: 'Manual de BPF',
        description: 'Boas Práticas de Fabricação para produção de bebidas. Procedimentos, requisitos e orientações conforme IN 05/2000 MAPA e RDC 275 ANVISA.',
        downloadUrl: '/manual_bpf.pdf'
    }
];

const MaterialPill: React.FC<{ material: MaterialItem }> = ({ material }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all">
            {/* Header - sempre visível */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-meira-accent/10 border border-meira-accent/20 flex items-center justify-center text-meira-accent">
                        <FileText size={18} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tight text-white group-hover:text-meira-accent transition-colors">
                        {material.title}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={`text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-meira-accent' : ''}`}
                />
            </button>

            {/* Conteúdo expandível */}
            <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-5 space-y-4">
                        <p className="text-white/50 text-[11px] leading-relaxed">
                            {material.description}
                        </p>
                        <a
                            href={material.downloadUrl}
                            download
                            className="inline-flex items-center gap-3 bg-meira-accent text-meira-dark px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-meira-soft-white transition-colors"
                        >
                            <Download size={14} />
                            Baixar PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MaterialsView: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-20">
            <header className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-light uppercase tracking-tight text-white leading-none">
                    DOCS & <span className="font-bold text-meira-accent">MATERIAIS.</span>
                </h1>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                    Recursos técnicos para download
                </p>
            </header>

            <div className="space-y-3">
                {materials.map((material) => (
                    <MaterialPill key={material.id} material={material} />
                ))}
            </div>

            <p className="text-center text-white/25 text-[9px] uppercase tracking-widest">
                Material de apoio técnico. Consulte um especialista para adequação.
            </p>
        </div>
    );
};

export default MaterialsView;
