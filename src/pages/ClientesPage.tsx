import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Filter, 
  Flame, 
  Thermometer, 
  Snowflake, 
  ChevronRight,
  AlertTriangle,
  Phone,
  Calendar
} from 'lucide-react';
import { Client, Temperature, JourneyStatus } from '@/types';

const ClientesPage: React.FC = () => {
  const { clients, loading } = useClients();
  const [search, setSearch] = useState('');
  const [filterTemp, setFilterTemp] = useState<Temperature | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<JourneyStatus | 'all'>('all');

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.nome.toLowerCase().includes(search.toLowerCase()) ||
      client.telefone.includes(search);
    const matchesTemp = filterTemp === 'all' || client.temperatura === filterTemp;
    const matchesStatus = filterStatus === 'all' || client.statusJornada === filterStatus;
    return matchesSearch && matchesTemp && matchesStatus;
  });

  const getTemperaturaIcon = (temp: Temperature) => {
    switch (temp) {
      case 'quente':
        return <Flame className="w-4 h-4" />;
      case 'morno':
        return <Thermometer className="w-4 h-4" />;
      case 'frio':
        return <Snowflake className="w-4 h-4" />;
    }
  };

  const getTemperaturaBadge = (temp: Temperature) => {
    const styles = {
      quente: 'status-hot',
      morno: 'status-warm',
      frio: 'status-cold',
    };
    return (
      <Badge variant="outline" className={cn('gap-1', styles[temp])}>
        {getTemperaturaIcon(temp)}
        {temp.charAt(0).toUpperCase() + temp.slice(1)}
      </Badge>
    );
  };

  const getStatusLabel = (status: JourneyStatus) => {
    const labels: Record<JourneyStatus, { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      em_jornada: { text: 'Em Jornada', variant: 'default' },
      pausa: { text: 'Pausa', variant: 'secondary' },
      desistiu: { text: 'Desistiu', variant: 'destructive' },
      comprou_comigo: { text: 'Comprou Comigo', variant: 'default' },
      comprou_concorrencia: { text: 'Concorrência', variant: 'outline' },
    };
    return labels[status];
  };

  const isInactive = (client: Client) => {
    return differenceInDays(new Date(), client.ultimaAtualizacao) > 15;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            {clients.length} clientes na carteira
          </p>
        </div>
        <Link to="/cadastro">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTemp} onValueChange={(v) => setFilterTemp(v as Temperature | 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="quente">🔥 Quente</SelectItem>
                <SelectItem value="morno">🌡️ Morno</SelectItem>
                <SelectItem value="frio">❄️ Frio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as JourneyStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="em_jornada">Em Jornada</SelectItem>
                <SelectItem value="pausa">Pausa</SelectItem>
                <SelectItem value="desistiu">Desistiu</SelectItem>
                <SelectItem value="comprou_comigo">Comprou Comigo</SelectItem>
                <SelectItem value="comprou_concorrencia">Concorrência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p>Nenhum cliente encontrado</p>
              <Link to="/cadastro" className="mt-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar primeiro lead
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Visitas</TableHead>
                    <TableHead className="hidden lg:table-cell">Última Atualização</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const inactive = isInactive(client);
                    const statusInfo = getStatusLabel(client.statusJornada);
                    
                    return (
                      <TableRow 
                        key={client.id} 
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          inactive && "bg-destructive/5"
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {inactive && (
                              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium">{client.nome}</p>
                              <p className="text-sm text-muted-foreground md:hidden flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.telefone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {client.telefone}
                        </TableCell>
                        <TableCell>
                          {getTemperaturaBadge(client.temperatura)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline">{client.qtdeVisitas}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(client.ultimaAtualizacao, 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/cliente/${client.id}`}>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesPage;
