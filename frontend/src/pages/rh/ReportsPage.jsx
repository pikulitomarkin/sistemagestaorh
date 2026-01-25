import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService, attendanceService, payrollService } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { FileText, Download, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ReportsPage() {
  const currentDate = new Date();
  const [reportType, setReportType] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Fetch data
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
  });

  const { data: attendances = [] } = useQuery({
    queryKey: ['attendances', selectedMonth, selectedYear],
    queryFn: () => attendanceService.getAll({
      month: selectedMonth,
      year: selectedYear,
    }),
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', selectedMonth, selectedYear],
    queryFn: () => payrollService.getAll({
      month: selectedMonth,
      year: selectedYear,
    }),
  });

  // Calculate stats
  const activeEmployees = employees.filter(e => e.isActive).length;
  const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalAbsences = attendances.filter(a => a.isAbsent).length;
  const totalOvertime = attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

  // Department distribution
  const departmentData = Object.entries(
    employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Monthly payroll trend (last 6 months)
  const monthlyPayrollData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(selectedYear, selectedMonth - 6 + i, 1);
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    return {
      month,
      value: Math.random() * 100000 + 50000, // Mock data - replace with real data
    };
  });

  // Department salary comparison
  const departmentSalaryData = Object.entries(
    employees.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = { total: 0, count: 0 };
      }
      acc[emp.department].total += emp.monthlySalary || 0;
      acc[emp.department].count += 1;
      return acc;
    }, {})
  ).map(([name, data]) => ({
    name,
    average: data.total / data.count,
    total: data.total,
  }));

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

  const stats = [
    {
      label: 'Funcionários Ativos',
      value: activeEmployees,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      change: '+5%',
    },
    {
      label: 'Folha Total',
      value: formatCurrency(totalPayroll),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
      change: '+12%',
    },
    {
      label: 'Horas Extras',
      value: `${totalOvertime.toFixed(1)}h`,
      icon: Calendar,
      color: 'text-orange-600 bg-orange-50',
      change: '-8%',
    },
    {
      label: 'Faltas',
      value: totalAbsences,
      icon: TrendingUp,
      color: 'text-red-600 bg-red-50',
      change: '+3%',
    },
  ];

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e indicadores de RH</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="overview">Visão Geral</option>
              <option value="payroll">Folha de Pagamento</option>
              <option value="attendance">Frequência</option>
              <option value="employees">Funcionários</option>
            </Select>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </Select>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} vs mês anterior
                    </p>
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
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Departamento</CardTitle>
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
                  outerRadius={80}
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

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Folha (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPayrollData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Salary Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comparação Salarial por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentSalaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="average" name="Média Salarial" fill="#0ea5e9" />
                <Bar dataKey="total" name="Total" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Headcount</h3>
              <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
              <p className="text-sm text-blue-700 mt-1">Total de colaboradores</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Turnover</h3>
              <p className="text-2xl font-bold text-green-600">2.3%</p>
              <p className="text-sm text-green-700 mt-1">Taxa mensal</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Ticket Médio</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalPayroll / activeEmployees || 0)}
              </p>
              <p className="text-sm text-purple-700 mt-1">Salário médio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
