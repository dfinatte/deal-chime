import React from 'react';
import { useClients } from '@/hooks/useClients';
import { useInteractions } from '@/hooks/useInteractions';
import { useVisits } from '@/hooks/useVisits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users,
  ArrowDown,
  Calendar,
  Filter
} from 'lucide-react';
import { differenceInDays, subDays, startOfMonth, endOfMonth, eachMonthOfInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AnalisesPage: React.FC = () => {
  const { clients } = useClients();
  const { interactions } = useInteractions();
  const { visits } = useVisits();

  // Funil de vendas
  const funnelData = [
    { 
      name: 'Leads Captados', 
      value: clients.length, 
      fill: 'hsl(220, 70%, 50%)',
      percentage: 100
    },
    { 
      name: 'Em Jornada', 
      value: clients.filter(c => c.statusJornada === 'em_jornada').length, 
      fill: 'hsl(200, 70%, 50%)',
      percentage: clients.length > 0 
        ? Math.round((clients.filter(c => c.statusJornada === 'em_jornada').length / clients.length) * 100) 
        : 0
    },
    { 
      name: 'Quentes', 
      value: clients.filter(c => c.temperatura === 'quente').length, 
      fill: 'hsl(32, 95%, 55%)',
      percentage: clients.length > 0 
        ? Math.round((clients.filter(c => c.temperatura === 'quente').length / clients.length) * 100) 
        : 0
    },
    { 
      name: 'Com Visitas', 
      value: clients.filter(c => c.qtdeVisitas > 0).length, 
      fill: 'hsl(142, 72%, 40%)',
      percentage: clients.length > 0 
        ? Math.round((clients.filter(c => c.qtdeVisitas > 0).length / clients.length) * 100) 
        : 0
    },
    { 
      name: 'Fechados', 
      value: clients.filter(c => c.statusJornada === 'comprou_comigo').length, 
      fill: 'hsl(142, 72%, 30%)',
      percentage: clients.length > 0 
        ? Math.round((clients.filter(c => c.statusJornada === 'comprou_comigo').length / clients.length) * 100) 
        : 0
    },
  ];

  // Taxa de conversão
  const totalLeads = clients.length;
  const conversoes = clients.filter(c => c.statusJornada === 'comprou_comigo').length;
  const taxaConversao = totalLeads > 0 ? ((conversoes / totalLeads) * 100).toFixed(1) : 0;

  // Leads perdidos
  const perdidos = clients.filter(c => 
    c.statusJornada === 'desistiu' || c.statusJornada === 'comprou_concorrencia'
  ).length;
  const taxaPerda = totalLeads > 0 ? ((perdidos / totalLeads) * 100).toFixed(1) : 0;

  // Tempo médio de conversão
  const clientesConvertidos = clients.filter(c => c.statusJornada === 'comprou_comigo');
  const tempoMedioConversao = clientesConvertidos.length > 0
    ? Math.round(
        clientesConvertidos.reduce((acc, c) => 
          acc + differenceInDays(c.ultimaAtualizacao, c.dataCadastro), 0
        ) / clientesConvertidos.length
      )
    : 0;

  // Performance mensal (últimos 6 meses)
  const last6Months = eachMonthOfInterval({
    start: subDays(new Date(), 180),
    end: new Date()
  });

  const monthlyPerformance = last6Months.map(month => {
    const startMonth = startOfMonth(month);
    const endMonth = endOfMonth(month);
    
    const novosLeads = clients.filter(c => 
      c.dataCadastro >= startMonth && c.dataCadastro <= endMonth
    ).length;
    
    const fechamentos = clients.filter(c => 
      c.statusJornada === 'comprou_comigo' &&
      c.ultimaAtualizacao >= startMonth && c.ultimaAtualizacao <= endMonth
    ).length;

    return {
      mes: format(month, 'MMM', { locale: ptBR }),
      leads: novosLeads,
      fechamentos: fechamentos,
    };
  });

  // Canais mais efetivos
  const canalEfetividade = clients.reduce((acc, client) => {
    const canal = client.canal || 'Outros';
    if (!acc[canal]) {
      acc[canal] = { total: 0, convertidos: 0 };
    }
    acc[canal].total++;
    if (client.statusJornada === 'comprou_comigo') {
      acc[canal].convertidos++;
    }
    return acc;
  }, {} as Record<string, { total: number; convertidos: number }>);

  const canalData = Object.entries(canalEfetividade)
    .map(([canal, data]) => ({
      name: canal,
      total: data.total,
      convertidos: data.convertidos,
      taxa: data.total > 0 ? Math.round((data.convertidos / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Distribuição por temperatura
  const temperatureDistribution = [
    { name: 'Quente', value: clients.filter(c => c.temperatura === 'quente').length, fill: 'hsl(0, 72%, 51%)' },
    { name: 'Morno', value: clients.filter(c => c.temperatura === 'morno').length, fill: 'hsl(32, 95%, 55%)' },
    { name: 'Frio', value: clients.filter(c => c.temperatura === 'frio').length, fill: 'hsl(200, 70%, 50%)' },
  ];

  // Atividade por dia da semana
  const weekdayActivity = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
    const dayInteractions = interactions.filter(i => i.data.getDay() === index).length;
    const dayVisits = visits.filter(v => v.data.getDay() === index).length;
    return {
      dia: day,
      interacoes: dayInteractions,
      visitas: dayVisits,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Análises e Métricas</h1>
        <p className="text-muted-foreground">Insights sobre performance de vendas</p>
      </div>

      {/* KPIs de Conversão */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-3xl font-display font-bold text-success">{taxaConversao}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendas Fechadas</p>
                <p className="text-3xl font-display font-bold">{conversoes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Conversão</p>
                <p className="text-3xl font-display font-bold">{tempoMedioConversao}<span className="text-lg font-normal ml-1">dias</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Perda</p>
                <p className="text-3xl font-display font-bold text-destructive">{taxaPerda}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Vendas */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Funil de Vendas
          </CardTitle>
          <CardDescription>Conversão em cada etapa do processo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visual do Funil */}
            <div className="space-y-3">
              {funnelData.map((stage, index) => (
                <div key={stage.name} className="relative">
                  <div 
                    className="h-14 rounded-lg flex items-center justify-between px-4 transition-all"
                    style={{ 
                      backgroundColor: stage.fill,
                      width: `${100 - (index * 15)}%`,
                      marginLeft: `${index * 7.5}%`,
                    }}
                  >
                    <span className="font-medium text-white text-sm">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {stage.value}
                      </Badge>
                      <span className="text-white/80 text-xs">{stage.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Métricas do Funil */}
            <div className="space-y-4">
              <h4 className="font-medium">Taxas de Conversão Entre Etapas</h4>
              {funnelData.slice(0, -1).map((stage, index) => {
                const nextStage = funnelData[index + 1];
                const conversionRate = stage.value > 0 
                  ? Math.round((nextStage.value / stage.value) * 100) 
                  : 0;
                return (
                  <div key={stage.name} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          {stage.name} → {nextStage.name}
                        </span>
                        <span className="font-medium">{conversionRate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${conversionRate}%`,
                            backgroundColor: nextStage.fill,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Mensal */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Performance Mensal</CardTitle>
            <CardDescription>Leads captados vs fechamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="leads" name="Novos Leads" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fechamentos" name="Fechamentos" fill="hsl(142, 72%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efetividade por Canal */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Efetividade por Canal</CardTitle>
            <CardDescription>Canais com maior taxa de conversão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={canalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'taxa' ? 'Taxa %' : name === 'total' ? 'Total Leads' : 'Convertidos'
                    ]}
                  />
                  <Bar dataKey="total" name="Total" fill="hsl(220, 70%, 50%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="convertidos" name="Convertidos" fill="hsl(142, 72%, 40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda Row de Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Temperatura */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Distribuição de Leads</CardTitle>
            <CardDescription>Por temperatura atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={temperatureDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {temperatureDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} leads`, '']}
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
          </CardContent>
        </Card>

        {/* Atividade por Dia da Semana */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Atividade por Dia</CardTitle>
            <CardDescription>Melhores dias para contato</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekdayActivity}>
                  <defs>
                    <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" />
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
                    stroke="hsl(220, 70%, 50%)" 
                    fillOpacity={1} 
                    fill="url(#colorInt)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitas" 
                    name="Visitas"
                    stroke="hsl(142, 72%, 40%)" 
                    fillOpacity={1} 
                    fill="url(#colorVis)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalisesPage;
