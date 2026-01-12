import React from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Flame,
  Thermometer,
  Snowflake,
  CheckCircle,
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
import { differenceInDays, subDays, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DemoDashboard: React.FC = () => {
  const { demoClients, demoInteractions, demoVisits } = useDemo();

  const totalClients = demoClients.length;
  const recentLeads = demoClients.filter(c => differenceInDays(new Date(), c.dataCadastro) <= 60).length;
  const inactiveClients = demoClients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) > 15).length;
  
  const temperatureData = [
    { name: 'Quente', value: demoClients.filter(c => c.temperatura === 'quente').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Morno', value: demoClients.filter(c => c.temperatura === 'morno').length, color: 'hsl(32, 95%, 55%)' },
    { name: 'Frio', value: demoClients.filter(c => c.temperatura === 'frio').length, color: 'hsl(200, 70%, 50%)' },
  ];

  const statusData = [
    { name: 'Em Jornada', value: demoClients.filter(c => c.statusJornada === 'em_jornada').length, color: 'hsl(220, 70%, 45%)' },
    { name: 'Pausa', value: demoClients.filter(c => c.statusJornada === 'pausa').length, color: 'hsl(45, 93%, 47%)' },
    { name: 'Desistiu', value: demoClients.filter(c => c.statusJornada === 'desistiu').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Comprou Comigo', value: demoClients.filter(c => c.statusJornada === 'comprou_comigo').length, color: 'hsl(142, 72%, 40%)' },
    { name: 'Concorrência', value: demoClients.filter(c => c.statusJornada === 'comprou_concorrencia').length, color: 'hsl(220, 15%, 45%)' },
  ];

  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const activityData = last30Days.map(day => {
    const dayInteractions = demoInteractions.filter(i => isSameDay(i.data, day)).length;
    const dayVisits = demoVisits.filter(v => isSameDay(v.data, day)).length;
    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      interacoes: dayInteractions,
      visitas: dayVisits,
    };
  });

  const oxygenated = demoClients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) <= 7).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da carteira de demonstração</p>
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
                  <linearGradient id="colorInteracoesDemo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 70%, 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(220, 70%, 45%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitasDemo" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorInteracoesDemo)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="visitas" 
                  name="Visitas"
                  stroke="hsl(32, 95%, 55%)" 
                  fillOpacity={1} 
                  fill="url(#colorVisitasDemo)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoDashboard;
