import React from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Factory,
    ShieldCheck,
    Scale,
    AlertOctagon,
    Ban,
    DollarSign,
    Globe
} from 'lucide-react';

const RISKS_DATA = [
    {
        title: "Perda Patrimonial",
        description: "Em uma fiscalização, todo o estoque irregular é apreendido e destruído. O prejuízo de uma safra inteira pode ocorrer em uma única tarde.",
        icon: <Ban size={24} />
    },
    {
        title: "Multas Pesadas",
        description: "As autuações do MAPA são calculadas sobre o valor da produção e reincidência, podendo inviabilizar o negócio.",
        icon: <DollarSign size={24} />
    },
    {
        title: "Responsabilidade Criminal",
        description: "Produzir alimentos/bebidas sem registro é crime contra a saúde pública. O CPF do proprietário responde, não apenas o CNPJ.",
        icon: <AlertOctagon size={24} />
    },
    {
        title: "Barreira Comercial",
        description: "Você fica restrito à venda 'porta a porta'. Supermercados, empórios sérios e exportadores não compram produto sem registro.",
        icon: <Ban size={24} />
    }
];

const BENEFITS_DATA = [
    {
        title: "Acesso Livre ao Mercado",
        description: "Seu produto pode entrar em grandes redes de supermercados, restaurantes renomados e marketplaces online.",
        icon: <Globe size={24} />
    },
    {
        title: "Valorização da Marca",
        description: "O registro permite rotulagem correta, uso de termos como 'Premium', 'Envelhecida' e acesso a concursos de qualidade.",
        icon: <CheckCircle2 size={24} />
    },
    {
        title: "Segurança Jurídica",
        description: "Você dorme tranquilo, sabendo que sua operação segue as normas da IN 72/2018 e do Decreto 6.871/2009.",
        icon: <ShieldCheck size={24} />
    },
    {
        title: "Exportação",
        description: "O primeiro passo para vender em Dólar ou Euro é ter o dever de casa feito no Brasil.",
        icon: <Factory size={24} />
    }
];

const REQUIRED_ENTITIES = [
    { l: "Produtor", d: "Quem efetivamente fabrica (fermenta, destila, macera)." },
    { l: "Padronizador", d: "Quem faz blends, filtra ou ajusta teor alcoólico." },
    { l: "Engarrafador", d: "Quem apenas envasa a bebida." },
    { l: "Atacadista", d: "Quem armazena e distribui (revende)." },
    { l: "Importador e Exportador", d: "Comércio internacional." }
];

const METHOD_STEPS = [
    { title: "Adequação da Planta", desc: "Ajuste de layout e fluxo lógico." },
    { title: "Documentação Técnica", desc: "Elaboração de Manual BPF, POPs e Memoriais." },
    { title: "Análises Laboratoriais", desc: "Laudos de potabilidade e conformidade (PIQ)." },
    { title: "Responsabilidade Técnica", desc: "Assinamos a ART e acompanhamos a vistoria." }
];

const RegularizationSection: React.FC = () => {
    return (
        <section id="regularizacao" className="py-24 relative overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-24 px-6 md:px-0">
                {/* Header */}
                <div className="space-y-6 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-meira-accent/20 bg-meira-accent/5 text-[10px] font-black text-meira-accent tracking-[0.3em] uppercase">
                        <Scale size={12} /> CONFORMIDADE LEGAL
                    </div>
                    <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tight text-white leading-[0.9]">
                        REGULARIZAÇÃO DE BEBIDAS: <br />
                        <span className="font-bold text-meira-accent">O QUE É E POR QUE FAZER?</span>
                    </h2>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                        O registro no MAPA (Ministério da Agricultura e Pecuária) é a certidão de nascimento da sua bebida.
                        Sem ele, perante a lei e o mercado, o seu produto não existe.
                        Regularizar é sair da defensiva para o ataque.
                    </p>
                </div>

                {/* Risks vs Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 relative">
                    {/* Divider Line */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent transform -translate-x-1/2" />

                    {/* Risks Column */}
                    <div className="space-y-12">
                        <div className="text-center md:text-right space-y-2">
                            <div className="inline-flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-xs">
                                <AlertTriangle size={14} /> Os Riscos da Informalidade
                            </div>
                            <h3 className="text-2xl font-light text-white uppercase">Operar na <span className="font-bold text-red-400">Clandestinidade</span></h3>
                        </div>
                        <div className="space-y-6">
                            {RISKS_DATA.map((item, i) => (
                                <div key={i} className="group relative bg-red-900/[0.05] border border-red-500/10 p-6 rounded-2xl hover:bg-red-900/10 hover:border-red-500/30 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-right md:flex-row-reverse">
                                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h4 className="text-white font-bold uppercase tracking-wide text-sm group-hover:text-red-300 transition-colors">{item.title}</h4>
                                            <p className="text-white/50 text-xs leading-relaxed group-hover:text-white/70 transition-colors">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Benefits Column */}
                    <div className="space-y-12">
                        <div className="text-center md:text-left space-y-2">
                            <div className="inline-flex items-center gap-2 text-meira-accent font-bold uppercase tracking-widest text-xs">
                                <CheckCircle2 size={14} /> Os Benefícios da Regularização
                            </div>
                            <h3 className="text-2xl font-light text-white uppercase">Operar com <span className="font-bold text-meira-accent">Segurança</span></h3>
                        </div>
                        <div className="space-y-6">
                            {BENEFITS_DATA.map((item, i) => (
                                <div key={i} className="group relative bg-meira-accent/[0.02] border border-meira-accent/10 p-6 rounded-2xl hover:bg-meira-accent/[0.05] hover:border-meira-accent/30 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                                        <div className="p-3 bg-meira-accent/10 rounded-xl text-meira-accent group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h4 className="text-white font-bold uppercase tracking-wide text-sm group-hover:text-meira-accent transition-colors">{item.title}</h4>
                                            <p className="text-white/50 text-xs leading-relaxed group-hover:text-white/70 transition-colors">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Who needs needed & Process */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Who needs it */}
                    <div className="glass-card p-10 rounded-[2.5rem] space-y-8 border-white/5 bg-white/[0.02]">
                        <div className="space-y-4">
                            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                                <AlertTriangle className="text-meira-accent" size={24} />
                                Quem é obrigado?
                            </h3>
                            <p className="text-white/60 text-sm">Se o seu negócio realiza qualquer uma das atividades abaixo, o registro é mandatório:</p>
                        </div>
                        <ul className="space-y-4">
                            {REQUIRED_ENTITIES.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-white/80 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-meira-accent mt-2 shrink-0" />
                                    <span>
                                        <strong className="text-meira-accent font-bold uppercase tracking-wide text-xs">{item.l}:</strong> <br />
                                        <span className="text-white/50">{item.d}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Method Meira */}
                    <div className="glass-card p-10 rounded-[2.5rem] space-y-8 border-meira-accent/20 bg-gradient-to-br from-meira-accent/[0.05] to-transparent">
                        <div className="space-y-4">
                            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                                <ShieldCheck className="text-meira-accent" size={24} />
                                O Método Meira
                            </h3>
                            <p className="text-white/60 text-sm">O sistema do MAPA (SIPEAGRO) exige comprovação técnica. Nós conduzimos em 4 etapas:</p>
                        </div>

                        <div className="space-y-4">
                            {METHOD_STEPS.map((step, i) => (
                                <div key={i} className="flex items-center gap-4 bg-meira-accent/[0.05] p-4 rounded-xl border border-meira-accent/10">
                                    <div className="w-8 h-8 rounded-full bg-meira-accent text-meira-dark flex items-center justify-center font-black text-xs shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wide text-white">{step.title}</h4>
                                        <p className="text-[10px] uppercase text-meira-accent font-bold tracking-wider">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center space-y-8 py-8 border-t border-white/5">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-light uppercase text-white">
                            Não corra <span className="font-bold text-red-400">Riscos Desnecessários.</span>
                        </h3>
                        <p className="text-white/50 text-sm uppercase tracking-widest max-w-xl mx-auto">
                            Se você quer profissionalizar sua produção, a Meira Soluções é sua parceira.
                        </p>
                    </div>
                    <a
                        href="https://wa.me/5519999896901?text=Ol%C3%A1,%20quero%20regularizar%20meu%20estabelecimento!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-meira-accent text-meira-dark px-10 py-4 rounded-full font-black text-xs tracking-[0.3em] uppercase hover:bg-white transition-all hover:scale-105"
                    >
                        Fale com a Engenheira <CheckCircle2 size={16} />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default RegularizationSection;
