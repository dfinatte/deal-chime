import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Users,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { z } from 'zod';

const companySchema = z.object({
  nomeEmpresa: z.string().trim().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').max(100),
  cnpj: z.string().trim().min(14, 'CNPJ inválido').max(18),
  telefoneEmpresa: z.string().trim().min(10, 'Telefone inválido').max(15),
  endereco: z.string().trim().min(5, 'Endereço deve ter pelo menos 5 caracteres').max(200),
  cidade: z.string().trim().min(2, 'Cidade deve ter pelo menos 2 caracteres').max(100),
  estado: z.string().trim().length(2, 'Use a sigla do estado (ex: SP)'),
  tamanhoEquipe: z.string().min(1, 'Selecione o tamanho da equipe'),
});

const adminSchema = z.object({
  nomeAdmin: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  emailAdmin: z.string().trim().email('Email inválido').max(255),
  telefoneAdmin: z.string().trim().min(10, 'Telefone inválido').max(15),
  senhaAdmin: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(50),
  confirmarSenha: z.string(),
}).refine((data) => data.senhaAdmin === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Company data
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefoneEmpresa, setTelefoneEmpresa] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [tamanhoEquipe, setTamanhoEquipe] = useState('');

  // Admin data
  const [nomeAdmin, setNomeAdmin] = useState('');
  const [emailAdmin, setEmailAdmin] = useState('');
  const [telefoneAdmin, setTelefoneAdmin] = useState('');
  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const validateStep1 = () => {
    setFieldErrors({});
    const result = companySchema.safeParse({
      nomeEmpresa,
      cnpj,
      telefoneEmpresa,
      endereco,
      cidade,
      estado,
      tamanhoEquipe,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setFieldErrors({});
    const result = adminSchema.safeParse({
      nomeAdmin,
      emailAdmin,
      telefoneAdmin,
      senhaAdmin,
      confirmarSenha,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setError('');
    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, emailAdmin, senhaAdmin);
      const userId = userCredential.user.uid;

      // Create company document
      const companyRef = await addDoc(collection(db, 'companies'), {
        nome: nomeEmpresa,
        cnpj: cnpj.replace(/\D/g, ''),
        telefone: telefoneEmpresa.replace(/\D/g, ''),
        endereco,
        cidade,
        estado: estado.toUpperCase(),
        tamanhoEquipe,
        ownerId: userId,
        createdAt: Timestamp.now(),
        ativo: true,
      });

      // Create admin as team member
      await addDoc(collection(db, 'teamMembers'), {
        email: emailAdmin,
        nome: nomeAdmin,
        telefone: telefoneAdmin.replace(/\D/g, ''),
        role: 'admin',
        ativo: true,
        companyId: companyRef.id,
        createdAt: Timestamp.now(),
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        if (errorMessage.includes('email-already-in-use')) {
          setError('Este email já está cadastrado. Faça login ou use outro email.');
        } else if (errorMessage.includes('weak-password')) {
          setError('A senha é muito fraca. Use pelo menos 6 caracteres.');
        } else {
          setError(`Erro ao criar conta: ${err.message}`);
        }
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 py-12">
      <div className="w-full max-w-xl animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o início
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Criar sua conta</h1>
          <p className="text-muted-foreground mt-2">Configure sua imobiliária em minutos</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-medium hidden sm:inline">Empresa</span>
          </div>
          <div className={`w-12 h-0.5 ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="font-medium hidden sm:inline">Administrador</span>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 1 ? 'Dados da Imobiliária' : 'Dados do Administrador'}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Informe os dados da sua empresa' 
                : 'Crie sua conta de administrador'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Imobiliária *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nomeEmpresa"
                      placeholder="Nome da sua imobiliária"
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      className="pl-10"
                      maxLength={100}
                    />
                  </div>
                  {fieldErrors.nomeEmpresa && (
                    <p className="text-sm text-destructive">{fieldErrors.nomeEmpresa}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                    maxLength={18}
                  />
                  {fieldErrors.cnpj && (
                    <p className="text-sm text-destructive">{fieldErrors.cnpj}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefoneEmpresa">Telefone da Empresa *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="telefoneEmpresa"
                      placeholder="(00) 00000-0000"
                      value={telefoneEmpresa}
                      onChange={(e) => setTelefoneEmpresa(formatPhone(e.target.value))}
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                  {fieldErrors.telefoneEmpresa && (
                    <p className="text-sm text-destructive">{fieldErrors.telefoneEmpresa}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="endereco"
                      placeholder="Rua, número, bairro"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="pl-10"
                      maxLength={200}
                    />
                  </div>
                  {fieldErrors.endereco && (
                    <p className="text-sm text-destructive">{fieldErrors.endereco}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      placeholder="São Paulo"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      maxLength={100}
                    />
                    {fieldErrors.cidade && (
                      <p className="text-sm text-destructive">{fieldErrors.cidade}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      placeholder="SP"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value.toUpperCase())}
                      maxLength={2}
                    />
                    {fieldErrors.estado && (
                      <p className="text-sm text-destructive">{fieldErrors.estado}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tamanhoEquipe">Tamanho da Equipe *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={tamanhoEquipe} onValueChange={setTamanhoEquipe}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1 a 5 corretores</SelectItem>
                        <SelectItem value="6-15">6 a 15 corretores</SelectItem>
                        <SelectItem value="16-30">16 a 30 corretores</SelectItem>
                        <SelectItem value="31-50">31 a 50 corretores</SelectItem>
                        <SelectItem value="50+">Mais de 50 corretores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {fieldErrors.tamanhoEquipe && (
                    <p className="text-sm text-destructive">{fieldErrors.tamanhoEquipe}</p>
                  )}
                </div>

                <Button type="button" className="w-full" onClick={handleNextStep}>
                  Próximo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeAdmin">Seu Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nomeAdmin"
                      placeholder="Seu nome"
                      value={nomeAdmin}
                      onChange={(e) => setNomeAdmin(e.target.value)}
                      className="pl-10"
                      maxLength={100}
                    />
                  </div>
                  {fieldErrors.nomeAdmin && (
                    <p className="text-sm text-destructive">{fieldErrors.nomeAdmin}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailAdmin">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="emailAdmin"
                      type="email"
                      placeholder="seu@email.com"
                      value={emailAdmin}
                      onChange={(e) => setEmailAdmin(e.target.value)}
                      className="pl-10"
                      maxLength={255}
                    />
                  </div>
                  {fieldErrors.emailAdmin && (
                    <p className="text-sm text-destructive">{fieldErrors.emailAdmin}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefoneAdmin">Seu Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="telefoneAdmin"
                      placeholder="(00) 00000-0000"
                      value={telefoneAdmin}
                      onChange={(e) => setTelefoneAdmin(formatPhone(e.target.value))}
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                  {fieldErrors.telefoneAdmin && (
                    <p className="text-sm text-destructive">{fieldErrors.telefoneAdmin}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senhaAdmin">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="senhaAdmin"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={senhaAdmin}
                      onChange={(e) => setSenhaAdmin(e.target.value)}
                      className="pl-10"
                      maxLength={50}
                    />
                  </div>
                  {fieldErrors.senhaAdmin && (
                    <p className="text-sm text-destructive">{fieldErrors.senhaAdmin}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmarSenha"
                      type="password"
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="pl-10"
                      maxLength={50}
                    />
                  </div>
                  {fieldErrors.confirmarSenha && (
                    <p className="text-sm text-destructive">{fieldErrors.confirmarSenha}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Conta'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
