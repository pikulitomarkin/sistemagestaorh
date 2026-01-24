import { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:translate-x-0 md:static md:inset-0`}>
        <div className="p-4">
          <h2 className="text-xl font-bold">RH Dashboard</h2>
          <nav className="mt-4">
            <Link to="/dashboard" className="block py-2">Home</Link>
            <Link to="/attendance" className="block py-2">Lançar Ponto</Link>
            <Link to="/payroll" className="block py-2">Ver Holerite</Link>
          </nav>
        </div>
      </div>
      <div className="flex-1 p-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">Toggle Sidebar</button>
        <h1 className="text-2xl">Bem-vindo ao Sistema de RH</h1>
      </div>
    </div>
  );
};

export default Dashboard;