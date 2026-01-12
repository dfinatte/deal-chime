import React from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3,
  TrendingUp,
  Target,
  Users,
  DollarSign
} from 'lucide-react';
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
  Legend
} from 'recharts';
import { differenceInDays } from 'date-fns';

const DemoAnalises: React.FC = () => {
  const { demoClients, demoInteractions, demoVisits } = useDemo();

  // Channel analysis
  const channelData = demoClients.reduce((acc, client) => {
    const channel = client.canal || 'Outros';
    const existing = acc.find(item => item.name === channel);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: channel, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  // Conversion analysis
  const totalClients = demoClients.length;
  const closedDeals = demoClients.filter(c => c.statusJornada === 'comprou_comigo').length;
  const lostToCompetition = demoClients.filter(c => c.statusJornada === 'comprou_concorrencia').length;
  const inJourney = demoClients.filter(c => c.statusJornada === 'em_jornada').length;
  const conversionRate = totalClients > 0 ? ((closedDeals / totalClients) * 100).toFixed(1) : 0;

  const conversionData = [
    { name: 'Fechados', value: closedDeals, color: 'hsl(142, 72%, 40%)' },
    { name: 'Em Jornada', value: inJourney, color: 'hsl(220, 70%, 45%)' },
    { name: 'Concorrência', value: lostToCompetition, color: 'hsl(0, 72%, 51%)' },
    { name: 'Outros', value: totalClients - closedDeals - inJourney - lostToCompetition, color: 'hsl(220, 15%, 45%)' },
  ];

  // Activity metrics
  const totalInteractions = demoInteractions.length;
  const totalVisits = demoVisits.length;
  const avgVisitsPerClient = totalClients > 0 ? (totalVisits / totalClients).toFixed(1) : 0;

  // Health metrics
  const oxygenated = demoClients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) <= 7).length;
  const needsAttention = demoClients.filter(c => {
    const days = differenceInDays(new Date(), c.ultimaAtualizacao);
    return days > 7 && days <= 15;
  }).length;
  const inactive = demoClients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) > 15).length;

  const healthData = [
    { name: 'Oxigenados (≤7d)', value: oxygenated, color: 'hsl(142, 72%, 40%)' },
    { name: 'Atenção (8-15d)', value: needsAttention, color: 'hsl(45, 93%, 47%)' },
    { name: 'Inativos (+15d)', value: inactive, color: 'hsl(0, 72%, 51%)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Análises
        </h1>
        <p className="text-muted-foreground">Métricas e insights da carteira de demonstração</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-3xl font-display font-bold text-success">{conversionRate}%</p>
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
                <p className="text-sm text-muted-foreground">Negócios Fechados</p>
                <p className="text-3xl font-display font-bold">{closedDeals}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interações</p>
                <p className="text-3xl font-display font-bold">{totalInteractions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Visitas/Cliente</p>
                <p className="text-3xl font-display font-bold">{avgVisitsPerClient}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warm/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Canais de Origem</CardTitle>
            <CardDescription>De onde vêm seus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical">
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
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Status dos clientes na carteira</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
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
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Saúde da Carteira</CardTitle>
            <CardDescription>Distribuição por tempo desde última interação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {healthData.map((item) => (
                <div key={item.name} className="p-4 rounded-lg border" style={{ borderColor: item.color }}>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                  <p className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalClients > 0 ? ((item.value / totalClients) * 100).toFixed(0) : 0}% do total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoAnalises;
