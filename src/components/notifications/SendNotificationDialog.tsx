import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTeam } from '@/hooks/useTeam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Users, User, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SendNotificationDialogProps {
  children: React.ReactNode;
}

const SendNotificationDialog: React.FC<SendNotificationDialogProps> = ({ children }) => {
  const { sendNotification } = useNotifications();
  const { members } = useTeam();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'info' as 'info' | 'warning' | 'success' | 'error',
    destinatarioId: 'all',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.mensagem) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      await sendNotification(formData);
      toast.success('Notificação enviada!');
      setOpen(false);
      setFormData({
        titulo: '',
        mensagem: '',
        tipo: 'info',
        destinatarioId: 'all',
      });
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  const tipoOptions = [
    { value: 'info', label: 'Informação', icon: Info, color: 'text-primary' },
    { value: 'success', label: 'Sucesso', icon: CheckCircle, color: 'text-success' },
    { value: 'warning', label: 'Aviso', icon: AlertTriangle, color: 'text-warning' },
    { value: 'error', label: 'Urgente', icon: XCircle, color: 'text-destructive' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Notificação</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para toda equipe ou um corretor específico
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Destinatário</Label>
            <Select
              value={formData.destinatarioId}
              onValueChange={(v) => setFormData({ ...formData, destinatarioId: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Toda a Equipe
                  </div>
                </SelectItem>
                {members.filter(m => m.ativo).map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {member.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(v) => setFormData({ ...formData, tipo: v as typeof formData.tipo })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tipoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className={`w-4 h-4 ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              placeholder="Título da notificação"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              placeholder="Digite sua mensagem..."
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Send className="w-4 h-4" />
            {loading ? 'Enviando...' : 'Enviar Notificação'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotificationDialog;
