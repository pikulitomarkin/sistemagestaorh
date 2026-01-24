import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  Menu, 
  X,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const menuItems = {
  Gerente: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Gestão de Usuários', icon: Users },
    { path: '/payroll-management', label: 'Folha de Pagamento', icon: FileText },
  ],
  RH: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/attendance', label: 'Frequência', icon: Clock },
    { path: '/payroll-management', label: 'Folha de Pagamento', icon: FileText },
    { path: '/employees', label: 'Funcionários', icon: Users },
  ],
  Funcionario: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/payroll', label: 'Holerites', icon: FileText },
  ],
};

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const items = menuItems[user?.role] || [];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40',
          'w-64 bg-white border-r border-slate-200',
          'transform transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900">RH System</h1>
            <p className="text-sm text-slate-500 mt-1">Gestão de Recursos Humanos</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
