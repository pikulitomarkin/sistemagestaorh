import { useAuth } from '../../hooks/useAuth';
import { Bell, Search } from 'lucide-react';

export const Topbar = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-lg font-semibold text-slate-900 hidden md:block">
          {getGreeting()}, {user?.username || 'Usuário'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Search size={20} className="text-slate-600" />
        </button>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
