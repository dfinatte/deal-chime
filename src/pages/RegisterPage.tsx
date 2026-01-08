import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
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
  CheckCircle2,
  Briefcase,
  UserCog
} from 'lucide-react';
import { z } from 'zod';

type AccountType = 'imobiliaria' | 'corretor' | 'gestor';

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

const corretorSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  telefone: z.string().trim().min(10, 'Telefone inválido').max(15),
  creci: z.string().trim().min(4, 'CRECI inválido').max(20),
  cidade: z.string().trim().min(2, 'Cidade deve ter pelo menos 2 caracteres').max(100),
  estado: z.string().trim().length(2, 'Use a sigla do estado (ex: SP)'),
  especialidade: z.string().min(1, 'Selecione uma especialidade'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(50),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

const gestorSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  telefone: z.string().trim().min(10, 'Telefone inválido').max(15),
  nomeEquipe: z.string().trim().min(2, 'Nome da equipe deve ter pelo menos 2 caracteres').max(100),
  cidade: z.string().trim().min(2, 'Cidade deve ter pelo menos 2 caracteres').max(100),
  estado: z.string().trim().length(2, 'Use a sigla do estado (ex: SP)'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(50),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [step, setStep] = useState(0); // 0 = choose type, 1+ = form steps
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Company data (imobiliaria)
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefoneEmpresa, setTelefoneEmpresa] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tamanhoEquipe, setTamanhoEquipe] = useState('');

  // Admin data (imobiliaria)
  const [nomeAdmin, setNomeAdmin] = useState('');
  const [emailAdmin, setEmailAdmin] = useState('');
  const [telefoneAdmin, setTelefoneAdmin] = useState('');
  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [confirmarSenhaAdmin, setConfirmarSenhaAdmin] = useState('');

  // Corretor independente data
  const [nomeCorretor, setNomeCorretor] = useState('');
  const [emailCorretor, setEmailCorretor] = useState('');
  const [telefoneCorretor, setTelefoneCorretor] = useState('');
  const [creci, setCreci] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [senhaCorretor, setSenhaCorretor] = useState('');
  const [confirmarSenhaCorretor, setConfirmarSenhaCorretor] = useState('');

  // Gestor data
  const [nomeGestor, setNomeGestor] = useState('');
  const [emailGestor, setEmailGestor] = useState('');
  const [telefoneGestor, setTelefoneGestor] = useState('');
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [senhaGestor, setSenhaGestor] = useState('');
  const [confirmarSenhaGestor, setConfirmarSenhaGestor] = useState('');

  // Shared
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

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

  const selectAccountType = (type: AccountType) => {
    setAccountType(type);
    setStep(1);
    setError('');
    setFieldErrors({});
  };

  const validateImobiliariaStep1 = () => {
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

  const validateImobiliariaStep2 = () => {
    setFieldErrors({});
    const result = adminSchema.safeParse({
      nomeAdmin,
      emailAdmin,
      telefoneAdmin,
      senhaAdmin,
      confirmarSenha: confirmarSenhaAdmin,
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

  const validateCorretor = () => {
    setFieldErrors({});
    const result = corretorSchema.safeParse({
      nome: nomeCorretor,
      email: emailCorretor,
      telefone: telefoneCorretor,
      creci,
      cidade,
      estado,
      especialidade,
      senha: senhaCorretor,
      confirmarSenha: confirmarSenhaCorretor,
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

  const validateGestor = () => {
    setFieldErrors({});
    const result = gestorSchema.safeParse({
      nome: nomeGestor,
      email: emailGestor,
      telefone: telefoneGestor,
      nomeEquipe,
      cidade,
      estado,
      senha: senhaGestor,
      confirmarSenha: confirmarSenhaGestor,
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

  const handleSubmitImobiliaria = async () => {
    if (!validateImobiliariaStep2()) return;

    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailAdmin, senhaAdmin);
      const userId = userCredential.user.uid;

      const companyRef = await addDoc(collection(db, 'companies'), {
        nome: nomeEmpresa,
        cnpj: cnpj.replace(/\D/g, ''),
        telefone: telefoneEmpresa.replace(/\D/g, ''),
        endereco,
        cidade,
        estado: estado.toUpperCase(),
        tamanhoEquipe,
        tipo: 'imobiliaria',
        ownerId: userId,
        createdAt: Timestamp.now(),
        ativo: true,
      });

      await addDoc(collection(db, 'teamMembers'), {
        email: emailAdmin,
        nome: nomeAdmin,
        telefone: telefoneAdmin.replace(/\D/g, ''),
        role: 'admin',
        ativo: true,
        companyId: companyRef.id,
        createdAt: Timestamp.now(),
      });

      navigate('/dashboard');
    } catch (err: unknown) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCorretor = async () => {
    if (!validateCorretor()) return;

    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailCorretor, senhaCorretor);
      const userId = userCredential.user.uid;

      await addDoc(collection(db, 'teamMembers'), {
        email: emailCorretor,
        nome: nomeCorretor,
        telefone: telefoneCorretor.replace(/\D/g, ''),
        creci,
        cidade,
        estado: estado.toUpperCase(),
        especialidade,
        role: 'admin', // Independent broker is admin of their own account
        tipo: 'corretor_independente',
        ativo: true,
        ownerId: userId,
        createdAt: Timestamp.now(),
      });

      navigate('/dashboard');
    } catch (err: unknown) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGestor = async () => {
    if (!validateGestor()) return;

    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailGestor, senhaGestor);
      const userId = userCredential.user.uid;

      const teamRef = await addDoc(collection(db, 'companies'), {
        nome: nomeEquipe,
        cidade,
        estado: estado.toUpperCase(),
        tipo: 'equipe',
        ownerId: userId,
        createdAt: Timestamp.now(),
        ativo: true,
      });

      await addDoc(collection(db, 'teamMembers'), {
        email: emailGestor,
        nome: nomeGestor,
        telefone: telefoneGestor.replace(/\D/g, ''),
        role: 'admin',
        tipo: 'gestor_equipe',
        ativo: true,
        companyId: teamRef.id,
        createdAt: Timestamp.now(),
      });

      navigate('/dashboard');
    } catch (err: unknown) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: unknown) => {
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
  };

  const renderAccountTypeSelection = () => (
    <div className="space-y-4">
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md hover:border-primary ${accountType === 'imobiliaria' ? 'border-primary bg-primary/5' : ''}`}
        onClick={() => selectAccountType('imobiliaria')}
      >
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Imobiliária</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Para empresas com CNPJ. Gerencie múltiplos corretores, clientes e imóveis da sua imobiliária.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer transition-all hover:shadow-md hover:border-primary ${accountType === 'corretor' ? 'border-primary bg-primary/5' : ''}`}
        onClick={() => selectAccountType('corretor')}
      >
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Corretor Independente</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Para corretores autônomos com CRECI. Gerencie seus próprios clientes e negociações.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer transition-all hover:shadow-md hover:border-primary ${accountType === 'gestor' ? 'border-primary bg-primary/5' : ''}`}
        onClick={() => selectAccountType('gestor')}
      >
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <UserCog className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Gestor de Equipe</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Para líderes de equipe sem CNPJ. Crie e gerencie sua própria equipe de corretores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderImobiliariaForm = () => {
    if (step === 1) {
      return (
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
            {fieldErrors.nomeEmpresa && <p className="text-sm text-destructive">{fieldErrors.nomeEmpresa}</p>}
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
            {fieldErrors.cnpj && <p className="text-sm text-destructive">{fieldErrors.cnpj}</p>}
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
            {fieldErrors.telefoneEmpresa && <p className="text-sm text-destructive">{fieldErrors.telefoneEmpresa}</p>}
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
            {fieldErrors.endereco && <p className="text-sm text-destructive">{fieldErrors.endereco}</p>}
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
              {fieldErrors.cidade && <p className="text-sm text-destructive">{fieldErrors.cidade}</p>}
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
              {fieldErrors.estado && <p className="text-sm text-destructive">{fieldErrors.estado}</p>}
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
            {fieldErrors.tamanhoEquipe && <p className="text-sm text-destructive">{fieldErrors.tamanhoEquipe}</p>}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar
            </Button>
            <Button type="button" className="flex-1" onClick={() => { if (validateImobiliariaStep1()) setStep(2); }}>
              Próximo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSubmitImobiliaria(); }} className="space-y-4">
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
          {fieldErrors.nomeAdmin && <p className="text-sm text-destructive">{fieldErrors.nomeAdmin}</p>}
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
          {fieldErrors.emailAdmin && <p className="text-sm text-destructive">{fieldErrors.emailAdmin}</p>}
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
          {fieldErrors.telefoneAdmin && <p className="text-sm text-destructive">{fieldErrors.telefoneAdmin}</p>}
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
          {fieldErrors.senhaAdmin && <p className="text-sm text-destructive">{fieldErrors.senhaAdmin}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmarSenhaAdmin">Confirmar Senha *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmarSenhaAdmin"
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenhaAdmin}
              onChange={(e) => setConfirmarSenhaAdmin(e.target.value)}
              className="pl-10"
              maxLength={50}
            />
          </div>
          {fieldErrors.confirmarSenha && <p className="text-sm text-destructive">{fieldErrors.confirmarSenha}</p>}
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
    );
  };

  const renderCorretorForm = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmitCorretor(); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="nomeCorretor">Nome Completo *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="nomeCorretor"
              placeholder="Seu nome"
              value={nomeCorretor}
              onChange={(e) => setNomeCorretor(e.target.value)}
              className="pl-10"
              maxLength={100}
            />
          </div>
          {fieldErrors.nome && <p className="text-sm text-destructive">{fieldErrors.nome}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="emailCorretor">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="emailCorretor"
              type="email"
              placeholder="seu@email.com"
              value={emailCorretor}
              onChange={(e) => setEmailCorretor(e.target.value)}
              className="pl-10"
              maxLength={255}
            />
          </div>
          {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefoneCorretor">Telefone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="telefoneCorretor"
              placeholder="(00) 00000-0000"
              value={telefoneCorretor}
              onChange={(e) => setTelefoneCorretor(formatPhone(e.target.value))}
              className="pl-10"
              maxLength={15}
            />
          </div>
          {fieldErrors.telefone && <p className="text-sm text-destructive">{fieldErrors.telefone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="creci">CRECI *</Label>
          <Input
            id="creci"
            placeholder="123456-F"
            value={creci}
            onChange={(e) => setCreci(e.target.value.toUpperCase())}
            maxLength={20}
          />
          {fieldErrors.creci && <p className="text-sm text-destructive">{fieldErrors.creci}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidadeCorretor">Cidade *</Label>
          <Input
            id="cidadeCorretor"
            placeholder="São Paulo"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            maxLength={100}
          />
          {fieldErrors.cidade && <p className="text-sm text-destructive">{fieldErrors.cidade}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estadoCorretor">Estado *</Label>
          <Input
            id="estadoCorretor"
            placeholder="SP"
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            maxLength={2}
          />
          {fieldErrors.estado && <p className="text-sm text-destructive">{fieldErrors.estado}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="especialidade">Especialidade *</Label>
          <Select value={especialidade} onValueChange={setEspecialidade}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residencial">Imóveis Residenciais</SelectItem>
              <SelectItem value="comercial">Imóveis Comerciais</SelectItem>
              <SelectItem value="rural">Imóveis Rurais</SelectItem>
              <SelectItem value="luxo">Alto Padrão / Luxo</SelectItem>
              <SelectItem value="lancamentos">Lançamentos</SelectItem>
              <SelectItem value="geral">Generalista</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.especialidade && <p className="text-sm text-destructive">{fieldErrors.especialidade}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="senhaCorretor">Senha *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="senhaCorretor"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senhaCorretor}
              onChange={(e) => setSenhaCorretor(e.target.value)}
              className="pl-10"
              maxLength={50}
            />
          </div>
          {fieldErrors.senha && <p className="text-sm text-destructive">{fieldErrors.senha}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmarSenhaCorretor">Confirmar Senha *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmarSenhaCorretor"
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenhaCorretor}
              onChange={(e) => setConfirmarSenhaCorretor(e.target.value)}
              className="pl-10"
              maxLength={50}
            />
          </div>
          {fieldErrors.confirmarSenha && <p className="text-sm text-destructive">{fieldErrors.confirmarSenha}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Conta'}
        </Button>
      </div>
    </form>
  );

  const renderGestorForm = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmitGestor(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeGestor">Seu Nome Completo *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="nomeGestor"
            placeholder="Seu nome"
            value={nomeGestor}
            onChange={(e) => setNomeGestor(e.target.value)}
            className="pl-10"
            maxLength={100}
          />
        </div>
        {fieldErrors.nome && <p className="text-sm text-destructive">{fieldErrors.nome}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nomeEquipe">Nome da Equipe *</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="nomeEquipe"
            placeholder="Ex: Equipe Premium, Time Alpha..."
            value={nomeEquipe}
            onChange={(e) => setNomeEquipe(e.target.value)}
            className="pl-10"
            maxLength={100}
          />
        </div>
        {fieldErrors.nomeEquipe && <p className="text-sm text-destructive">{fieldErrors.nomeEquipe}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailGestor">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="emailGestor"
            type="email"
            placeholder="seu@email.com"
            value={emailGestor}
            onChange={(e) => setEmailGestor(e.target.value)}
            className="pl-10"
            maxLength={255}
          />
        </div>
        {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefoneGestor">Telefone *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="telefoneGestor"
            placeholder="(00) 00000-0000"
            value={telefoneGestor}
            onChange={(e) => setTelefoneGestor(formatPhone(e.target.value))}
            className="pl-10"
            maxLength={15}
          />
        </div>
        {fieldErrors.telefone && <p className="text-sm text-destructive">{fieldErrors.telefone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cidadeGestor">Cidade *</Label>
          <Input
            id="cidadeGestor"
            placeholder="São Paulo"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            maxLength={100}
          />
          {fieldErrors.cidade && <p className="text-sm text-destructive">{fieldErrors.cidade}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="estadoGestor">Estado *</Label>
          <Input
            id="estadoGestor"
            placeholder="SP"
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            maxLength={2}
          />
          {fieldErrors.estado && <p className="text-sm text-destructive">{fieldErrors.estado}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="senhaGestor">Senha *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="senhaGestor"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={senhaGestor}
            onChange={(e) => setSenhaGestor(e.target.value)}
            className="pl-10"
            maxLength={50}
          />
        </div>
        {fieldErrors.senha && <p className="text-sm text-destructive">{fieldErrors.senha}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmarSenhaGestor">Confirmar Senha *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="confirmarSenhaGestor"
            type="password"
            placeholder="Repita a senha"
            value={confirmarSenhaGestor}
            onChange={(e) => setConfirmarSenhaGestor(e.target.value)}
            className="pl-10"
            maxLength={50}
          />
        </div>
        {fieldErrors.confirmarSenha && <p className="text-sm text-destructive">{fieldErrors.confirmarSenha}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Conta'}
        </Button>
      </div>
    </form>
  );

  const getStepInfo = () => {
    if (step === 0) return { title: 'Escolha seu tipo de conta', description: 'Selecione a opção que melhor se encaixa no seu perfil' };
    
    switch (accountType) {
      case 'imobiliaria':
        return step === 1 
          ? { title: 'Dados da Imobiliária', description: 'Informe os dados da sua empresa' }
          : { title: 'Dados do Administrador', description: 'Crie sua conta de administrador' };
      case 'corretor':
        return { title: 'Dados do Corretor', description: 'Informe seus dados profissionais' };
      case 'gestor':
        return { title: 'Dados do Gestor', description: 'Configure sua equipe' };
      default:
        return { title: '', description: '' };
    }
  };

  const getTotalSteps = () => {
    if (accountType === 'imobiliaria') return 2;
    return 1;
  };

  const { title, description } = getStepInfo();

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
          <p className="text-muted-foreground mt-2">Configure sua conta em minutos</p>
        </div>

        {/* Progress Steps - only show after type selection */}
        {step > 0 && accountType === 'imobiliaria' && (
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
        )}

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 0 && renderAccountTypeSelection()}
            {step > 0 && accountType === 'imobiliaria' && renderImobiliariaForm()}
            {step > 0 && accountType === 'corretor' && renderCorretorForm()}
            {step > 0 && accountType === 'gestor' && renderGestorForm()}
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
