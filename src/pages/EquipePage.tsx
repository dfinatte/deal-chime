import React, { useState } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/contexts/AuthContext';
import { useClients } from '@/hooks/useClients';
import { useInteractions } from '@/hooks/useInteractions';
import { useVisits } from '@/hooks/useVisits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  ShieldCheck,
  UserCog,
  Trash2,
  Eye,
  EyeOff,
  Download,
  TrendingUp,
  Target,
  Calendar,
  Phone,
  Bell,
  BarChart3
} from 'lucide-react';
import { UserRole, TeamMember } from '@/types';
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
  Legend,
} from 'recharts';
import { exportToExcel } from '@/utils/export';
import CorretorDetailDialog from '@/components/team/CorretorDetailDialog';
import SendNotificationDialog from '@/components/notifications/SendNotificationDialog';

const EquipePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { members, loading, addMember, toggleMemberStatus, deleteMember } = useTeam();
  const { clients } = useClients();
  const { interactions } = useInteractions();
  const { visits } = useVisits();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'corretor' as UserRole,
  });
  const [formLoading, setFormLoading] = useState(false);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular métricas por corretor
  const corretorMetrics = members.map(member => {
    const memberClients = clients.filter(c => c.corretorId === member.id);
    const memberInteractions = interactions.filter(i => i.corretorId === member.id);
    const memberVisits = visits.filter(v => v.corretorId === member.id);
    const conversoes = memberClients.filter(c => c.statusJornada === 'comprou_comigo').length;
    
    return {
      ...member,
      totalClientes: memberClients.length,
      totalInteracoes: memberInteractions.length,
      totalVisitas: memberVisits.length,
      conversoes,
      taxaConversao: memberClients.length > 0 
        ? ((conversoes / memberClients.length) * 100).toFixed(1) 
        : '0',
    };
  });

  // Gráfico de performance da equipe
  const performanceData = corretorMetrics
    .filter(m => m.role === 'corretor')
    .map(m => ({
      nome: m.nome.split(' ')[0],
      clientes: m.totalClientes,
      visitas: m.totalVisitas,
      conversoes: m.conversoes,
    }))
    .slice(0, 6);

  // Status geral da equipe
  const totalClientesEquipe = clients.length;
  const totalConversoes = clients.filter(c => c.statusJornada === 'comprou_comigo').length;
  const taxaConversaoEquipe = totalClientesEquipe > 0 
    ? ((totalConversoes / totalClientesEquipe) * 100).toFixed(1) 
    : 0;

  // Distribuição de clientes por corretor
  const clientesDistribution = corretorMetrics
    .filter(m => m.role === 'corretor' && m.totalClientes > 0)
    .map(m => ({
      name: m.nome.split(' ')[0],
      value: m.totalClientes,
    }));

  const COLORS = ['hsl(220, 70%, 50%)', 'hsl(32, 95%, 55%)', 'hsl(142, 72%, 40%)', 'hsl(0, 72%, 51%)', 'hsl(280, 70%, 50%)'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.senha) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setFormLoading(true);

    try {
      await addMember(formData);
      toast.success('Membro adicionado com sucesso!');
      setDialogOpen(false);
      setFormData({ nome: '', email: '', senha: '', role: 'corretor' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar membro');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleMemberStatus(id, !currentStatus);
      toast.success(currentStatus ? 'Membro desativado' : 'Membro ativado');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      try {
        await deleteMember(id);
        toast.success('Membro excluído');
      } catch (error) {
        toast.error('Erro ao excluir');
      }
    }
  };

  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
    setDetailDialogOpen(true);
  };

  const handleExportTeam = () => {
    exportToExcel(clients, interactions, visits);
    toast.success('Dados exportados!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão da Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os corretores e administradores do sistema
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <SendNotificationDialog>
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificar</span>
            </Button>
          </SendNotificationDialog>
          <Button variant="outline" onClick={handleExportTeam} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                <DialogDescription>
                  Cadastre um novo corretor ou administrador no sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corretor">
                        <div className="flex items-center gap-2">
                          <UserCog className="w-4 h-4" />
                          Corretor
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Administrador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? 'Adicionando...' : 'Adicionar Membro'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats da Equipe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
                <p className="text-3xl font-display font-bold">{members.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Total</p>
                <p className="text-3xl font-display font-bold">{totalClientesEquipe}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendas Fechadas</p>
                <p className="text-3xl font-display font-bold text-success">{totalConversoes}</p>
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
                <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                <p className="text-3xl font-display font-bold">{taxaConversaoEquipe}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos da Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance por Corretor */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance por Corretor
            </CardTitle>
            <CardDescription>Clientes, visitas e conversões</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="clientes" name="Clientes" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="visitas" name="Visitas" fill="hsl(32, 95%, 55%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="conversoes" name="Vendas" fill="hsl(142, 72%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Nenhum corretor com dados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Clientes */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Distribuição de Clientes</CardTitle>
            <CardDescription>Por corretor</CardDescription>
          </CardHeader>
          <CardContent>
            {clientesDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientesDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {clientesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            Lista de todos os usuários com acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p>Nenhum membro cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="hidden md:table-cell">Clientes</TableHead>
                    <TableHead className="hidden md:table-cell">Conversão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Desde</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corretorMetrics.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.nome}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                          {member.role === 'admin' ? (
                            <><ShieldCheck className="w-3 h-3 mr-1" /> Admin</>
                          ) : (
                            <><UserCog className="w-3 h-3 mr-1" /> Corretor</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{member.totalClientes}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={member.conversoes > 0 ? 'text-success font-medium' : ''}>
                          {member.taxaConversao}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={member.ativo}
                            onCheckedChange={() => handleToggleStatus(member.id, member.ativo)}
                          />
                          <span className="text-sm hidden sm:inline">
                            {member.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {format(member.createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMember(member)}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(member.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Corretor */}
      <CorretorDetailDialog 
        member={selectedMember}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
};

export default EquipePage;
