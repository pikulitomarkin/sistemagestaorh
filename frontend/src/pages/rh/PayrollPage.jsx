import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService, employeeService } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { DollarSign, Calendar, TrendingUp, Download, Play } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function PayrollPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payrolls
  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['payrolls', selectedMonth, selectedYear, selectedCycle],
    queryFn: () => payrollService.getAll({
      month: selectedMonth,
      year: selectedYear,
      cycle: selectedCycle || undefined,
    }),
  });

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
  });

  // Process payroll mutation
  const processMutation = useMutation({
    mutationFn: payrollService.processCycle,
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      setSelectedEmployeeIds([]);
      setSelectAllEmployees(false);
      setShowEmployeeSelector(false);
      showToast('Folha de pagamento processada com sucesso', 'success');
    },
    onError: () => {
      showToast('Erro ao processar folha de pagamento', 'error');
    },
  });

  const handleProcessPayroll = () => {
    if (!selectedCycle) {
      showToast('Selecione um ciclo para processar', 'warning');
      return;
    }

    const employeeIds = selectedEmployeeIds.length > 0
      ? selectedEmployeeIds
      : employees.filter(e => e.isActive).map(e => e.id);

    if (employeeIds.length === 0) {
      showToast('Nenhum funcionário selecionado', 'warning');
      return;
    }

    const referenceDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();

    processMutation.mutate({
      employeeIds,
      cycleType: selectedCycle,
      referenceDate,
    });
  };

  // Stats
  const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
  const totalAdditions = payrolls.reduce((sum, p) => sum + (p.additions || 0), 0);
  const processedCount = payrolls.filter(p => p.isProcessed).length;

  const stats = [
    {
      label: 'Total Líquido',
      value: formatCurrency(totalPayroll),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Total Adições',
      value: formatCurrency(totalAdditions),
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total Deduções',
      value: formatCurrency(totalDeductions),
      icon: TrendingUp,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Processados',
      value: `${processedCount}/${payrolls.length}`,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50',
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
          <h1 className="text-3xl font-bold text-gray-900">Folha de Pagamento</h1>
          <p className="text-gray-600 mt-1">Gerencie e processe a folha de pagamento</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            onClick={handleProcessPayroll}
            disabled={processMutation.isPending}
          >
            <Play className="w-4 h-4 mr-2" />
            {processMutation.isPending ? 'Processando...' : 'Processar Folha'}
          </Button>
        </div>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
            >
              <option value="">Todos os Ciclos</option>
              <option value="Day20">Dia 20</option>
              <option value="Day05">Dia 05</option>
            </Select>

            <div className="flex items-center gap-2">
              <div>
                <button
                  className="px-3 py-1 border rounded text-sm bg-white"
                  onClick={() => setShowEmployeeSelector(!showEmployeeSelector)}
                >
                  Selecionar Funcionários ({selectedEmployeeIds.length || employees.filter(e => e.isActive).length})
                </button>
                {showEmployeeSelector && (
                  <div className="mt-2 p-3 bg-white border rounded max-h-48 overflow-auto shadow">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectAllEmployees}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectAllEmployees(checked);
                          if (checked) {
                            setSelectedEmployeeIds(employees.filter(emp => emp.isActive).map(emp => emp.id));
                          } else {
                            setSelectedEmployeeIds([]);
                          }
                        }}
                      />
                      <span className="text-sm">Selecionar todos os ativos</span>
                    </label>
                    {employees.map(emp => (
                      <label key={emp.id} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedEmployeeIds.includes(emp.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedEmployeeIds(prev => {
                              const next = checked ? [...prev, emp.id] : prev.filter(id => id !== emp.id);
                              const activeCount = employees.filter(x => x.isActive).length;
                              setSelectAllEmployees(next.length === activeCount);
                              return next;
                            });
                          }}
                        />
                        <span className="text-sm">{emp.name} {emp.isActive ? '' : '(inativo)'}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600">
                Período: {months.find(m => m.value === selectedMonth)?.label}/{selectedYear}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Folhas de Pagamento ({payrolls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma folha encontrada para este período</p>
              <Button onClick={handleProcessPayroll} disabled={!selectedCycle}>
                <Play className="w-4 h-4 mr-2" />
                Processar Nova Folha
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Período</th>
                    <th>Ciclo</th>
                    <th>Salário Base</th>
                    <th>Adições</th>
                    <th>Deduções</th>
                    <th>Líquido</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td className="font-medium">
                        {employees.find(e => e.id === payroll.employeeId)?.name || 'N/A'}
                      </td>
                      <td className="text-gray-600">
                        {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                      </td>
                      <td>
                        <Badge variant="outline">
                          {payroll.cycleType === 'Day20' ? 'Dia 20' : 'Dia 05'}
                        </Badge>
                      </td>
                      <td>{formatCurrency(payroll.baseSalary)}</td>
                      <td className="text-green-600 font-medium">
                        +{formatCurrency(payroll.additions)}
                      </td>
                      <td className="text-red-600 font-medium">
                        -{formatCurrency(payroll.deductions)}
                      </td>
                      <td className="font-bold">{formatCurrency(payroll.netSalary)}</td>
                      <td>
                        <Badge variant={payroll.isProcessed ? 'success' : 'warning'}>
                          {payroll.isProcessed ? 'Processado' : 'Pendente'}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline">
                          Ver Holerite
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
