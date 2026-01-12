import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDemo } from '@/contexts/DemoContext';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Bell, 
  Target, 
  TrendingUp,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Star,
  Eye
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { enableDemoMode } = useDemo();

  const handleDemo = () => {
    enableDemoMode();
    navigate('/demo');
  };

  const features = [
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastre e acompanhe todos os seus leads e clientes em um só lugar, com histórico completo de interações.'
    },
    {
      icon: BarChart3,
      title: 'Análises e Métricas',
      description: 'Dashboards inteligentes com funil de vendas, conversões e performance da equipe em tempo real.'
    },
    {
      icon: Bell,
      title: 'Notificações Internas',
      description: 'Comunique-se com sua equipe instantaneamente. Envie avisos para todos ou para corretores específicos.'
    },
    {
      icon: Target,
      title: 'Funil de Vendas',
      description: 'Visualize cada etapa da jornada do cliente, desde o primeiro contato até o fechamento.'
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Detalhados',
      description: 'Exporte dados, acompanhe KPIs e tome decisões baseadas em dados concretos.'
    },
    {
      icon: Shield,
      title: 'Gestão de Equipe',
      description: 'Controle completo sobre corretores, com métricas individuais e gerenciamento de acessos.'
    }
  ];

  const benefits = [
    'Aumente suas vendas em até 40%',
    'Reduza o tempo de fechamento',
    'Nunca perca um follow-up',
    'Visão 360° dos seus clientes',
    'Decisões baseadas em dados',
    'Equipe sempre conectada'
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Diretor Comercial',
      company: 'Imobiliária Premium',
      text: 'Aumentamos nossas conversões em 35% nos primeiros 3 meses usando o CRM Imobiliário.',
      rating: 5
    },
    {
      name: 'Ana Paula Santos',
      role: 'Corretora',
      company: 'RE/MAX Elite',
      text: 'Finalmente consigo acompanhar todos os meus leads sem perder nenhuma oportunidade.',
      rating: 5
    },
    {
      name: 'Roberto Mendes',
      role: 'Gerente de Vendas',
      company: 'Construtora ABC',
      text: 'A visibilidade que temos agora sobre a performance da equipe é incrível.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">CRM Imobiliário</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/login')}>
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Smartphone className="w-4 h-4" />
            Plataforma completa para imobiliárias
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
            Transforme sua imobiliária com o CRM que 
            <span className="text-primary"> acelera vendas</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie clientes, acompanhe sua equipe e feche mais negócios com a plataforma 
            mais completa do mercado imobiliário brasileiro.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="text-lg px-8 h-14" onClick={() => navigate('/login')}>
              Começar Gratuitamente
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14" onClick={handleDemo}>
              <Eye className="mr-2 w-5 h-5" />
              Ver Demonstração
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Suporte incluído</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Imobiliárias</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Corretores Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">R$ 2B+</div>
              <div className="text-muted-foreground">Em Vendas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades pensadas para o dia a dia do mercado imobiliário brasileiro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Por que escolher o CRM Imobiliário?
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Desenvolvido por profissionais do mercado imobiliário, para profissionais 
                do mercado imobiliário. Entendemos suas dores e criamos soluções práticas.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">40%</div>
                <div className="text-xl opacity-90 mb-6">Aumento médio nas vendas</div>
                <div className="text-sm opacity-75">
                  Baseado em dados de clientes nos primeiros 6 meses de uso
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-muted-foreground">
              Milhares de profissionais confiam no CRM Imobiliário
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Pronto para transformar sua imobiliária?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a mais de 500 imobiliárias que já estão vendendo mais com o CRM Imobiliário. 
            Comece seu teste gratuito hoje mesmo.
          </p>
          <Button size="lg" className="text-lg px-8 h-14" onClick={() => navigate('/login')}>
            Criar Minha Conta Grátis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">CRM Imobiliário</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 CRM Imobiliário. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
