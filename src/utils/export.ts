import * as XLSX from 'xlsx';
import { Client, Interaction, Visit } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatDate = (date: Date) => format(date, 'dd/MM/yyyy', { locale: ptBR });

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
