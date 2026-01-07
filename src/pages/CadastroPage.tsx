import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Phone, MapPin, Wallet, MessageSquare, Calendar, Radio, Save, ArrowLeft } from 'lucide-react';
import { Temperature, JourneyStatus } from '@/types';

const CANAIS = [
  'Indicação',
  'Instagram',
  'Facebook',
  'Google',
  'Portal Imobiliário',
  'WhatsApp',
  'Telefone',
  'Presencial',
  'Outros',
];

const CadastroPage: React.FC = () => {
  const navigate = useNavigate();
  const { addClient } = useClients();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    dataChegada: new Date().toISOString().split('T')[0],
    canal: '',
    perfilBusca: '',
    budget: '',
    observacoes: '',
    temperatura: 'frio' as Temperature,
    statusJornada: 'em_jornada' as JourneyStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      await addClient({
        ...formData,
        dataCadastro: new Date(),
        dataChegada: new Date(formData.dataChegada),
        corretorId: '',
      });
      
      toast.success('Lead cadastrado com sucesso!');
      navigate('/clientes');
    } catch (error) {
      toast.error('Erro ao cadastrar lead');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Novo Lead</h1>
            <p className="text-muted-foreground">Cadastre um novo cliente potencial</p>
          </div>
        </div>

        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Dados do Lead
            </CardTitle>
            <CardDescription>
              Preencha as informações do novo cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Data e Canal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataChegada">Data de Chegada</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dataChegada"
                      type="date"
                      value={formData.dataChegada}
                      onChange={(e) => setFormData({ ...formData, dataChegada: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canal">Canal de Origem</Label>
                  <Select
                    value={formData.canal}
                    onValueChange={(value) => setFormData({ ...formData, canal: value })}
                  >
                    <SelectTrigger>
                      <Radio className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANAIS.map((canal) => (
                        <SelectItem key={canal} value={canal}>
                          {canal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Perfil de Busca */}
              <div className="space-y-2">
                <Label htmlFor="perfilBusca">Perfil de Busca (O que/Onde)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="perfilBusca"
                    placeholder="Ex: Apartamento 2 quartos, próximo ao metrô, região sul..."
                    value={formData.perfilBusca}
                    onChange={(e) => setFormData({ ...formData, perfilBusca: e.target.value })}
                    className="pl-10 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Budget e Temperatura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      placeholder="R$ 000.000 - R$ 000.000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperatura">Temperatura Inicial</Label>
                  <Select
                    value={formData.temperatura}
                    onValueChange={(value) => setFormData({ ...formData, temperatura: value as Temperature })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quente">🔥 Quente</SelectItem>
                      <SelectItem value="morno">🌡️ Morno</SelectItem>
                      <SelectItem value="frio">❄️ Frio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status da Jornada</Label>
                <Select
                  value={formData.statusJornada}
                  onValueChange={(value) => setFormData({ ...formData, statusJornada: value as JourneyStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_jornada">📍 Em Jornada</SelectItem>
                    <SelectItem value="pausa">⏸️ Pausa</SelectItem>
                    <SelectItem value="desistiu">❌ Desistiu</SelectItem>
                    <SelectItem value="comprou_comigo">✅ Comprou Comigo</SelectItem>
                    <SelectItem value="comprou_concorrencia">🏢 Comprou na Concorrência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="observacoes"
                    placeholder="Anotações importantes sobre o cliente..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="pl-10 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? 'Salvando...' : 'Salvar Lead'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastroPage;
