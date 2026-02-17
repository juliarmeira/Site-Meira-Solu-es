import React from 'react';
import { Link } from 'react-router-dom';
import { LogoMeira } from './ui/Icons';

const Footer: React.FC = () => {
    return (
        <footer className="py-24 border-t border-white/10 px-6 mt-40 bg-black/50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
                <div className="text-center md:text-left space-y-8">
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <LogoMeira className="w-10 h-10 text-meira-accent" />
                        <span className="font-black tracking-[0.6em] text-[13px] uppercase text-white">MEIRA SOLUÇÕES</span>
                    </div>
                    <p className="text-white/60 text-[11px] font-black tracking-[0.5em] uppercase text-center md:text-left">
                        © 2026 • ANDRADAS - MG <br />
                        ENGENHARIA QUÍMICA E AMBIENTAL <br />
                        <span className="opacity-40 text-[9px] mt-2 block">v{__APP_VERSION__} • {__BUILD_DATE__}</span>
                    </p>
                </div>
                <div className="flex gap-12 text-white/50 text-[11px] font-black uppercase tracking-widest">
                    <Link to="/" className="hover:text-meira-accent transition-colors">INÍCIO</Link>
                    <Link to="/servicos" className="hover:text-meira-accent transition-colors">SERVIÇOS</Link>
                    <Link to="/materiais" className="hover:text-meira-accent transition-colors">MATERIAIS</Link>
                    <Link to="/contato" className="hover:text-meira-accent transition-colors">CONTATO</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
