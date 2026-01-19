
import React from 'react';

export interface ServiceDetail {
  title: string;
  slogan: string; // Atuando como as tags/palavras-chave
  summary: string; // Atuando como o Escopo Técnico
  includes: string[]; // Atuando como as Entregas Técnicas
  result: string; // Atuando como o Resultado Técnico
  cta: string;
  icon: React.ReactNode;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export type ViewState = 'HOME' | 'SERVICOS' | 'MATERIAIS' | 'CONTATO';
