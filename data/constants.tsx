import React from 'react';
import {
    FlaskConical,
    Globe,
    DraftingCompass,
    Droplets,
    MapPin,
    Shield,
    Database,
    MonitorCheck,
    Search,
    Layers,
    FileCheck,
    Cpu,
    Leaf,
    Factory,
    Wine,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { ServiceDetail } from '../types';

export const servicesData: ServiceDetail[] = [
    {
        title: "REGULARIZAÇÃO DE BEBIDAS (MAPA)",
        slogan: "SIPEAGRO · BPF · REGISTRO DE PRODUTOS",
        summary: "Consultoria técnica especializada para o registro de estabelecimentos e bebidas junto ao MAPA, com foco em alambiques e excelência normativa.",
        includes: [
            "Registro e Renovação no SIPEAGRO",
            "Implantação de BPF (Boas Práticas de Fabricação)",
            "Registro de Rótulos e Produtos",
            "Adequação de Layout Industrial (Normas MAPA)",
            "Acompanhamento Técnico em Fiscalizações"
        ],
        result: "Escalonamento produtivo com plena segurança jurídica e técnica.",
        cta: "Regularizar Bebida",
        icon: <Wine className="w-5 h-5" />
    },
    {
        title: "REGULARIZAÇÃO AMBIENTAL",
        slogan: "LICENCIAMENTO · CTF · ETE/ETA",
        summary: "Gestão estratégica de conformidade ambiental para indústrias químicas e de bebidas, focada em licenciamentos e sistemas de tratamento.",
        includes: [
            "Licenciamento Ambiental (LP, LI, LO)",
            "Cadastro Técnico Federal (CTF - IBAMA)",
            "Projeto de pequeno porte de ETEs e ETAs",
            "Estudos de Autodepuração",
            "EIA, RIMA & EIV (Estudos de Impacto)"
        ],
        result: "Operação legalizada com sustentabilidade técnica comprovada.",
        cta: "Garantir Licença",
        icon: <Leaf className="w-5 h-5" />
    },
    {
        title: "PROJETOS INDUSTRIAIS",
        slogan: "PLANTAS · LAYOUT · ESCALONAMENTO",
        summary: "Desenvolvimento de plantas industriais otimizadas para pequenas escalas, unindo engenharia de fluxo e eficiência produtiva real.",
        includes: [
            "Projeto de Plantas Industriais de pequeno porte",
            "Otimização de Layout e Fluxogramas",
            "Mapeamento de Processos",
            "Dimensionamento de Equipamentos"
        ],
        result: "Estrutura industrial eficiente e dimensionada ao seu volume produtivo.",
        cta: "Solicitar Projeto",
        icon: <Factory className="w-5 h-5" />
    },
    {
        title: "PRODUTOS CONTROLADOS",
        slogan: "POLÍCIA FEDERAL · EXÉRCITO · CIVIL",
        summary: "Regularização e gestão rigorosa de substâncias controladas, garantindo rastreabilidade jurídica e conformidade total junto aos órgãos.",
        includes: [
            "Registro na Polícia Federal e Exército",
            "Gestão de Mapas e Relatórios Mensais",
            "Renovação de Licenças e Alvarás",
            "Adequação de Almoxarifados e Segurança"
        ],
        result: "Tranquilidade operacional livre de passivos em insumos controlados.",
        cta: "Regularizar Controlados",
        icon: <ShieldCheck className="w-5 h-5" />
    },
    {
        title: "INTELIGÊNCIA E GESTÃO",
        slogan: "QGIS · IA · DASHBOARDS",
        summary: "Engenharia de dados aplicada: dashboards técnicos em tempo real, inteligência geográfica QGIS e automação inteligente de ativos.",
        includes: [
            "Mapas Georreferenciados com QGIS",
            "Estudos de Área com QGIS",
            "Criação de Dashboards Técnicos",
            "Desenvolvimento de Sites e Apps com IA"
        ],
        result: "Clareza total na tomada de decisão baseada em inteligência técnica.",
        cta: "Digitalizar Gestão",
        icon: <Cpu className="w-5 h-5" />
    }
];

export const pillars = [
    { id: "01", title: "DIAGNÓSTICO TÉCNICO", subtitle: "PRECISÃO INICIAL", description: "Análise de processo e riscos.", icon: <Search size={20} /> },
    { id: "02", title: "VISÃO SISTÊMICA", subtitle: "CONFORMIDADE LEGAL", description: "MAPA e Ambiental integrados.", icon: <Layers size={20} /> },
    { id: "03", title: "ENGENHARIA VIÁVEL", subtitle: "ESCALA REAL", description: "Dimensionado ao produtor.", icon: <DraftingCompass size={20} /> },
    { id: "04", title: "MÉTODO & DOCS", subtitle: "RASTREABILIDADE", description: "Padronização total.", icon: <FileCheck size={20} /> },
    { id: "05", title: "TECNOLOGIA", subtitle: "CLAREZA DE GESTÃO", description: "QGIS e Dados.", icon: <Cpu size={20} /> }
];
