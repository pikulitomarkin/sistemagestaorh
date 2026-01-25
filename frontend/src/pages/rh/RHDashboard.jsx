import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { employeeService, payrollService, attendanceService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

export function RHDashboard() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Fetch employee statistics
  const { data: employeeStats, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employee-stats'],
    queryFn: employeeService.getStatistics,
  });

  // Fetch payroll analytics
  const { data: payrollAnalytics, isLoading: loadingPayroll } = useQuery({
    queryKey: ['payroll-analytics', currentMonth, currentYear],
    queryFn: () => payrollService.getAnalytics(currentMonth, currentYear),
  });

  // Fetch recent attendance
  const { data: attendanceData } = useQuery({
    queryKey: ['attendance-recent'],
    queryFn: () => attendanceService.getAll({ month: currentMonth, year: currentYear }),
  });

  // Calculate KPIs
  const kpis = {
    totalEmployees: employeeStats?.totalActive || 0,
    totalPayroll: payrollAnalytics?.totalPayroll || 0,
    totalOvertimeHours: attendanceData?.reduce((sum, item) => 
      sum + (item.overtimeHours50 || 0) + (item.overtimeHours100 || 0), 0) || 0,
    avgSalary: employeeStats?.averageSalary || 0,
  };

  // Prepare chart data - Cycle comparison
  const cycleComparisonData = [
    {
      name: 'Ciclo 1 (Dia 20)',
      valor: payrollAnalytics?.cycle1Total || 0,
      funcionarios: payrollAnalytics?.cycle1Count || 0,
    },
    {
      name: 'Ciclo 2 (Dia 05)',
      valor: payrollAnalytics?.cycle2Total || 0,
      funcionarios: payrollAnalytics?.cycle2Count || 0,
    },
  ];

  // Department distribution
  const departmentData = employeeStats?.byDepartment?.map(dept => ({
    name: dept.department,
    value: dept.count,
  })) || [];

  // Monthly trend (mock data - replace with real API)
  const monthlyTrend = [
    { month: 'Jul', valor: 120000 },
    { month: 'Ago', valor: 125000 },
    { month: 'Set', valor: 123000 },
    { month: 'Out', valor: 130000 },
    { month: 'Nov', valor: 128000 },
    { month: 'Dez', valor: 135000 },
    { month: 'Jan', valor: payrollAnalytics?.totalPayroll || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard RH</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visão geral e indicadores de gestão de pessoas
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingEmployees ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Funcionários</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.totalEmployees}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
                      <span className="text-xs text-success-600 font-medium">+5.2% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Folha de Pagamento</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(kpis.totalPayroll)}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
                      <span className="text-xs text-success-600 font-medium">+2.8% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-success-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-7 w-7 text-success-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Horas Extras (Mês)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {kpis.totalOvertimeHours.toFixed(1)}h
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingDown className="h-4 w-4 text-danger-600 mr-1" />
                      <span className="text-xs text-danger-600 font-medium">+12.3% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-7 w-7 text-warning-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Salário Médio</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(kpis.avgSalary)}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
                      <span className="text-xs text-success-600 font-medium">+1.5% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Comparação entre Ciclos</CardTitle>
            <CardDescription>
              Valores pagos nos ciclos quinzenais do mês atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayroll ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Carregando dados...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cycleComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="valor" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Departamento</CardTitle>
            <CardDescription>
              Número de funcionários por área
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEmployees ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Carregando dados...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Folha de Pagamento</CardTitle>
          <CardDescription>
            Histórico dos últimos 7 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                icon={<CheckCircle className="h-5 w-5 text-success-600" />}
                title="Folha do Ciclo 1 processada"
                description="28 funcionários"
                time="Há 2 horas"
              />
              <ActivityItem
                icon={<Users className="h-5 w-5 text-primary-600" />}
                title="Novo funcionário cadastrado"
                description="João Silva - Desenvolvimento"
                time="Há 5 horas"
              />
              <ActivityItem
                icon={<Calendar className="h-5 w-5 text-warning-600" />}
                title="Frequência lançada em lote"
                description="15 registros adicionados"
                time="Ontem"
              />
              <ActivityItem
                icon={<DollarSign className="h-5 w-5 text-success-600" />}
                title="Pagamento aprovado"
                description="Ciclo 2 - Dezembro/2025"
                time="Há 2 dias"
              />
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas e Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AlertItem
                variant="warning"
                title="Horas extras elevadas"
                description="Departamento de TI com 120h extras este mês"
              />
              <AlertItem
                variant="info"
                title="Processamento do Ciclo 2"
                description="Agendado para 05/02/2026"
              />
              <AlertItem
                variant="success"
                title="Meta de presença atingida"
                description="98.5% de frequência no mês"
              />
              <AlertItem
                variant="danger"
                title="Documentos pendentes"
                description="3 funcionários com cadastro incompleto"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
function ActivityItem({ icon, title, description, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

function AlertItem({ variant, title, description }) {
  const variants = {
    success: { bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-700' },
    warning: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700' },
    danger: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700' },
    info: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700' },
  };

  const style = variants[variant] || variants.info;

  return (
    <div className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
      <div className="flex items-start">
        <AlertCircle className={`h-5 w-5 ${style.text} mt-0.5`} />
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{title}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
