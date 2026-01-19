import React from 'react';
import { Link } from 'react-router-dom';
import {
    Instagram,
    Mail,
    Globe,
    Phone,
    MapPin,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { LogoIcon } from '../ui/Icons';

const LinkCard = ({
    title,
    subtitle,
    href,
    icon: Icon
}: {
    title: string;
    subtitle: string;
    href: string;
    icon: any
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-meira-deep p-6 rounded-[2rem] flex items-center gap-6 text-left mb-4 group ring-1 ring-white/5 shadow-xl hover:scale-[1.02] transition-all"
    >
        <div className="bg-meira-accent p-4 rounded-2xl text-meira-dark group-hover:scale-110 transition-transform shadow-lg shadow-meira-accent/20">
            <Icon size={24} />
        </div>
        <div className="flex flex-col">
            <h3 className="text-white font-bold text-lg uppercase leading-tight tracking-tight">{title}</h3>
            <p className="text-meira-accent/90 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">{subtitle}</p>
        </div>
    </a >
);

const LinkTreeView: React.FC = () => {
    const services = [
        "MAPA / SIPEAGRO",
        "BPF & POPs",
        "Regularização Ambiental",
        "Projetos e Layout Industrial"
    ];

    return (
        <div className="min-h-screen flex flex-col items-center py-10 px-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
            {/* Back Button */}
            <Link
                to="/"
                className="absolute left-6 top-6 flex items-center gap-2 text-meira-deep/50 hover:text-meira-deep font-black text-[10px] uppercase tracking-widest transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Voltar
            </Link>
            {/* Header Section */}
            <header className="flex flex-col items-center text-center mb-12 w-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-8 group hover:scale-105 transition-transform duration-500 border border-slate-100">
                    <LogoIcon className="w-20 h-20" />
                </div>

                <div className="space-y-4 mb-10 text-center">
                    <h1 className="text-4xl tracking-tighter text-meira-deep flex items-center justify-center gap-1">
                        <span className="font-bold">MEIRA</span>
                        <span className="font-light opacity-80">SOLUÇÕES</span>
                    </h1>
                    <div className="space-y-3">
                        <p className="font-black text-[12px] tracking-[0.3em] uppercase text-meira-accent">
                            REGULARIZAÇÃO DE ALAMBIQUES E BEBIDAS
                        </p>
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-meira-deep text-white">
                            <LogoIcon className="w-4 h-4" />
                            <span className="font-bold text-[9px] tracking-[0.3em] uppercase">
                                Engenharia Química & Ambiental
                            </span>
                        </div>
                    </div>
                </div>

                {/* Services Grid (Mini Chips) */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 bg-white/80 border border-slate-100 px-5 py-4 rounded-3xl shadow-sm hover:border-meira-accent/30 transition-colors"
                        >
                            <CheckCircle2 size={16} className="text-meira-deep opacity-40 shrink-0" />
                            <span className="text-[9px] font-black text-meira-deep/80 uppercase tracking-tight leading-tight">
                                {service}
                            </span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Links Section */}
            <main className="w-full space-y-2">
                <LinkCard
                    title="WhatsApp"
                    subtitle="Fale Comigo"
                    href="https://w.app/solucoesmeira"
                    icon={Phone}
                />
                <LinkCard
                    title="Instagram"
                    subtitle="Me acompanhe"
                    href="https://www.instagram.com/solucoesmeira/"
                    icon={Instagram}
                />
                <LinkCard
                    title="E-mail"
                    subtitle="Me mande um e-mail"
                    href="mailto:juliareismeira@gmail.com"
                    icon={Mail}
                />
                <Link
                    to="/"
                    className="w-full bg-meira-deep p-6 rounded-[2rem] flex items-center gap-6 text-left mb-4 group ring-1 ring-white/5 shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                >
                    <div className="bg-meira-accent p-4 rounded-2xl text-meira-dark group-hover:scale-110 transition-transform shadow-lg shadow-meira-accent/20">
                        <Globe size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-white font-bold text-lg uppercase leading-tight tracking-tight">Site Oficial</h3>
                        <p className="text-meira-accent/90 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">Conheça meu trabalho</p>
                    </div>
                </Link>
            </main>

            {/* Footer Section */}
            <footer className="mt-16 text-center space-y-8">
                <div className="flex items-center justify-center gap-3 text-meira-deep font-black text-[10px] uppercase tracking-[0.5em] py-4 px-8 rounded-full border border-meira-deep/5 bg-meira-deep/[0.02]">
                    <MapPin size={14} className="text-meira-deep" />
                    ANDRADAS MG
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
                        © 2026 Meira Soluções
                    </p>
                    <p className="text-[8px] text-slate-300 font-bold tracking-[0.1em] uppercase">
                        Engenharia & Regulação em Alta Performance
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LinkTreeView;
