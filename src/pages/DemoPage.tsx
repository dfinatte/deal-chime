import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Flame,
  Thermometer,
  Snowflake,
  CheckCircle,
  XCircle,
  Pause,
  Target,
  Eye,
  ArrowLeft,
  Lock,
  Building2
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

const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoClients, demoInteractions, demoVisits, disableDemoMode } = useDemo();

  const handleExit = () => {
    disableDemoMode();
    navigate('/');
  };

  const handleStartTrial = () => {
    disableDemoMode();
    navigate('/registro');
  };

  // Calculate metrics using demo data
  const totalClients = demoClients.length;
  const recentLeads = demoClients.filter(c => differenceInDays(new Date(), c.dataCadastro) <= 60).length;
  const inactiveClients = demoClients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) > 15).length;
  
  // Temperature distribution
  const temperatureData = [
    { name: 'Quente', value: demoClients.filter(c => c.temperatura === 'quente').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Morno', value: demoClients.filter(c => c.temperatura === 'morno').length, color: 'hsl(32, 95%, 55%)' },
    { name: 'Frio', value: demoClients.filter(c => c.temperatura === 'frio').length, color: 'hsl(200, 70%, 50%)' },
  ];

  // Status distribution
  const statusData = [
    { name: 'Em Jornada', value: demoClients.filter(c => c.statusJornada === 'em_jornada').length, color: 'hsl(220, 70%, 45%)' },
    { name: 'Pausa', value: demoClients.filter(c => c.statusJornada === 'pausa').length, color: 'hsl(45, 93%, 47%)' },
    { name: 'Desistiu', value: demoClients.filter(c => c.statusJornada === 'desistiu').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Comprou Comigo', value: demoClients.filter(c => c.statusJornada === 'comprou_comigo').length, color: 'hsl(142, 72%, 40%)' },
    { name: 'Concorrência', value: demoClients.filter(c => c.statusJornada === 'comprou_concorrencia').length, color: 'hsl(220, 15%, 45%)' },
  ];

  // Channel distribution
  const channelData = demoClients.reduce((acc, client) => {
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
    const dayInteractions = demoInteractions.filter(i => isSameDay(i.data, day)).length;
    const dayVisits = demoVisits.filter(v => isSameDay(v.data, day)).length;
    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      interacoes: dayInteractions,
      visitas: dayVisits,
    };
  });

  // Health analysis
  const oxygenated = demoClients.filter(c => differenceInDays(new Date(), c.ultimaAtualizacao) <= 7).length;
  const needsAttention = demoClients.filter(c => {
    const days = differenceInDays(new Date(), c.ultimaAtualizacao);
    return days > 7 && days <= 15;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <span className="font-medium">Modo Demonstração</span>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              Dados fictícios
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleExit}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              size="sm" 
              onClick={handleStartTrial}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Começar Teste Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Demo */}
      <aside className="fixed left-0 top-12 bottom-0 w-64 bg-card border-r p-4 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-display font-bold">CRM Imobiliário</span>
            <p className="text-xs text-muted-foreground">Imobiliária Demo</p>
          </div>
        </div>

        <nav className="space-y-2">
          <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium flex items-center gap-3">
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </div>
          <div className="px-3 py-2 rounded-lg text-muted-foreground flex items-center gap-3 cursor-not-allowed">
            <Users className="w-4 h-4" />
            Clientes
            <Lock className="w-3 h-3 ml-auto" />
          </div>
          <div className="px-3 py-2 rounded-lg text-muted-foreground flex items-center gap-3 cursor-not-allowed">
            <Calendar className="w-4 h-4" />
            Cadastro
            <Lock className="w-3 h-3 ml-auto" />
          </div>
        </nav>

        <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium mb-2">💡 Dica</h4>
          <p className="text-sm text-muted-foreground">
            Crie sua conta para cadastrar seus próprios leads e ter acesso completo a todas as funcionalidades.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16 p-6">
        <div className="space-y-6">
          {/* Demo Alert */}
          <Alert className="bg-secondary/10 border-secondary/20">
            <Eye className="h-4 w-4 text-secondary" />
            <AlertDescription className="text-foreground">
              <strong>Você está visualizando uma carteira de demonstração.</strong> Estes são dados fictícios 
              para mostrar como o CRM funciona. Crie sua conta para gerenciar seus próprios clientes.
            </AlertDescription>
          </Alert>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral da carteira de demonstração</p>
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

          {/* CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-display font-bold mb-4">
                Gostou do que viu?
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Comece seu teste gratuito de 14 dias e gerencie sua própria carteira de clientes 
                com todas as funcionalidades do CRM Imobiliário.
              </p>
              <Button 
                size="lg" 
                onClick={handleStartTrial}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Criar Minha Conta Grátis
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DemoPage;
