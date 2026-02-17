import React from 'react';
import { X } from 'lucide-react';
import { LogoIcon } from './ui/Icons';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const { mockSignIn } = useAuth(); // Add this hook

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Specific override for requested user
        if (email.toLowerCase() === 'juliareismeira@gmail.com' && password === 'ADMIN') {
            mockSignIn(email);
            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
            return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            setError(signInError.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : signInError.message);
            setLoading(false);
        } else {
            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="glass-card w-full max-w-md rounded-[2rem] p-10 md:p-14 relative border-white/5 shadow-2xl overflow-hidden">
                <div className="absolute top-1/2 -translate-y-1/2 right-0 opacity-[0.03] pointer-events-none">
                    <LogoIcon className="w-64 h-64" />
                </div>

                <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="text-center space-y-6 mb-10 relative z-10">
                    <div className="w-16 h-16 bg-meira-accent/5 rounded-2xl flex items-center justify-center mx-auto border border-meira-accent/20">
                        <LogoIcon className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-light uppercase tracking-tight text-white">
                            SISTEMA <span className="font-bold text-meira-accent">RESTRITO.</span>
                        </h2>
                        <p className="text-white/40 text-[9px] font-black tracking-[0.3em] uppercase">
                            ACESSO EXCLUSIVO A COLABORADORES
                        </p>
                    </div>
                </div>

                <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-8 text-[11px] font-bold tracking-widest outline-none focus:border-meira-accent/30 focus:bg-white/[0.1] transition-colors uppercase placeholder:text-white/20"
                            placeholder="EMAIL DE ACESSO"
                        />
                    </div>
                    <div className="space-y-2">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-8 text-[11px] font-bold tracking-widest outline-none focus:border-meira-accent/30 focus:bg-white/[0.1] transition-colors uppercase placeholder:text-white/20"
                            placeholder="SENHA"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-meira-accent text-meira-dark py-6 rounded-full font-black text-[11px] tracking-[0.3em] uppercase shadow-2xl disabled:opacity-50 hover:bg-meira-soft-white transition-colors"
                    >
                        {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
                    </button>

                    <p className="text-center text-white/20 text-[9px] font-bold uppercase tracking-widest">
                        Acesso restrito a membros autorizados
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
