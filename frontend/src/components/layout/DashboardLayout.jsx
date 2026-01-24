import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="md:ml-64">
        <Topbar />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
