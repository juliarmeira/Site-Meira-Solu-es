
import React from 'react';
import { 
  Instagram, 
  Mail, 
  Globe, 
  MessageCircle,
  MapPin,
  CheckCircle2
} from 'lucide-react';

const LogoMeira = () => (
  <svg viewBox="0 0 512 512" className="w-24 h-24 mb-6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="80" fill="#bfff00"/>
    <circle cx="120" cy="150" r="60" fill="#bfff00"/>
    <circle cx="400" cy="200" r="50" fill="#bfff00"/>
    <circle cx="150" cy="400" r="55" fill="#bfff00"/>
    <circle cx="380" cy="420" r="65" fill="#bfff00"/>
    <path d="M165 185 L210 220" stroke="#bfff00" strokeWidth="12" strokeLinecap="round"/>
    <path d="M360 215 L300 235" stroke="#bfff00" strokeWidth="12" strokeLinecap="round"/>
    <path d="M190 360 L225 310" stroke="#bfff00" strokeWidth="12" strokeLinecap="round"/>
    <path d="M330 380 L290 310" stroke="#bfff00" strokeWidth="12" strokeLinecap="round"/>
  </svg>
);

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
    className="link-card w-full p-5 rounded-2xl flex items-center gap-5 text-left mb-4 group"
  >
    <div className="bg-meira-lime p-3 rounded-xl text-meira-deep group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-white font-bold text-lg uppercase leading-tight">{title}</h3>
      <p className="text-meira-lime/80 font-medium text-xs tracking-wider uppercase">{subtitle}</p>
    </div>
  </a>
);

const App: React.FC = () => {
  const services = [
    "MAPA / SIPEAGRO",
    "BPF & POPs",
    "Regularização Ambiental",
    "Projetos e Layout Industrial"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-6 max-w-xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col items-center text-center mb-10">
        <LogoMeira />
        <h1 className="text-3xl tracking-tighter mb-2 text-meira-deep">
          <span className="font-bold">MEIRA</span> SOLUÇÕES
        </h1>
        <p className="font-bold text-xs tracking-[0.2em] uppercase text-meira-neutral mb-8">
          REGULARIZAÇÃO DE ALAMBIQUES E BEBIDAS
        </p>

        {/* Services Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-4">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-full shadow-sm"
            >
              <CheckCircle2 size={16} className="text-meira-deep" />
              <span className="text-[10px] font-semibold text-meira-deep uppercase tracking-tight">
                {service}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Links Section */}
      <main className="w-full">
        <LinkCard 
          title="WhatsApp" 
          subtitle="Fale Comigo" 
          href="https://w.app/solucoesmeira" 
          icon={MessageCircle} 
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
        <LinkCard 
          title="Site" 
          subtitle="Conheça meu trabalho" 
          href="https://www.solucoesmeira.com.br/" 
          icon={Globe} 
        />
      </main>

      {/* Footer Section */}
      <footer className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-meira-deep font-semibold text-[10px] uppercase tracking-[0.3em]">
          <MapPin size={14} className="text-meira-deep" />
          ANDRADAS MG
        </div>
        <p className="mt-8 text-[9px] text-slate-400 font-medium tracking-widest uppercase">
          © 2024 Meira Soluções • Engenharia & Regulação
        </p>
      </footer>
    </div>
  );
};

export default App;
