import React from 'react';
import { useClients } from '@/hooks/useClients';
import { useInteractions } from '@/hooks/useInteractions';
import { useVisits } from '@/hooks/useVisits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Flame,
  Thermometer,
  Snowflake,
  CheckCircle,
  XCircle,
  Pause,
  Target
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { exportToExcel, exportToGoogleSheets } from '@/utils/export';
import { differenceInDays, subDays, format, startOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage: React.FC = () => {
  const { clients } = useClients();
  const { interactions } = useInteractions();
  const { visits } = useVisits();

  // Calculate metrics
  const totalClients = clients.length;
  const recentLeads = clients.filter(c => differenceInDays(new Date(), c.dataCadastro) <= 60).length;
  const inactiveClients = clients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) > 15).length;
  
  // Temperature distribution
  const temperatureData = [
    { name: 'Quente', value: clients.filter(c => c.temperatura === 'quente').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Morno', value: clients.filter(c => c.temperatura === 'morno').length, color: 'hsl(32, 95%, 55%)' },
    { name: 'Frio', value: clients.filter(c => c.temperatura === 'frio').length, color: 'hsl(200, 70%, 50%)' },
  ];

  // Status distribution
  const statusData = [
    { name: 'Em Jornada', value: clients.filter(c => c.statusJornada === 'em_jornada').length, color: 'hsl(220, 70%, 45%)' },
    { name: 'Pausa', value: clients.filter(c => c.statusJornada === 'pausa').length, color: 'hsl(45, 93%, 47%)' },
    { name: 'Desistiu', value: clients.filter(c => c.statusJornada === 'desistiu').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Comprou Comigo', value: clients.filter(c => c.statusJornada === 'comprou_comigo').length, color: 'hsl(142, 72%, 40%)' },
    { name: 'Concorrência', value: clients.filter(c => c.statusJornada === 'comprou_concorrencia').length, color: 'hsl(220, 15%, 45%)' },
  ];

  // Channel distribution
  const channelData = clients.reduce((acc, client) => {
    const channel = client.canal || 'Outros';
    const existing = acc.find(item => item.name === channel);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: channel, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]).slice(0, 5);

  // Last 30 days activity
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const activityData = last30Days.map(day => {
    const dayInteractions = interactions.filter(i => isSameDay(i.data, day)).length;
    const dayVisits = visits.filter(v => isSameDay(v.data, day)).length;
    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      interacoes: dayInteractions,
      visitas: dayVisits,
    };
  });

  // Health analysis
  const oxygenated = clients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) <= 7).length;
  const needsAttention = clients.filter(c => {
    const days = differenceInDays(new Date(), c.ultimaAtualizacao);
    return days > 7 && days <= 15;
  }).length;

  const handleExportExcel = () => {
    exportToExcel(clients, interactions, visits);
  };

  const handleExportGoogleSheets = () => {
    exportToGoogleSheets(clients, interactions, visits);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua carteira de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportGoogleSheets} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Google Sheets</span>
          </Button>
          <Button onClick={handleExportExcel} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-3xl font-display font-bold">{totalClients}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Recentes (60d)</p>
                <p className="text-3xl font-display font-bold">{recentLeads}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oxigenados (7d)</p>
                <p className="text-3xl font-display font-bold">{oxygenated}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inativos (+15d)</p>
                <p className="text-3xl font-display font-bold text-destructive">{inactiveClients}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-secondary" />
              Temperatura dos Leads
            </CardTitle>
            <CardDescription>Distribuição por nível de interesse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={temperatureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {temperatureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} clientes`, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-hot" />
                <span className="text-sm">{temperatureData[0].value} Quentes</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-warm" />
                <span className="text-sm">{temperatureData[1].value} Mornos</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-cold" />
                <span className="text-sm">{temperatureData[2].value} Frios</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Status da Jornada
            </CardTitle>
            <CardDescription>Distribuição por etapa do funil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} clientes`, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Atividade nos Últimos 30 Dias
          </CardTitle>
          <CardDescription>Interações e visitas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorInteracoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 70%, 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(220, 70%, 45%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="interacoes" 
                  name="Interações"
                  stroke="hsl(220, 70%, 45%)" 
                  fillOpacity={1} 
                  fill="url(#colorInteracoes)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="visitas" 
                  name="Visitas"
                  stroke="hsl(32, 95%, 55%)" 
                  fillOpacity={1} 
                  fill="url(#colorVisitas)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Channel & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Canais de Origem</CardTitle>
            <CardDescription>Top 5 canais de captação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value} leads`, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(220, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Saúde da Carteira</CardTitle>
            <CardDescription>Status de oxigenação dos clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium">Oxigenados (até 7 dias)</span>
              </div>
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                {oxygenated} clientes
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-3">
                <Pause className="w-5 h-5 text-warning" />
                <span className="font-medium">Atenção (8-15 dias)</span>
              </div>
              <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                {needsAttention} clientes
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="font-medium">Inativos (+15 dias)</span>
              </div>
              <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                {inactiveClients} clientes
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
