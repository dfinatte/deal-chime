import React from 'react';
import { TeamMember, Client } from '@/types';
import { useClients } from '@/hooks/useClients';
import { useInteractions } from '@/hooks/useInteractions';
import { useVisits } from '@/hooks/useVisits';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Phone,
  Download,
  Flame,
  Thermometer,
  Snowflake,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { exportToExcel } from '@/utils/export';

interface CorretorDetailDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CorretorDetailDialog: React.FC<CorretorDetailDialogProps> = ({ 
  member, 
  open, 
  onOpenChange 
}) => {
  const { clients: allClients } = useClients();
  const { interactions: allInteractions } = useInteractions();
  const { visits: allVisits } = useVisits();

  if (!member) return null;

  // Filtrar dados do corretor
  const clients = allClients.filter(c => c.corretorId === member.id);
  const interactions = allInteractions.filter(i => i.corretorId === member.id);
  const visits = allVisits.filter(v => v.corretorId === member.id);

  // Métricas
  const totalClientes = clients.length;
  const clientesAtivos = clients.filter(c => c.statusJornada === 'em_jornada').length;
  const conversoes = clients.filter(c => c.statusJornada === 'comprou_comigo').length;
  const taxaConversao = totalClientes > 0 ? ((conversoes / totalClientes) * 100).toFixed(1) : 0;
  const totalVisitas = visits.length;
  const totalInteracoes = interactions.length;

  // Temperatura
  const temperatureData = [
    { name: 'Quente', value: clients.filter(c => c.temperatura === 'quente').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Morno', value: clients.filter(c => c.temperatura === 'morno').length, color: 'hsl(32, 95%, 55%)' },
    { name: 'Frio', value: clients.filter(c => c.temperatura === 'frio').length, color: 'hsl(200, 70%, 50%)' },
  ];

  // Status
  const statusData = [
    { name: 'Em Jornada', value: clients.filter(c => c.statusJornada === 'em_jornada').length },
    { name: 'Pausa', value: clients.filter(c => c.statusJornada === 'pausa').length },
    { name: 'Desistiu', value: clients.filter(c => c.statusJornada === 'desistiu').length },
    { name: 'Vendido', value: clients.filter(c => c.statusJornada === 'comprou_comigo').length },
    { name: 'Concorrência', value: clients.filter(c => c.statusJornada === 'comprou_concorrencia').length },
  ].filter(s => s.value > 0);

  const handleExportCorretor = () => {
    exportToExcel(clients, interactions, visits);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">
                {member.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span>{member.nome}</span>
              <p className="text-sm font-normal text-muted-foreground">{member.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{totalClientes}</p>
                    <p className="text-xs text-muted-foreground">Clientes</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 mx-auto text-success mb-1" />
                    <p className="text-2xl font-bold">{taxaConversao}%</p>
                    <p className="text-xs text-muted-foreground">Conversão</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Calendar className="w-5 h-5 mx-auto text-secondary mb-1" />
                    <p className="text-2xl font-bold">{totalVisitas}</p>
                    <p className="text-xs text-muted-foreground">Visitas</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Phone className="w-5 h-5 mx-auto text-warning mb-1" />
                    <p className="text-2xl font-bold">{totalInteracoes}</p>
                    <p className="text-xs text-muted-foreground">Interações</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="clients">Clientes</TabsTrigger>
                <TabsTrigger value="activity">Atividade</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gráfico de Temperatura */}
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-4">Temperatura dos Leads</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={temperatureData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {temperatureData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Flame className="w-3 h-3 text-hot" />
                          {temperatureData[0].value}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Thermometer className="w-3 h-3 text-warm" />
                          {temperatureData[1].value}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Snowflake className="w-3 h-3 text-cold" />
                          {temperatureData[2].value}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gráfico de Status */}
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-4">Status da Jornada</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statusData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(220, 70%, 50%)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleExportCorretor} className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Dados
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="clients" className="mt-4">
                {clients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum cliente cadastrado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Temperatura</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Visitas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.slice(0, 10).map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.nome}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                client.temperatura === 'quente' ? 'border-hot text-hot' :
                                client.temperatura === 'morno' ? 'border-warm text-warm' :
                                'border-cold text-cold'
                              }
                            >
                              {client.temperatura}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{client.statusJornada.replace(/_/g, ' ')}</span>
                          </TableCell>
                          <TableCell>{client.qtdeVisitas}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">Últimas Interações</h4>
                      {interactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma interação</p>
                      ) : (
                        <div className="space-y-2">
                          {interactions.slice(0, 5).map((interaction) => (
                            <div key={interaction.id} className="flex items-center gap-3 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {interaction.meio}
                              </Badge>
                              <span className="truncate flex-1">{interaction.resumo}</span>
                              <span className="text-muted-foreground text-xs">
                                {format(interaction.data, 'dd/MM', { locale: ptBR })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">Últimas Visitas</h4>
                      {visits.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma visita</p>
                      ) : (
                        <div className="space-y-2">
                          {visits.slice(0, 5).map((visit) => (
                            <div key={visit.id} className="flex items-center gap-3 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {visit.codigoImovel}
                              </Badge>
                              <span className="truncate flex-1">{visit.enderecoImovel}</span>
                              <span className="text-muted-foreground text-xs">
                                {format(visit.data, 'dd/MM', { locale: ptBR })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CorretorDetailDialog;
