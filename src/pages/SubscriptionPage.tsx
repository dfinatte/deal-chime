import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Upload, 
  CheckCircle, 
  Clock, 
  Copy, 
  Check,
  Building2,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamMember, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const PIX_KEY = '55839369837';
  const SETUP_FEE = 50;
  const MONTHLY_FEE = 9.99;

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !teamMember) return;

    setUploading(true);
    try {
      // Convert file to base64 for storage (in production, use Firebase Storage)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        await addDoc(collection(db, 'paymentReceipts'), {
          userId: teamMember.id,
          companyId: (teamMember as any).companyId || null,
          imageData: base64,
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        setReceiptSent(true);
        toast({
          title: "Comprovante enviado!",
          description: "Seu comprovante foi recebido e será analisado em breve.",
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o comprovante. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (receiptSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Comprovante Recebido!</CardTitle>
            <CardDescription>
              Seu comprovante está sendo analisado. Você receberá uma notificação assim que sua assinatura for ativada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Tempo médio de análise: até 24 horas úteis
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Período de teste encerrado
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Continue usando o ImobCRM
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Seu período de teste de 14 dias expirou. Assine agora para continuar 
            gerenciando seus leads e fechando mais negócios!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pricing Card */}
          <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
              Mais Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Plano Profissional</CardTitle>
              <CardDescription>
                Acesso completo a todas as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">R$ {SETUP_FEE}</span>
                  <span className="text-muted-foreground">taxa única</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">+ R$ {MONTHLY_FEE.toFixed(2)}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Cadastro ilimitado de leads</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Gestão completa de clientes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Dashboard com análises</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Controle de visitas e interações</span>
                </li>
                <li className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Gestão de equipe (empresas)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Notificações para a equipe</span>
                </li>
                <li className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                Pagamento via PIX
              </CardTitle>
              <CardDescription>
                Faça o pagamento e envie o comprovante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PIX Key */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <p className="text-sm font-medium">Chave PIX (Telefone):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background p-3 rounded border text-lg font-mono">
                    {PIX_KEY}
                  </code>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleCopyPix}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Value to pay */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Valor a pagar:</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {(SETUP_FEE + MONTHLY_FEE).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (R$ {SETUP_FEE} taxa única + R$ {MONTHLY_FEE.toFixed(2)} primeiro mês)
                </p>
              </div>

              {/* Upload Receipt */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img 
                        src={previewUrl} 
                        alt="Comprovante" 
                        className="w-full h-full object-contain bg-muted"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Trocar imagem
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleUploadReceipt}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                            Enviando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Enviar comprovante
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-24 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6" />
                      <span>Clique para anexar o comprovante</span>
                    </div>
                  </Button>
                )}
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Após o envio, sua assinatura será ativada em até 24h úteis.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={handleLogout}>
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
