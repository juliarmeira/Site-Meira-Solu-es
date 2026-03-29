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
        slogan: "LICENCIAMENTO · QGIS · MODELAGEM",
        summary: "Gestão estratégica de conformidade ambiental, licenciamentos, modelagens e inteligência geográfica.",
        includes: [
            "Licenciamento Ambiental (LP, LI, LO)",
            "Mapas Georreferenciados (QGIS)",
            "Modelagens Ambientais",
            "Cadastro Técnico Federal (CTF)",
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
        slogan: "IA · DASHBOARDS · APPS",
        summary: "Soluções digitais para engenharia e negócios: dashboards, aplicativos de gestão e inteligência artificial generativa.",
        includes: [
            "Dashboards Técnicos e Gerenciais",
            "Sites e Aplicativos com IA",
            "Apps de Gerenciamento de Negócios",
            "Uso de IA para Imagens e Textos"
        ],
        result: "Clareza total na tomada de decisão e automação de processos.",
        cta: "Digitalizar Gestão",
        icon: <Cpu className="w-5 h-5" />
    }
];

export const pillars = [
    {
        id: "01",
        title: "DIAGNÓSTICO",
        subtitle: "Leitura da Realidade",
        description: "Mapeamos a operação 'chão de fábrica': infraestrutura, processos e gargalos, identificando o que já funciona e o que precisa de ajuste técnico.",
        icon: <Search size={20} />
    },
    {
        id: "02",
        title: "LEGISLAÇÃO",
        subtitle: "Filtro Regulatório",
        description: "Cruzamos o cenário real do seu negócio com as exigências do MAPA e órgãos ambientais, traduzindo a lei para a sua prática.",
        icon: <Shield size={20} />
    },
    {
        id: "03",
        title: "ENQUADRAMENTO",
        subtitle: "Estratégia de Viabilidade",
        description: "Definimos o caminho regulatório mais seguro e econômico, desenhando uma solução que caiba no orçamento e na estrutura do produtor.",
        icon: <Layers size={20} />
    },
    {
        id: "04",
        title: "PROJETO",
        subtitle: "Engenharia Aplicada",
        description: "Transformamos a estratégia em documentos técnicos: plantas, manuais de BPF, POPs e memoriais descritivos prontos para aprovação.",
        icon: <DraftingCompass size={20} />
    },
    {
        id: "05",
        title: "ENTREGA",
        subtitle: "Conformidade Oficial",
        description: "Gestão do processo junto aos órgãos fiscalizadores, com defesa técnica ativa até a emissão do registro ou licença.",
        icon: <FileCheck size={20} />
    }
];
