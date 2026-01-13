import * as XLSX from 'xlsx';
import { Client, Interaction, Visit, TeamMember, Notification } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatDate = (date: Date) => format(date, 'dd/MM/yyyy', { locale: ptBR });
const formatDateTime = (date: Date) => format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });

const getTemperaturaLabel = (temp: string) => {
  const labels: Record<string, string> = {
    quente: 'Quente',
    morno: 'Morno',
    frio: 'Frio',
  };
  return labels[temp] || temp;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    em_jornada: 'Em Jornada',
    pausa: 'Pausa',
    desistiu: 'Desistiu',
    comprou_comigo: 'Comprou Comigo',
    comprou_concorrencia: 'Comprou na Concorrência',
  };
  return labels[status] || status;
};

export const exportToExcel = (clients: Client[], interactions: Interaction[], visits: Visit[]) => {
  const workbook = XLSX.utils.book_new();

  // Clients sheet
  const clientsData = clients.map(client => ({
    'Nome': client.nome,
    'Telefone': client.telefone,
    'Data Cadastro': formatDate(client.dataCadastro),
    'Data Chegada': formatDate(client.dataChegada),
    'Canal': client.canal,
    'Perfil de Busca': client.perfilBusca,
    'Budget': client.budget,
    'Temperatura': getTemperaturaLabel(client.temperatura),
    'Status': getStatusLabel(client.statusJornada),
    'Última Atualização': formatDate(client.ultimaAtualizacao),
    'Qtde Visitas': client.qtdeVisitas,
    'Observações': client.observacoes,
    // Dados de venda
    'Código Imóvel Venda': client.dadosVenda?.codigoImovel || '',
    'EN Responsável': client.dadosVenda?.enResponsavel || '',
    'Valor Venda': client.dadosVenda?.valorVenda || '',
    'Comissão Contrato %': client.dadosVenda?.comissaoContrato || '',
    'Minha Comissão %': client.dadosVenda?.minhaComissao || '',
    'Valor Previsto': client.dadosVenda?.valorPrevisto || '',
    'Valor Recebido': client.dadosVenda?.valorRecebido || '',
    'Data Venda': client.dadosVenda?.dataVenda ? formatDate(new Date(client.dadosVenda.dataVenda)) : '',
  }));
  
  const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');

  // Interactions sheet
  const interactionsData = interactions.map(interaction => {
    const client = clients.find(c => c.id === interaction.clientId);
    return {
      'Cliente': client?.nome || 'N/A',
      'Data': formatDate(interaction.data),
      'Meio': interaction.meio === 'whatsapp' ? 'WhatsApp' : 
              interaction.meio === 'ligacao' ? 'Ligação' : 
              interaction.meio === 'email' ? 'Email' : 'Presencial',
      'Resumo': interaction.resumo,
    };
  });
  
  const interactionsSheet = XLSX.utils.json_to_sheet(interactionsData);
  XLSX.utils.book_append_sheet(workbook, interactionsSheet, 'Interações');

  // Visits sheet
  const visitsData = visits.map(visit => {
    const client = clients.find(c => c.id === visit.clientId);
    return {
      'Cliente': client?.nome || 'N/A',
      'Data': formatDate(visit.data),
      'Código Imóvel': visit.codigoImovel,
      'Endereço': visit.enderecoImovel,
      'Feedback': visit.feedback,
    };
  });
  
  const visitsSheet = XLSX.utils.json_to_sheet(visitsData);
  XLSX.utils.book_append_sheet(workbook, visitsSheet, 'Visitas');

  // Generate and download
  const fileName = `crm_imobiliario_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToGoogleSheets = (clients: Client[], interactions: Interaction[], visits: Visit[]) => {
  // Create CSV content
  const headers = ['Nome', 'Telefone', 'Data Cadastro', 'Canal', 'Perfil de Busca', 'Budget', 'Temperatura', 'Status', 'Qtde Visitas', 'Observações'];
  
  const rows = clients.map(client => [
    client.nome,
    client.telefone,
    formatDate(client.dataCadastro),
    client.canal,
    client.perfilBusca,
    client.budget,
    getTemperaturaLabel(client.temperatura),
    getStatusLabel(client.statusJornada),
    client.qtdeVisitas.toString(),
    client.observacoes,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download as CSV (can be imported to Google Sheets)
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `crm_imobiliario_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
  link.click();
};

// Full backup export in JSON format
export interface BackupData {
  exportDate: string;
  version: string;
  data: {
    clients: Client[];
    interactions: Interaction[];
    visits: Visit[];
    teamMembers?: TeamMember[];
    notifications?: Notification[];
  };
}

export const exportFullBackup = (
  clients: Client[], 
  interactions: Interaction[], 
  visits: Visit[],
  teamMembers?: TeamMember[],
  notifications?: Notification[]
) => {
  const backupData: BackupData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    data: {
      clients,
      interactions,
      visits,
      teamMembers,
      notifications,
    }
  };

  const jsonContent = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `backup_completo_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
  link.click();
};

// Export all data to a single comprehensive Excel file
export const exportComprehensiveBackup = (
  clients: Client[], 
  interactions: Interaction[], 
  visits: Visit[],
  teamMembers?: TeamMember[],
  notifications?: Notification[]
) => {
  const workbook = XLSX.utils.book_new();

  // Clients sheet with all data
  const clientsData = clients.map(client => ({
    'ID': client.id,
    'Nome': client.nome,
    'Telefone': client.telefone,
    'Data Cadastro': formatDateTime(client.dataCadastro),
    'Data Chegada': formatDateTime(client.dataChegada),
    'Canal': client.canal,
    'Perfil de Busca': client.perfilBusca,
    'Budget': client.budget,
    'Temperatura': getTemperaturaLabel(client.temperatura),
    'Status': getStatusLabel(client.statusJornada),
    'Última Atualização': formatDateTime(client.ultimaAtualizacao),
    'Qtde Visitas': client.qtdeVisitas,
    'Observações': client.observacoes || '',
    'Corretor ID': client.corretorId || '',
    'Criado Em': formatDateTime(client.createdAt),
    'Atualizado Em': formatDateTime(client.updatedAt),
    // Dados de venda
    'Código Imóvel Venda': client.dadosVenda?.codigoImovel || '',
    'EN Responsável': client.dadosVenda?.enResponsavel || '',
    'Valor Venda': client.dadosVenda?.valorVenda || '',
    'Comissão Contrato %': client.dadosVenda?.comissaoContrato || '',
    'Minha Comissão %': client.dadosVenda?.minhaComissao || '',
    'Valor Previsto': client.dadosVenda?.valorPrevisto || '',
    'Valor Recebido': client.dadosVenda?.valorRecebido || '',
    'Data Venda': client.dadosVenda?.dataVenda ? formatDateTime(new Date(client.dadosVenda.dataVenda)) : '',
  }));
  
  const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');

  // Interactions sheet
  const interactionsData = interactions.map(interaction => {
    const client = clients.find(c => c.id === interaction.clientId);
    return {
      'ID': interaction.id,
      'Cliente': client?.nome || 'N/A',
      'Cliente ID': interaction.clientId,
      'Data': formatDateTime(interaction.data),
      'Meio': interaction.meio,
      'Resumo': interaction.resumo,
      'Corretor ID': interaction.corretorId,
      'Criado Em': formatDateTime(interaction.createdAt),
    };
  });
  
  const interactionsSheet = XLSX.utils.json_to_sheet(interactionsData);
  XLSX.utils.book_append_sheet(workbook, interactionsSheet, 'Interações');

  // Visits sheet
  const visitsData = visits.map(visit => {
    const client = clients.find(c => c.id === visit.clientId);
    return {
      'ID': visit.id,
      'Cliente': client?.nome || 'N/A',
      'Cliente ID': visit.clientId,
      'Data': formatDateTime(visit.data),
      'Código Imóvel': visit.codigoImovel,
      'Endereço': visit.enderecoImovel,
      'Feedback': visit.feedback,
      'Corretor ID': visit.corretorId,
      'Criado Em': formatDateTime(visit.createdAt),
    };
  });
  
  const visitsSheet = XLSX.utils.json_to_sheet(visitsData);
  XLSX.utils.book_append_sheet(workbook, visitsSheet, 'Visitas');

  // Team Members sheet
  if (teamMembers && teamMembers.length > 0) {
    const teamData = teamMembers.map(member => ({
      'ID': member.id,
      'Nome': member.nome,
      'Email': member.email,
      'Cargo': member.role === 'admin' ? 'Administrador' : 'Corretor',
      'Ativo': member.ativo ? 'Sim' : 'Não',
      'Status Assinatura': member.subscriptionStatus || '',
      'Criado Em': formatDateTime(member.createdAt),
    }));
    
    const teamSheet = XLSX.utils.json_to_sheet(teamData);
    XLSX.utils.book_append_sheet(workbook, teamSheet, 'Equipe');
  }

  // Notifications sheet
  if (notifications && notifications.length > 0) {
    const notificationsData = notifications.map(notification => ({
      'ID': notification.id,
      'Título': notification.titulo,
      'Mensagem': notification.mensagem,
      'Tipo': notification.tipo,
      'Remetente': notification.remetenteNome,
      'Lida': notification.lida ? 'Sim' : 'Não',
      'Criado Em': formatDateTime(notification.createdAt),
    }));
    
    const notificationsSheet = XLSX.utils.json_to_sheet(notificationsData);
    XLSX.utils.book_append_sheet(workbook, notificationsSheet, 'Notificações');
  }

  // Metadata sheet
  const metadataSheet = XLSX.utils.json_to_sheet([{
    'Data do Backup': formatDateTime(new Date()),
    'Total Clientes': clients.length,
    'Total Interações': interactions.length,
    'Total Visitas': visits.length,
    'Total Membros Equipe': teamMembers?.length || 0,
    'Total Notificações': notifications?.length || 0,
    'Versão': '1.0',
  }]);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadados');

  // Generate and download
  const fileName = `backup_completo_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
