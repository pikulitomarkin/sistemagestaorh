import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmployeeForm } from '../components/EmployeeForm';
import { Users, DollarSign, UserCheck, Plus } from 'lucide-react';
import api from '../services/api';

const ManagerDashboard = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'João Silva', email: 'joao@empresa.com', role: 'RH', status: 'Ativo', cpf: '12345678900' },
    { id: 2, name: 'Maria Santos', email: 'maria@empresa.com', role: 'RH', status: 'Ativo', cpf: '98765432100' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@empresa.com', role: 'RH', status: 'Inativo', cpf: '11122233344' },
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const stats = [
    {
      label: 'Total de Funcionários',
      value: '247',
      icon: Users,
      color: 'indigo',
      change: '+12 este mês',
    },
    {
      label: 'Custo Total da Folha',
      value: 'R$ 1.245.000',
      icon: DollarSign,
      color: 'green',
      change: '+3.2% vs mês anterior',
    },
    {
      label: 'RHs Ativos',
      value: '8',
      icon: UserCheck,
      color: 'blue',
      change: '2 novos este mês',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Gerencial</h1>
            <p className="text-slate-600 mt-1">Visão estratégica do sistema de RH</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              indigo: 'bg-indigo-100 text-indigo-600',
              green: 'bg-green-100 text-green-600',
              blue: 'bg-blue-100 text-blue-600',
            };

            return (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Gestão de Usuários */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Gestão de Usuários RH</h2>
              <p className="text-sm text-slate-600 mt-1">Gerencie os usuários do tipo RH</p>
            </div>
            <Button 
              variant="primary" 
              size="md"
              onClick={() => {
                setEditingUser(null);
                setIsFormOpen(true);
              }}
            >
              <Plus size={18} className="mr-2" />
              Novo Cadastro
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-900">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'Ativo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setIsFormOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Formulário de Cadastro */}
        <EmployeeForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          initialData={editingUser}
          onSubmit={async (formData) => {
            try {
              // Aqui você faria a chamada à API
              // await api.post('/employees', formData);
              
              console.log('Dados do formulário (CPF sem máscara):', formData);
              
              // Simulação de sucesso
              if (editingUser) {
                // Atualizar usuário existente
                setUsers(users.map(u => 
                  u.id === editingUser.id 
                    ? { ...u, ...formData, cpf: formData.cpf }
                    : u
                ));
              } else {
                // Adicionar novo usuário
                const newUser = {
                  id: users.length + 1,
                  ...formData,
                  status: 'Ativo',
                };
                setUsers([...users, newUser]);
              }
              
              alert(editingUser ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!');
            } catch (error) {
              throw error;
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
