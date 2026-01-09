import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cadastro', label: 'Novo Lead', icon: UserPlus },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/analises', label: 'Análises', icon: BarChart3 },
];

const adminItems = [
  { path: '/equipe', label: 'Equipe', icon: Settings },
  { path: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
];

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, teamMember, signOut, isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-background">
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
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
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
                <p className="text-xs text-sidebar-foreground/60">Gestão de Leads</p>
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
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive(item.path) 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className={cn("pt-4 pb-2", collapsed ? "px-2" : "px-3")}>
                {!collapsed && (
                  <span className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive(item.path) 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && teamMember && (
            <div className="px-3 py-2 mb-2">
              <p className="font-medium text-sm truncate">{teamMember.nome}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{teamMember.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground/80",
              collapsed && "justify-center px-0"
            )}
            onClick={signOut}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
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
              <span className="font-display font-bold">CRM Imobiliário</span>
            </div>
          </div>
          <NotificationCenter />
        </header>

        {/* Desktop header with notifications */}
        <header className="hidden lg:flex items-center justify-end h-14 px-6 border-b border-border bg-card">
          <NotificationCenter />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
