import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Menu, X } from 'lucide-react';
import { LogoIcon } from './ui/Icons';

interface NavbarProps {
    setShowLogin: (show: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setShowLogin }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const NavItem = ({ to, label }: { to: string, label: string }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors relative py-2 group ${isActive ? 'text-meira-accent' : 'text-white/50 hover:text-white'}`}
            >
                {label}
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-meira-accent transition-all origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
            </Link>
        );
    };

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl">
            <div className="glass-card rounded-full px-8 py-3 flex justify-between items-center shadow-2xl border-white/5 relative z-50">
                <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                    <LogoIcon className="h-6 md:h-7 w-auto" />
                    <span className="text-sm md:text-base font-bold tracking-[0.2em] text-white flex items-center">
                        MEIRA<span className="font-light text-white/90">SOLUÇÕES</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4 md:gap-10">
                    <div className="hidden md:flex items-center gap-8">
                        <NavItem to="/" label="INÍCIO" />
                        <NavItem to="/servicos" label="SERVIÇOS" />
                        <NavItem to="/materiais" label="MATERIAIS" />
                        <NavItem to="/contato" label="CONTATO" />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowLogin(true)}
                            className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-[9px] font-black tracking-[0.3em] text-white hover:bg-meira-accent hover:text-meira-dark hover:border-meira-accent transition-colors"
                        >
                            <Lock size={12} />
                            <span>LOGIN</span>
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:text-meira-accent transition-colors"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full mt-4 transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="glass-card rounded-[2rem] p-8 flex flex-col gap-6 items-center border-white/5 shadow-2xl">
                    <NavItem to="/" label="INÍCIO" />
                    <NavItem to="/servicos" label="SERVIÇOS" />
                    <NavItem to="/materiais" label="MATERIAIS" />
                    <NavItem to="/contato" label="CONTATO" />
                    <hr className="w-full border-white/5" />
                    <button
                        onClick={() => {
                            setShowLogin(true);
                            setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full justify-center bg-meira-accent text-meira-dark py-4 rounded-full text-[9px] font-black tracking-[0.3em] transition-colors"
                    >
                        <Lock size={12} />
                        <span>LOGIN</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
