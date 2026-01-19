// Tipos para o Sistema de Gerenciamento de Alambique

export interface POP {
    id: string;
    user_id: string;
    codigo: string;
    titulo: string;
    descricao?: string;
    frequencia?: string;
    ultima_revisao?: string;
    proxima_revisao?: string;
    arquivo_url?: string;
    created_at: string;
    updated_at: string;
}

export interface ControleMateriaPrima {
    id: string;
    user_id: string;
    data_hora_corte: string;
    data_hora_moagem: string;
    tempo_espera_minutos?: number; // Calculado automaticamente
    id_talhao: string;
    volume_caldo_litros: number;
    brix_original: number;
    volume_agua_litros: number;
    brix_final_mosto: number;
    observacoes?: string;
    created_at: string;
}

export interface ControleFermentacao {
    id: string;
    user_id: string;
    id_dorna: string;
    data_hora_inicio: string;
    data_hora_termino?: string;
    tempo_ciclo_horas?: number; // Calculado no frontend
    ph_inicial: number;
    ph_final?: number;
    temperatura_maxima?: number;
    brix_final_atenuacao?: number;
    nutrientes_fermentos?: string;
    observacoes?: string;
    created_at: string;
}

export interface ControleDestilacao {
    id: string;
    user_id: string;
    id_alambique: string;
    data_destilacao: string;
    volume_vinho_litros: number;
    teor_alcoolico_vinho: number;
    volume_cabeca_litros: number;
    volume_coracao_litros: number;
    volume_cauda_litros: number;
    graduacao_coracao_gl: number;
    limpeza_previa_cobre: boolean;
    observacoes?: string;
    created_at: string;
}

export interface ControleArmazenamento {
    id: string;
    user_id: string;
    id_recipiente: string;
    tipo_material: string;
    volume_entrada_litros: number;
    volume_saida_litros?: number;
    data_inicio: string;
    data_termino?: string;
    perda_evaporacao_percentual?: number; // Calculado no frontend
    observacoes?: string;
    created_at: string;
}

export interface ControleEnvase {
    id: string;
    user_id: string;
    numero_lote: string;
    data_envase: string;
    graduacao_final_gl: number;
    lavagem_garrafas_conforme: boolean;
    resultado_cobre_mg_l?: number;
    resultado_acidez?: number;
    resultado_metanol?: number;
    resultado_carbamato?: number;
    quantidade_garrafas?: number;
    volume_garrafa_ml: number;
    observacoes?: string;
    created_at: string;
}

export interface LaudoLicenca {
    id: string;
    user_id: string;
    tipo: 'laudo' | 'licenca';
    titulo: string;
    descricao?: string;
    numero_documento?: string;
    orgao_emissor?: string;
    data_realizacao: string;
    data_vencimento?: string;
    arquivo_url?: string;
    observacoes?: string;
    created_at: string;
    updated_at: string;
}

// Tipos para formulários (sem id e campos automáticos)
export type POPInsert = Omit<POP, 'id' | 'created_at' | 'updated_at'>;
export type MateriaPrimaInsert = Omit<ControleMateriaPrima, 'id' | 'created_at' | 'tempo_espera_minutos'>;
export type FermentacaoInsert = Omit<ControleFermentacao, 'id' | 'created_at' | 'tempo_ciclo_horas'>;
export type DestilacaoInsert = Omit<ControleDestilacao, 'id' | 'created_at'>;
export type ArmazenamentoInsert = Omit<ControleArmazenamento, 'id' | 'created_at' | 'perda_evaporacao_percentual'>;
export type EnvaseInsert = Omit<ControleEnvase, 'id' | 'created_at'>;
export type LaudoLicencaInsert = Omit<LaudoLicenca, 'id' | 'created_at' | 'updated_at'>;

// POPs padrão conforme normativa
export const POPS_PADRAO = [
    { codigo: 'POP-01', titulo: 'Higienização das Instalações e Equipamentos', descricao: 'Frequência e produtos químicos utilizados' },
    { codigo: 'POP-02', titulo: 'Controle da Potabilidade da Água', descricao: 'Instalação e manutenção do clorador' },
    { codigo: 'POP-03', titulo: 'Higiene e Saúde dos Operadores', descricao: 'Atestados e conduta' },
    { codigo: 'POP-04', titulo: 'Manejo de Resíduos', descricao: 'Destinação do vinhoto e águas de lavagem' },
    { codigo: 'POP-05', titulo: 'Controle Integrado de Pragas', descricao: 'Barreiras físicas e monitoramento' },
    { codigo: 'POP-06', titulo: 'Manutenção Preventiva e Calibração', descricao: 'Alambique, termômetros e densímetros' },
    { codigo: 'POP-07', titulo: 'Seleção e Qualificação de Fornecedores', descricao: 'Insumos e garrafas' },
] as const;

// Tipos de madeira para envelhecimento
export const TIPOS_MADEIRA = [
    'Carvalho Europeu',
    'Carvalho Americano',
    'Jequitibá',
    'Amendoim',
    'Bálsamo',
    'Ipê',
    'Freijó',
    'Inox',
    'PEAD',
] as const;
