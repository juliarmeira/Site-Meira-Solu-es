import React from 'react';
import { LogoMeira } from './ui/Icons';
import { ViewState } from '../types';

interface FooterProps {
    setCurrentView: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
    return (
        <footer className="py-24 border-t border-white/10 px-6 mt-40 bg-black/50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
                <div className="text-center md:text-left space-y-8">
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <LogoMeira className="w-10 h-10 text-meira-accent" />
                        <span className="font-black tracking-[0.6em] text-[13px] uppercase text-white">MEIRA SOLUÇÕES</span>
                    </div>
                    <p className="text-white/60 text-[11px] font-black tracking-[0.5em] uppercase text-center md:text-left">
                        © 2026 • ANDRADAS - MG • CIÊNCIA & ÉTICA <br />
                        ENGENHARIA QUÍMICA E AMBIENTAL EM ALTA PERFORMANCE
                    </p>
                </div>
                <div className="flex gap-12 text-white/50 text-[11px] font-black uppercase tracking-widest">
                    <button onClick={() => setCurrentView('HOME')} className="hover:text-meira-accent transition-colors">INÍCIO</button>
                    <button onClick={() => setCurrentView('SERVICOS')} className="hover:text-meira-accent transition-colors">SERVIÇOS</button>
                    <button onClick={() => setCurrentView('MATERIAIS')} className="hover:text-meira-accent transition-colors">MATERIAIS</button>
                    <button onClick={() => setCurrentView('CONTATO')} className="hover:text-meira-accent transition-colors">CONTATO</button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
