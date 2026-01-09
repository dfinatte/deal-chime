import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentReceipt {
  id: string;
  userId: string;
  companyId?: string;
  imageData: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  userName?: string;
  userEmail?: string;
}

const AdminPagamentosPage: React.FC = () => {
  const { teamMember } = useAuth();
  const { toast } = useToast();
  
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Stats
  const pendingCount = receipts.filter(r => r.status === 'pending').length;
  const approvedCount = receipts.filter(r => r.status === 'approved').length;
  const totalRevenue = approvedCount * 59.99; // Setup + first month

  useEffect(() => {
    const q = query(
      collection(db, 'paymentReceipts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const receiptsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          
          // Fetch user info
          let userName = 'Usuário';
          let userEmail = '';
          
          if (data.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'teamMembers', data.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                userName = userData.nome || 'Usuário';
                userEmail = userData.email || '';
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
          
          return {
            id: docSnap.id,
            ...data,
            userName,
            userEmail,
          } as PaymentReceipt;
        })
      );
      
      setReceipts(receiptsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (receipt: PaymentReceipt) => {
    if (!teamMember) return;
    
    setProcessing(true);
    try {
      // Update receipt status
      await updateDoc(doc(db, 'paymentReceipts', receipt.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: teamMember.id,
      });

      // Update user subscription status
      await updateDoc(doc(db, 'teamMembers', receipt.userId), {
        subscriptionStatus: 'active',
        updatedAt: serverTimestamp(),
      });

      // If there's a company, update all team members of that company
      if (receipt.companyId) {
        // For now, we're just updating the individual user
        // In production, you'd query all users with this companyId
      }

      toast({
        title: "Assinatura ativada!",
        description: `A assinatura de ${receipt.userName} foi ativada com sucesso.`,
      });

      setViewDialogOpen(false);
    } catch (error) {
      console.error('Error approving receipt:', error);
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o comprovante. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReceipt || !teamMember || !rejectReason.trim()) return;
    
    setProcessing(true);
    try {
      // Update receipt status
      await updateDoc(doc(db, 'paymentReceipts', selectedReceipt.id), {
        status: 'rejected',
        rejectReason: rejectReason.trim(),
        reviewedAt: serverTimestamp(),
        reviewedBy: teamMember.id,
      });

      // Update user subscription status to expired
      await updateDoc(doc(db, 'teamMembers', selectedReceipt.userId), {
        subscriptionStatus: 'expired',
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Comprovante rejeitado",
        description: `O comprovante de ${selectedReceipt.userName} foi rejeitado.`,
      });

      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar o comprovante. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Pagamentos</h1>
        <p className="text-muted-foreground">Aprove ou rejeite comprovantes de pagamento PIX</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assinantes Ativos</p>
                <p className="text-2xl font-bold text-primary">{approvedCount}</p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Você tem {pendingCount} comprovante{pendingCount > 1 ? 's' : ''} aguardando análise.
          </AlertDescription>
        </Alert>
      )}

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comprovantes de Pagamento</CardTitle>
          <CardDescription>
            Lista de todos os comprovantes enviados pelos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum comprovante recebido ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revisão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{receipt.userName}</p>
                          <p className="text-sm text-muted-foreground">{receipt.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                      <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                      <TableCell>
                        {receipt.reviewedAt ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(receipt.reviewedAt)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Receipt Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprovante de Pagamento</DialogTitle>
            <DialogDescription>
              {selectedReceipt?.userName} - {selectedReceipt?.userEmail}
            </DialogDescription>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-4">
              {/* Receipt Image */}
              <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={selectedReceipt.imageData} 
                  alt="Comprovante" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Receipt Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p>{getStatusBadge(selectedReceipt.status)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Enviado em</p>
                  <p>{formatDate(selectedReceipt.createdAt)}</p>
                </div>
              </div>

              {/* Reject Reason */}
              {selectedReceipt.status === 'rejected' && selectedReceipt.rejectReason && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Motivo da rejeição:</strong> {selectedReceipt.rejectReason}
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              {selectedReceipt.status === 'pending' && (
                <DialogFooter className="flex gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedReceipt)}
                    disabled={processing}
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Aprovar e Ativar
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Comprovante</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O usuário será notificado.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Ex: Valor incorreto, comprovante ilegível, etc."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : null}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPagamentosPage;
