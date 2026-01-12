import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client, Interaction, Visit } from '@/types';
import { subDays, subHours } from 'date-fns';

interface DemoContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  demoClients: Client[];
  demoInteractions: Interaction[];
  demoVisits: Visit[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Demo data - Carteira pré-feita
const generateDemoClients = (): Client[] => {
  const now = new Date();
  return [
    {
      id: 'demo-1',
      nome: 'Maria Silva Santos',
      telefone: '(11) 99876-5432',
      dataCadastro: subDays(now, 45),
      dataChegada: subDays(now, 45),
      canal: 'Instagram',
      perfilBusca: 'Apartamento 3 quartos, próximo ao metrô, até 120m²',
      budget: 'R$ 600.000 - R$ 800.000',
      temperatura: 'quente',
      statusJornada: 'em_jornada',
      observacoes: 'Cliente muito interessada, visitou 3 imóveis. Preferência por acabamento moderno.',
      ultimaAtualizacao: subDays(now, 2),
      qtdeVisitas: 3,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 45),
      updatedAt: subDays(now, 2),
    },
    {
      id: 'demo-2',
      nome: 'João Pedro Oliveira',
      telefone: '(11) 98765-4321',
      dataCadastro: subDays(now, 30),
      dataChegada: subDays(now, 30),
      canal: 'Indicação',
      perfilBusca: 'Casa com quintal, 4 quartos, condomínio fechado',
      budget: 'R$ 1.200.000 - R$ 1.500.000',
      temperatura: 'quente',
      statusJornada: 'em_jornada',
      observacoes: 'Família com 2 filhos, precisa de espaço. Urgência média.',
      ultimaAtualizacao: subDays(now, 1),
      qtdeVisitas: 2,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 30),
      updatedAt: subDays(now, 1),
    },
    {
      id: 'demo-3',
      nome: 'Ana Carolina Ferreira',
      telefone: '(11) 97654-3210',
      dataCadastro: subDays(now, 60),
      dataChegada: subDays(now, 60),
      canal: 'Portal Imobiliário',
      perfilBusca: 'Studio ou 1 quarto, região central',
      budget: 'R$ 250.000 - R$ 350.000',
      temperatura: 'morno',
      statusJornada: 'em_jornada',
      observacoes: 'Primeiro imóvel, solteira. Quer investimento.',
      ultimaAtualizacao: subDays(now, 8),
      qtdeVisitas: 1,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 60),
      updatedAt: subDays(now, 8),
    },
    {
      id: 'demo-4',
      nome: 'Roberto Carlos Lima',
      telefone: '(11) 96543-2109',
      dataCadastro: subDays(now, 15),
      dataChegada: subDays(now, 15),
      canal: 'WhatsApp',
      perfilBusca: 'Apartamento 2 quartos, varanda gourmet',
      budget: 'R$ 450.000 - R$ 550.000',
      temperatura: 'quente',
      statusJornada: 'em_jornada',
      observacoes: 'Casal sem filhos, ambos trabalham de casa. Querem home office.',
      ultimaAtualizacao: subHours(now, 12),
      qtdeVisitas: 1,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 15),
      updatedAt: subHours(now, 12),
    },
    {
      id: 'demo-5',
      nome: 'Fernanda Beatriz Costa',
      telefone: '(11) 95432-1098',
      dataCadastro: subDays(now, 90),
      dataChegada: subDays(now, 90),
      canal: 'Facebook',
      perfilBusca: 'Cobertura duplex, área nobre',
      budget: 'R$ 2.000.000 - R$ 3.000.000',
      temperatura: 'morno',
      statusJornada: 'pausa',
      observacoes: 'Cliente VIP, pausou busca por viagem. Retorna mês que vem.',
      ultimaAtualizacao: subDays(now, 20),
      qtdeVisitas: 4,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 90),
      updatedAt: subDays(now, 20),
    },
    {
      id: 'demo-6',
      nome: 'Carlos Eduardo Souza',
      telefone: '(11) 94321-0987',
      dataCadastro: subDays(now, 120),
      dataChegada: subDays(now, 120),
      canal: 'Plantão',
      perfilBusca: 'Apartamento térreo com jardim, 3 quartos',
      budget: 'R$ 700.000 - R$ 900.000',
      temperatura: 'frio',
      statusJornada: 'comprou_comigo',
      observacoes: 'Fechou negócio! Apartamento no Morumbi. Comissão recebida.',
      ultimaAtualizacao: subDays(now, 5),
      qtdeVisitas: 5,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 120),
      updatedAt: subDays(now, 5),
    },
    {
      id: 'demo-7',
      nome: 'Patricia Almeida',
      telefone: '(11) 93210-9876',
      dataCadastro: subDays(now, 75),
      dataChegada: subDays(now, 75),
      canal: 'Google Ads',
      perfilBusca: 'Apartamento novo, 2-3 quartos, lazer completo',
      budget: 'R$ 500.000 - R$ 650.000',
      temperatura: 'frio',
      statusJornada: 'comprou_concorrencia',
      observacoes: 'Perdemos para concorrência. Preço mais agressivo.',
      ultimaAtualizacao: subDays(now, 30),
      qtdeVisitas: 2,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 75),
      updatedAt: subDays(now, 30),
    },
    {
      id: 'demo-8',
      nome: 'Lucas Mendes Silva',
      telefone: '(11) 92109-8765',
      dataCadastro: subDays(now, 7),
      dataChegada: subDays(now, 7),
      canal: 'TikTok',
      perfilBusca: 'Loft moderno, região descolada',
      budget: 'R$ 300.000 - R$ 400.000',
      temperatura: 'quente',
      statusJornada: 'em_jornada',
      observacoes: 'Jovem profissional, designer. Quer imóvel com personalidade.',
      ultimaAtualizacao: subHours(now, 4),
      qtdeVisitas: 0,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 7),
      updatedAt: subHours(now, 4),
    },
    {
      id: 'demo-9',
      nome: 'Juliana Martins',
      telefone: '(11) 91098-7654',
      dataCadastro: subDays(now, 50),
      dataChegada: subDays(now, 50),
      canal: 'Indicação',
      perfilBusca: 'Casa em condomínio, 5 quartos, piscina',
      budget: 'R$ 1.800.000 - R$ 2.200.000',
      temperatura: 'morno',
      statusJornada: 'em_jornada',
      observacoes: 'Família grande, 3 filhos. Precisa de espaço e segurança.',
      ultimaAtualizacao: subDays(now, 10),
      qtdeVisitas: 2,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 50),
      updatedAt: subDays(now, 10),
    },
    {
      id: 'demo-10',
      nome: 'Ricardo Gomes',
      telefone: '(11) 90987-6543',
      dataCadastro: subDays(now, 25),
      dataChegada: subDays(now, 25),
      canal: 'Portal Imobiliário',
      perfilBusca: 'Sala comercial, 80-120m², fácil acesso',
      budget: 'R$ 400.000 - R$ 600.000',
      temperatura: 'morno',
      statusJornada: 'em_jornada',
      observacoes: 'Advogado, quer montar escritório próprio.',
      ultimaAtualizacao: subDays(now, 6),
      qtdeVisitas: 1,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 25),
      updatedAt: subDays(now, 6),
    },
    {
      id: 'demo-11',
      nome: 'Camila Rodrigues',
      telefone: '(11) 89876-5432',
      dataCadastro: subDays(now, 40),
      dataChegada: subDays(now, 40),
      canal: 'Instagram',
      perfilBusca: 'Apartamento garden, 2 quartos',
      budget: 'R$ 380.000 - R$ 480.000',
      temperatura: 'frio',
      statusJornada: 'desistiu',
      observacoes: 'Decidiu continuar alugando por enquanto.',
      ultimaAtualizacao: subDays(now, 25),
      qtdeVisitas: 1,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 40),
      updatedAt: subDays(now, 25),
    },
    {
      id: 'demo-12',
      nome: 'Marcelo Barbosa',
      telefone: '(11) 88765-4321',
      dataCadastro: subDays(now, 3),
      dataChegada: subDays(now, 3),
      canal: 'WhatsApp',
      perfilBusca: 'Apartamento 3 quartos, suíte, 2 vagas',
      budget: 'R$ 550.000 - R$ 700.000',
      temperatura: 'quente',
      statusJornada: 'em_jornada',
      observacoes: 'Lead novo, muito motivado. Agendou visita para amanhã.',
      ultimaAtualizacao: subHours(now, 2),
      qtdeVisitas: 0,
      corretorId: 'demo-corretor',
      companyId: 'demo-company',
      createdAt: subDays(now, 3),
      updatedAt: subHours(now, 2),
    },
  ];
};

const generateDemoInteractions = (): Interaction[] => {
  const now = new Date();
  return [
    { id: 'int-1', clientId: 'demo-1', meio: 'ligacao', data: subDays(now, 2), resumo: 'Confirmação de interesse após visita', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 2) },
    { id: 'int-2', clientId: 'demo-1', meio: 'presencial', data: subDays(now, 5), resumo: 'Visita ao apartamento na Paulista', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 5) },
    { id: 'int-3', clientId: 'demo-2', meio: 'whatsapp', data: subDays(now, 1), resumo: 'Envio de novas opções de casas', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 1) },
    { id: 'int-4', clientId: 'demo-2', meio: 'presencial', data: subDays(now, 3), resumo: 'Visita à casa em Alphaville', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 3) },
    { id: 'int-5', clientId: 'demo-4', meio: 'whatsapp', data: subHours(now, 12), resumo: 'Cliente solicitou mais fotos do apto', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subHours(now, 12) },
    { id: 'int-6', clientId: 'demo-8', meio: 'ligacao', data: subHours(now, 4), resumo: 'Primeiro contato, muito interessado', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subHours(now, 4) },
    { id: 'int-7', clientId: 'demo-6', meio: 'presencial', data: subDays(now, 10), resumo: 'Assinatura do contrato', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 10) },
    { id: 'int-8', clientId: 'demo-12', meio: 'whatsapp', data: subHours(now, 2), resumo: 'Agendamento de visita', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subHours(now, 2) },
    { id: 'int-9', clientId: 'demo-3', meio: 'email', data: subDays(now, 8), resumo: 'Envio de simulação de financiamento', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 8) },
    { id: 'int-10', clientId: 'demo-9', meio: 'presencial', data: subDays(now, 10), resumo: 'Visita à casa no Jardins', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 10) },
    { id: 'int-11', clientId: 'demo-10', meio: 'ligacao', data: subDays(now, 6), resumo: 'Discussão sobre localização', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 6) },
    { id: 'int-12', clientId: 'demo-5', meio: 'whatsapp', data: subDays(now, 20), resumo: 'Cliente avisou sobre viagem', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 20) },
  ];
};

const generateDemoVisits = (): Visit[] => {
  const now = new Date();
  return [
    { id: 'vis-1', clientId: 'demo-1', data: subDays(now, 5), codigoImovel: 'APT-001', enderecoImovel: 'Apto 3q Paulista - R$ 750k', feedback: 'Gostou muito, mas achou pequeno', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 5) },
    { id: 'vis-2', clientId: 'demo-1', data: subDays(now, 15), codigoImovel: 'APT-002', enderecoImovel: 'Apto 3q Pinheiros - R$ 680k', feedback: 'Não gostou da vista', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 15) },
    { id: 'vis-3', clientId: 'demo-2', data: subDays(now, 3), codigoImovel: 'CAS-001', enderecoImovel: 'Casa Alphaville - R$ 1.4M', feedback: 'Excelente! Vai levar a esposa', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 3) },
    { id: 'vis-4', clientId: 'demo-6', data: subDays(now, 15), codigoImovel: 'APT-003', enderecoImovel: 'Apto Garden Morumbi - R$ 850k', feedback: 'Fechou negócio!', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 15) },
    { id: 'vis-5', clientId: 'demo-9', data: subDays(now, 10), codigoImovel: 'CAS-002', enderecoImovel: 'Casa Jardins - R$ 2.1M', feedback: 'Gostou mas quer ver mais opções', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 10) },
    { id: 'vis-6', clientId: 'demo-4', data: subDays(now, 7), codigoImovel: 'APT-004', enderecoImovel: 'Apto 2q Vila Madalena - R$ 520k', feedback: 'Adorou a varanda gourmet', corretorId: 'demo-corretor', companyId: 'demo-company', createdAt: subDays(now, 7) },
  ];
};

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoClients] = useState<Client[]>(generateDemoClients());
  const [demoInteractions] = useState<Interaction[]>(generateDemoInteractions());
  const [demoVisits] = useState<Visit[]>(generateDemoVisits());

  const enableDemoMode = () => setIsDemoMode(true);
  const disableDemoMode = () => setIsDemoMode(false);

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      enableDemoMode,
      disableDemoMode,
      demoClients,
      demoInteractions,
      demoVisits,
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
