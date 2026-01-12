import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useClients } from '@/hooks/useClients';
import { useInteractions } from '@/hooks/useInteractions';
import { useVisits } from '@/hooks/useVisits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Phone, 
  Calendar, 
  MapPin, 
  Wallet, 
  MessageSquare,
  Plus,
  Flame,
  Thermometer,
  Snowflake,
  AlertTriangle,
  Edit,
  Save,
  X,
  Clock,
  Home,
  MessageCircle,
  PhoneCall,
  Mail,
  Users,
  Trash2
} from 'lucide-react';
import { Client, Temperature, JourneyStatus, Interaction, Visit } from '@/types';

const ClienteDetalhePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateClient, deleteClient } = useClients();
  const { interactions, addInteraction, deleteInteraction } = useInteractions(id);
  const { visits, addVisit, deleteVisit } = useVisits(id);
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Client>>({});
  
  // Dialog states
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  
  // Form states
  const [newInteraction, setNewInteraction] = useState({
    data: new Date().toISOString().split('T')[0],
    meio: 'whatsapp' as Interaction['meio'],
    resumo: '',
  });
  
  const [newVisit, setNewVisit] = useState({
    data: new Date().toISOString().split('T')[0],
    codigoImovel: '',
    enderecoImovel: '',
    feedback: '',
  });

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'clients', id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setClient({
          id: doc.id,
          nome: data.nome,
          telefone: data.telefone,
          dataCadastro: data.dataCadastro?.toDate() || new Date(),
          dataChegada: data.dataChegada?.toDate() || new Date(),
          canal: data.canal,
          perfilBusca: data.perfilBusca,
          budget: data.budget,
          observacoes: data.observacoes,
          temperatura: data.temperatura,
          statusJornada: data.statusJornada,
          ultimaAtualizacao: data.ultimaAtualizacao?.toDate() || new Date(),
          qtdeVisitas: data.qtdeVisitas || 0,
          corretorId: data.corretorId,
          companyId: data.companyId || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id]);

  const handleEdit = () => {
    if (client) {
      setEditData(client);
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!id || !editData) return;
    
    try {
      await updateClient(id, editData);
      toast.success('Cliente atualizado!');
      setEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteClient(id);
        toast.success('Cliente excluído');
        navigate('/clientes');
      } catch (error) {
        toast.error('Erro ao excluir');
      }
    }
  };

  const handleAddInteraction = async () => {
    if (!id || !newInteraction.resumo) {
      toast.error('Preencha o resumo da interação');
      return;
    }

    try {
      await addInteraction({
        clientId: id,
        data: new Date(newInteraction.data),
        meio: newInteraction.meio,
        resumo: newInteraction.resumo,
      });
      toast.success('Interação registrada!');
      setInteractionOpen(false);
      setNewInteraction({
        data: new Date().toISOString().split('T')[0],
        meio: 'whatsapp',
        resumo: '',
      });
    } catch (error) {
      toast.error('Erro ao registrar interação');
    }
  };

  const handleAddVisit = async () => {
    if (!id || !newVisit.codigoImovel) {
      toast.error('Preencha o código do imóvel');
      return;
    }

    try {
      await addVisit({
        clientId: id,
        data: new Date(newVisit.data),
        codigoImovel: newVisit.codigoImovel,
        enderecoImovel: newVisit.enderecoImovel,
        feedback: newVisit.feedback,
      });
      toast.success('Visita registrada!');
      setVisitOpen(false);
      setNewVisit({
        data: new Date().toISOString().split('T')[0],
        codigoImovel: '',
        enderecoImovel: '',
        feedback: '',
      });
    } catch (error) {
      toast.error('Erro ao registrar visita');
    }
  };

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

  const getMeioIcon = (meio: Interaction['meio']) => {
    switch (meio) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'ligacao':
        return <PhoneCall className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'presencial':
        return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Cliente não encontrado</p>
          <Button onClick={() => navigate('/clientes')} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const isInactive = differenceInDays(new Date(), client.ultimaAtualizacao) > 15;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">{client.nome}</h1>
            {isInactive && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Inativo
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {client.telefone}
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {getTemperaturaIcon(client.temperatura)}
              <span className="text-sm text-muted-foreground">Temperatura</span>
            </div>
            {editing ? (
              <Select
                value={editData.temperatura}
                onValueChange={(v) => setEditData({ ...editData, temperatura: v as Temperature })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quente">Quente</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="frio">Frio</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="font-semibold capitalize mt-1">{client.temperatura}</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Status</span>
            </div>
            {editing ? (
              <Select
                value={editData.statusJornada}
                onValueChange={(v) => setEditData({ ...editData, statusJornada: v as JourneyStatus })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_jornada">Em Jornada</SelectItem>
                  <SelectItem value="pausa">Pausa</SelectItem>
                  <SelectItem value="desistiu">Desistiu</SelectItem>
                  <SelectItem value="comprou_comigo">Comprou Comigo</SelectItem>
                  <SelectItem value="comprou_concorrencia">Concorrência</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="font-semibold mt-1">
                {client.statusJornada.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Visitas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{client.qtdeVisitas}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Última Atualização</span>
            </div>
            <p className="font-semibold mt-1">
              {format(client.ultimaAtualizacao, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({interactions.length})</TabsTrigger>
          <TabsTrigger value="visitas">Visitas ({visits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Canal de Origem</Label>
                  {editing ? (
                    <Input
                      value={editData.canal || ''}
                      onChange={(e) => setEditData({ ...editData, canal: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{client.canal || '-'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Chegada</Label>
                  <p className="font-medium">
                    {format(client.dataChegada, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Perfil de Busca</Label>
                {editing ? (
                  <Textarea
                    value={editData.perfilBusca || ''}
                    onChange={(e) => setEditData({ ...editData, perfilBusca: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{client.perfilBusca || '-'}</p>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Budget</Label>
                {editing ? (
                  <Input
                    value={editData.budget || ''}
                    onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{client.budget || '-'}</p>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Observações</Label>
                {editing ? (
                  <Textarea
                    value={editData.observacoes || ''}
                    onChange={(e) => setEditData({ ...editData, observacoes: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{client.observacoes || '-'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Contatos</CardTitle>
                <CardDescription>Timeline de interações com o cliente</CardDescription>
              </div>
              <Dialog open={interactionOpen} onOpenChange={setInteractionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Interação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Interação</DialogTitle>
                    <DialogDescription>
                      Adicione um novo registro de contato com o cliente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={newInteraction.data}
                          onChange={(e) => setNewInteraction({ ...newInteraction, data: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Meio</Label>
                        <Select
                          value={newInteraction.meio}
                          onValueChange={(v) => setNewInteraction({ ...newInteraction, meio: v as Interaction['meio'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="ligacao">Ligação</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="presencial">Presencial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Resumo</Label>
                      <Textarea
                        placeholder="Descreva o que foi conversado..."
                        value={newInteraction.resumo}
                        onChange={(e) => setNewInteraction({ ...newInteraction, resumo: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddInteraction} className="w-full">
                      Salvar Interação
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {interactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma interação registrada
                </p>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getMeioIcon(interaction.meio)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {interaction.meio.charAt(0).toUpperCase() + interaction.meio.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(interaction.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm">{interaction.resumo}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteInteraction(interaction.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitas">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Controle de Visitas</CardTitle>
                <CardDescription>Imóveis visitados pelo cliente</CardDescription>
              </div>
              <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Visita
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Visita</DialogTitle>
                    <DialogDescription>
                      Adicione um novo imóvel visitado
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={newVisit.data}
                          onChange={(e) => setNewVisit({ ...newVisit, data: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Código do Imóvel</Label>
                        <Input
                          placeholder="Ex: AP-12345"
                          value={newVisit.codigoImovel}
                          onChange={(e) => setNewVisit({ ...newVisit, codigoImovel: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input
                        placeholder="Endereço do imóvel"
                        value={newVisit.enderecoImovel}
                        onChange={(e) => setNewVisit({ ...newVisit, enderecoImovel: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Feedback do Cliente</Label>
                      <Textarea
                        placeholder="O que o cliente achou do imóvel..."
                        value={newVisit.feedback}
                        onChange={(e) => setNewVisit({ ...newVisit, feedback: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddVisit} className="w-full">
                      Salvar Visita
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {visits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma visita registrada
                </p>
              ) : (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Home className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{visit.codigoImovel}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(visit.data, 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        {visit.enderecoImovel && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3" />
                            {visit.enderecoImovel}
                          </p>
                        )}
                        {visit.feedback && (
                          <p className="text-sm mt-2 p-2 bg-background rounded border">
                            {visit.feedback}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteVisit(visit.id, visit.clientId)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClienteDetalhePage;
