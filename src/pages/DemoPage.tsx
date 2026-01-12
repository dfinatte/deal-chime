import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Eye,
  ArrowLeft,
  Lock
} from 'lucide-react';

// Import demo pages content
import DemoDashboard from '@/components/demo/DemoDashboard';
import DemoClientes from '@/components/demo/DemoClientes';
import DemoAnalises from '@/components/demo/DemoAnalises';

const demoNavItems = [
  { path: '/demo', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/demo/cadastro', label: 'Novo Lead', icon: UserPlus, locked: true },
  { path: '/demo/clientes', label: 'Clientes', icon: Users },
  { path: '/demo/analises', label: 'Análises', icon: BarChart3 },
];

const DemoPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'clientes' | 'analises'>('dashboard');
  const navigate = useNavigate();
  const { disableDemoMode } = useDemo();

  const handleExit = () => {
    disableDemoMode();
    navigate('/');
  };

  const handleStartTrial = () => {
    disableDemoMode();
    navigate('/registro');
  };

  const handleNavClick = (path: string, locked?: boolean) => {
    if (locked) return;
    
    if (path === '/demo') setCurrentView('dashboard');
    else if (path === '/demo/clientes') setCurrentView('clientes');
    else if (path === '/demo/analises') setCurrentView('analises');
    
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/demo' && currentView === 'dashboard') return true;
    if (path === '/demo/clientes' && currentView === 'clientes') return true;
    if (path === '/demo/analises' && currentView === 'analises') return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Demo Banner - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Modo Demonstração</span>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs">
              Dados fictícios
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleExit}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-7 text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Voltar
            </Button>
            <Button 
              size="sm" 
              onClick={handleStartTrial}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-7 text-xs"
            >
              Começar Teste Grátis
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 pt-10",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-display font-bold text-sm">CRM Imobiliário</h1>
                <p className="text-xs text-sidebar-foreground/60">Modo Demo</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden lg:flex hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", collapsed ? "" : "rotate-180")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden hover:bg-sidebar-accent"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {demoNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path, item.locked)}
              disabled={item.locked}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                isActive(item.path) 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : item.locked
                    ? "text-sidebar-foreground/40 cursor-not-allowed"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.locked && <Lock className="w-4 h-4" />}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Demo Info */}
        {!collapsed && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="p-3 rounded-lg bg-sidebar-accent/50">
              <p className="text-xs text-sidebar-foreground/80 mb-2">
                💡 Crie sua conta para cadastrar seus próprios leads
              </p>
              <Button 
                size="sm" 
                onClick={handleStartTrial}
                className="w-full text-xs"
              >
                Criar Conta Grátis
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pt-10">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-card">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="ml-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-display font-bold">CRM Demo</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Demo Alert */}
          <Alert className="mb-6 bg-secondary/10 border-secondary/20">
            <Eye className="h-4 w-4 text-secondary" />
            <AlertDescription className="text-foreground">
              <strong>Você está visualizando uma carteira de demonstração.</strong> Estes são dados fictícios 
              para mostrar como o CRM funciona. O botão "Novo Lead" está bloqueado no modo demo.
            </AlertDescription>
          </Alert>

          {/* Render current view */}
          {currentView === 'dashboard' && <DemoDashboard />}
          {currentView === 'clientes' && <DemoClientes />}
          {currentView === 'analises' && <DemoAnalises />}
        </main>
      </div>
    </div>
  );
};

export default DemoPage;
