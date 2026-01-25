import { useQuery } from '@tanstack/react-query';
import { employeeService, attendanceService, payrollService } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, DollarSign, TrendingUp, Calendar, Plus } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ManagerDashboard() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch data
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
  });

  const { data: attendances = [] } = useQuery({
    queryKey: ['attendances', currentMonth, currentYear],
    queryFn: () => attendanceService.getAll({ month: currentMonth, year: currentYear }),
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', currentMonth, currentYear],
    queryFn: () => payrollService.getAll({ month: currentMonth, year: currentYear }),
  });

  // Calculate metrics
  const activeEmployees = employees.filter(e => e.isActive).length;
  const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalOvertime = attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
  const absenceRate = attendances.length > 0 
    ? (attendances.filter(a => a.isAbsent).length / attendances.length * 100).toFixed(1)
    : 0;

  // Department distribution
  const departmentData = Object.entries(
    employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Monthly trend (mock data for now)
  const monthlyData = [
    { month: 'Ago', valor: 85000 },
    { month: 'Set', valor: 92000 },
    { month: 'Out', valor: 88000 },
    { month: 'Nov', valor: 95000 },
    { month: 'Dez', valor: 98000 },
    { month: 'Jan', valor: totalPayroll || 100000 },
  ];

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  const stats = [
    {
      label: 'Equipe Total',
      value: activeEmployees,
      change: '+2 este mês',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Folha de Pagamento',
      value: formatCurrency(totalPayroll),
      change: '+8% vs mês anterior',
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Horas Extras',
      value: `${totalOvertime.toFixed(1)}h`,
      change: `${attendances.length} registros`,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Taxa de Ausência',
      value: `${absenceRate}%`,
      change: 'Dentro do esperado',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard do Gerente</h1>
        <p className="text-gray-600 mt-1">Visão geral da sua equipe e operações</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <a href="/manager/team?novo=1" className="block p-6 bg-blue-50 border-2 border-blue-200 rounded-lg shadow hover:bg-blue-100 transition-colors text-center">
          <Plus className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <span className="block text-lg font-bold text-blue-900">Cadastrar Novo Funcionário</span>
          <span className="block text-sm text-blue-700 mt-1">Acesse o cadastro e gestão de funcionários</span>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Payroll Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Folha</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="valor" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.filter(e => e.isActive).slice(0, 5).map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{emp.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-600">{emp.position} - {emp.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(emp.monthlySalary)}</p>
                  <p className="text-sm text-gray-600">{emp.monthlyWorkHours}h/mês</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
