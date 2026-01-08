export type Temperature = 'quente' | 'morno' | 'frio';

export type JourneyStatus = 
  | 'em_jornada' 
  | 'pausa' 
  | 'desistiu' 
  | 'comprou_comigo' 
  | 'comprou_concorrencia';

export type UserRole = 'admin' | 'corretor';

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  dataCadastro: Date;
  dataChegada: Date;
  canal: string;
  perfilBusca: string;
  budget: string;
  observacoes: string;
  temperatura: Temperature;
  statusJornada: JourneyStatus;
  ultimaAtualizacao: Date;
  qtdeVisitas: number;
  corretorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  clientId: string;
  data: Date;
  meio: 'whatsapp' | 'ligacao' | 'email' | 'presencial';
  resumo: string;
  corretorId: string;
  createdAt: Date;
}

export interface Visit {
  id: string;
  clientId: string;
  data: Date;
  codigoImovel: string;
  enderecoImovel: string;
  feedback: string;
  corretorId: string;
  createdAt: Date;
}

export interface Proposal {
  id: string;
  clientId: string;
  codigoImovel: string;
  valorOfertado: number;
  status: 'pendente' | 'aceita' | 'recusada' | 'em_negociacao';
  observacoes: string;
  corretorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'trial' | 'pending_payment' | 'active' | 'expired';

export interface TeamMember {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  ativo: boolean;
  createdAt: Date;
  trialStartDate?: Date;
  subscriptionStatus?: SubscriptionStatus;
  companyId?: string; // Para vincular corretores a uma empresa
}

export interface Company {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  adminId: string;
  trialStartDate: Date;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
}

export interface PaymentReceipt {
  id: string;
  userId: string;
  companyId?: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  destinatarioId: string | 'all'; // 'all' para toda equipe
  remetenteId: string;
  remetenteNome: string;
  lida: boolean;
  createdAt: Date;
}
