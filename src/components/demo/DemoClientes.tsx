import React, { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Flame, 
  Thermometer, 
  Snowflake,
  Users,
  AlertTriangle
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Client } from '@/types';

const DemoClientes: React.FC = () => {
  const { demoClients } = useDemo();
  const [search, setSearch] = useState('');
  const [filterTemperatura, setFilterTemperatura] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredClients = demoClients.filter(client => {
    const matchesSearch = client.nome.toLowerCase().includes(search.toLowerCase()) ||
                          client.telefone.includes(search);
    const matchesTemp = filterTemperatura === 'all' || client.temperatura === filterTemperatura;
    const matchesStatus = filterStatus === 'all' || client.statusJornada === filterStatus;
    return matchesSearch && matchesTemp && matchesStatus;
  });

  const getTemperaturaIcon = (temp: string) => {
    switch (temp) {
      case 'quente': return <Flame className="w-4 h-4 text-hot" />;
      case 'morno': return <Thermometer className="w-4 h-4 text-warm" />;
      case 'frio': return <Snowflake className="w-4 h-4 text-cold" />;
      default: return null;
    }
  };

  const getTemperaturaBadge = (temp: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      quente: 'destructive',
      morno: 'secondary',
      frio: 'outline',
    };
    return (
      <Badge variant={variants[temp] || 'default'} className="gap-1">
        {getTemperaturaIcon(temp)}
        {temp.charAt(0).toUpperCase() + temp.slice(1)}
      </Badge>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      em_jornada: { text: 'Em Jornada', variant: 'default' },
      pausa: { text: 'Pausa', variant: 'secondary' },
      desistiu: { text: 'Desistiu', variant: 'destructive' },
      comprou_comigo: { text: 'Comprou Comigo', variant: 'default' },
      comprou_concorrencia: { text: 'Concorrência', variant: 'outline' },
    };
    const label = labels[status] || { text: status, variant: 'default' as const };
    return <Badge variant={label.variant}>{label.text}</Badge>;
  };

  const isInactive = (client: Client) => {
    return differenceInDays(new Date(), client.ultimaAtualizacao) > 15;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Clientes
          </h1>
          <p className="text-muted-foreground">{filteredClients.length} clientes encontrados</p>
        </div>
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
            <Select value={filterTemperatura} onValueChange={setFilterTemperatura}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="quente">🔥 Quente</SelectItem>
                <SelectItem value="morno">🌡️ Morno</SelectItem>
                <SelectItem value="frio">❄️ Frio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Última Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{client.nome}</span>
                      {isInactive(client) && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.telefone}</TableCell>
                  <TableCell>{getTemperaturaBadge(client.temperatura)}</TableCell>
                  <TableCell>{getStatusLabel(client.statusJornada)}</TableCell>
                  <TableCell>{client.qtdeVisitas}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(client.ultimaAtualizacao, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoClientes;
