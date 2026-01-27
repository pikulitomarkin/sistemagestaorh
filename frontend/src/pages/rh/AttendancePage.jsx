import React, { useState } from 'react';
import { MonthCalendar } from '../../components/ui/MonthCalendar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Search,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { attendanceService, employeeService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatCurrency } from '../../lib/utils';

const attendanceSchema = z.object({
  employeeId: z.string().min(1, 'Selecione um funcionário'),
  date: z.string().min(1, 'Data é obrigatória'),
  hoursWorked: z.number().min(0).max(24),
  overtimeHours50: z.number().min(0).max(12),
  overtimeHours100: z.number().min(0).max(12),
  absences: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export function AttendancePage() {
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterCycle, setFilterCycle] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch attendance data
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', filterMonth, filterYear, filterCycle],
    queryFn: () => {
      if (filterCycle !== 'all') {
        return attendanceService.getByCycle(filterMonth, filterYear, filterCycle);
      }
      return attendanceService.getAll({ month: filterMonth, year: filterYear });
    },
  });

  // Fetch employees for dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ status: 'Ativo' }),
  });

  // Create attendance mutation
  const createMutation = useMutation({
    mutationFn: attendanceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
      toast.success('Frequência registrada com sucesso!');
      setShowAddModal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao registrar frequência');
    },
  });

  // Batch create mutation
  const batchMutation = useMutation({
    mutationFn: attendanceService.createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
      toast.success('Frequências registradas em lote com sucesso!');
      setShowBatchModal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao registrar frequências em lote');
    },
  });

  const filteredData = attendanceData?.filter(item => {
    if (!searchTerm) return true;
    return item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    totalRecords: filteredData?.length || 0,
    totalOvertime: filteredData?.reduce((sum, item) => 
      sum + (item.overtimeHours50 || 0) + (item.overtimeHours100 || 0), 0) || 0,
    totalAbsences: filteredData?.reduce((sum, item) => sum + (item.absences || 0), 0) || 0,
    avgHoursWorked: filteredData?.length 
      ? (filteredData.reduce((sum, item) => sum + (item.hoursWorked || 0), 0) / filteredData.length).toFixed(1)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Dropdown de Funcionários Ativos */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Funcionário</label>
              <Input
                placeholder="Buscar funcionário..."
                className="mb-2"
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
              />
              <Select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="w-full"
              >
                <option value="">Todos os funcionários</option>
                {employees
                  .filter(emp =>
                    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
                  )
                  .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </option>
                  ))}
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => setShowAddModal(true)}
                disabled={!selectedEmployeeId}
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Lançar Frequência Individual
              </Button>
              <Button
                size="lg"
                onClick={() => setShowBatchModal(true)}
                className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-semibold"
              >
                <Upload className="h-5 w-5 mr-2" />
                Lançamento em Lote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Frequência</h1>
          <p className="mt-1 text-sm text-gray-600">
            Controle de ponto e lançamento de horas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Registros</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRecords}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Extras</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOvertime.toFixed(1)}h</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faltas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAbsences}</p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Horas/Dia</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgHoursWorked}h</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar funcionário..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
            >
              <option value={1}>Janeiro</option>
              <option value={2}>Fevereiro</option>
              <option value={3}>Março</option>
              <option value={4}>Abril</option>
              <option value={5}>Maio</option>
              <option value={6}>Junho</option>
              <option value={7}>Julho</option>
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
              <option value={11}>Novembro</option>
              <option value={12}>Dezembro</option>
            </Select>

            <Select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </Select>

            <Select
              value={filterCycle}
              onChange={(e) => setFilterCycle(e.target.value)}
            >
              <option value="all">Todos os Ciclos</option>
              <option value="1">Ciclo 1 (Dia 20)</option>
              <option value="2">Ciclo 2 (Dia 05)</option>
            </Select>

            <Button variant="outline" size="md">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Frequência</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={10} columns={7} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horas Trabalhadas</TableHead>
                  <TableHead>Extras 50%</TableHead>
                  <TableHead>Extras 100%</TableHead>
                  <TableHead>Faltas</TableHead>
                  <TableHead>Ciclo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {record.hoursWorked}h
                        </span>
                      </TableCell>
                      <TableCell>
                        {record.overtimeHours50 > 0 ? (
                          <Badge variant="warning">
                            +{record.overtimeHours50}h (50%)
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.overtimeHours100 > 0 ? (
                          <Badge variant="danger">
                            +{record.overtimeHours100}h (100%)
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.absences > 0 ? (
                          <Badge variant="danger">{record.absences} dia(s)</Badge>
                        ) : (
                          <Badge variant="success">Presente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Ciclo {record.cycle}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <AttendanceModal
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <BatchAttendanceModal
          employees={employees}
          onClose={() => setShowBatchModal(false)}
          onSubmit={(data) => batchMutation.mutate(data)}
          isLoading={batchMutation.isPending}
        />
      )}
    </div>
  );
}

// Single Attendance Modal Component
function AttendanceModal({ employees, selectedEmployeeId, onClose, onSubmit, isLoading }) {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: selectedEmployeeId || '',
      date: new Date().toISOString().split('T')[0],
      entryTime: '',
      exitTime: '',
      hoursWorked: 8,
      overtimeHours50: 0,
      overtimeHours100: 0,
      absences: 0,
    },
  });

  // Preenche o funcionário selecionado ao abrir o modal
  React.useEffect(() => {
    if (selectedEmployeeId) {
      setValue('employeeId', selectedEmployeeId);
    }
  }, [selectedEmployeeId, setValue]);

  // Atualiza o campo date ao selecionar no calendário
  const handleDaySelect = (date) => {
    setSelectedDate(date);
    setValue('date', date.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Registro de Frequência</h2>
        </div>
        <div className="p-6">
          <Select
            label="Funcionário *"
            {...register('employeeId')}
            error={errors.employeeId?.message}
          >
            <option value="">Selecione...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.department}
              </option>
            ))}
          </Select>
          <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Selecione o dia do mês</label>
          <MonthCalendar value={selectedDate} onChange={handleDaySelect} />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Hora de Entrada"
                {...register('entryTime')}
              />
              <Input
                type="time"
                label="Hora de Saída"
                {...register('exitTime')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Horas Trabalhadas"
                step="0.5"
                {...register('hoursWorked', { valueAsNumber: true })}
                error={errors.hoursWorked?.message}
              />
              <Input
                type="number"
                label="Faltas (dias)"
                step="0.5"
                {...register('absences', { valueAsNumber: true })}
                error={errors.absences?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Horas Extras 50%"
                step="0.5"
                {...register('overtimeHours50', { valueAsNumber: true })}
                error={errors.overtimeHours50?.message}
              />
              <Input
                type="number"
                label="Horas Extras 100%"
                step="0.5"
                {...register('overtimeHours100', { valueAsNumber: true })}
                error={errors.overtimeHours100?.message}
              />
            </div>
            <Input
              label="Observações"
              {...register('notes')}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                size="lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                size="lg"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3 shadow-lg"
              >
                Salvar Lançamento
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Batch Attendance Modal Component
function BatchAttendanceModal({ employees, onClose, onSubmit, isLoading }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(true);
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);
  const [defaultEntryTime, setDefaultEntryTime] = useState('08:00');
  const [defaultExitTime, setDefaultExitTime] = useState('08:00');
  const [defaultOvertime50, setDefaultOvertime50] = useState(0);
  const [defaultOvertime100, setDefaultOvertime100] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Generate days for selected month
  const getDaysInMonth = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        day,
        entryTime: defaultEntryTime,
        exitTime: defaultExitTime,
        isAbsent: false,
        overtimeHours50: defaultOvertime50,
        overtimeHours100: defaultOvertime100,
      });
    }
    return days;
  };

  React.useEffect(() => {
    setAttendanceRecords(getDaysInMonth(selectedMonth, selectedYear));
  }, [selectedMonth, selectedYear]);

  const handleRecordChange = (index, field, value) => {
    const updated = [...attendanceRecords];
    // If user changes entry time, update exit time to match it (quick entry UX)
    if (field === 'entryTime') {
      updated[index] = { ...updated[index], entryTime: value, exitTime: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setAttendanceRecords(updated);
  };

  const applyDefaultEntryExitToAll = (entry, exit) => {
    setAttendanceRecords(prev => prev.map(r => ({ ...r, entryTime: entry, exitTime: exit })));
  };

  const applyDefaultOvertimesToAll = (o50, o100) => {
    setAttendanceRecords(prev => prev.map(r => ({ ...r, overtimeHours50: o50, overtimeHours100: o100 })));
  };

  const handleBatchSubmit = () => {
    if (!selectedEmployeeIds || selectedEmployeeIds.length === 0) {
      alert('Selecione pelo menos um funcionário');
      return;
    }

    const rows = attendanceRecords.filter(record => !(record.isAbsent) && record.entryTime && record.exitTime);

    const batchData = [];
    selectedEmployeeIds.forEach(empId => {
      rows.forEach(record => {
        batchData.push({
          employeeId: Number(empId),
          date: record.date,
          entryTime: record.entryTime,
          exitTime: record.exitTime,
          isAbsent: false,
          hoursWorked: 8,
          overtimeHours50: record.overtimeHours50 || 0,
          overtimeHours100: record.overtimeHours100 || 0,
          absences: 0,
        });
      });
    });

    onSubmit(batchData);
  };

  // ... later in JSX, change button disabled prop to use selectedEmployeeIds length (handled below)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lançamento em Lote</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Funcionários *</label>
              <div>
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
                  {employees.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(emp.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedEmployeeIds(prev => {
                            const next = checked ? Array.from(new Set([...prev, emp.id])) : prev.filter(id => id !== emp.id);
                            const activeCount = employees.filter(x => x.isActive).length;
                            setSelectAllEmployees(next.length === activeCount);
                            return next;
                          });
                        }}
                      />
                      <span className="text-sm">{emp.name} - {emp.department} {emp.isActive ? '' : '(inativo)'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2026, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrada padrão</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded"
                value={defaultEntryTime}
                onChange={(e) => {
                  const v = e.target.value || '00:00';
                  setDefaultEntryTime(v);
                  // Make default exit equal to entry by default for quick launch
                  setDefaultExitTime(v);
                  applyDefaultEntryExitToAll(v, v);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saída padrão</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded"
                value={defaultExitTime}
                onChange={(e) => {
                  const v = e.target.value || '00:00';
                  setDefaultExitTime(v);
                  applyDefaultEntryExitToAll(defaultEntryTime, v);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas extras (50%) padrão</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded"
                value={defaultOvertime50}
                onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  setDefaultOvertime50(v);
                  applyDefaultOvertimesToAll(v, defaultOvertime100);
                }}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dobras (100%) padrão</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded"
                value={defaultOvertime100}
                onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  setDefaultOvertime100(v);
                  applyDefaultOvertimesToAll(defaultOvertime50, v);
                }}
              />
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Entrada</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Saída</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Horas Extra (50%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Dobras (100%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ausente</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record, index) => (
                  <tr key={index} className={record.isAbsent ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 text-sm">
                      {new Date(record.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={record.entryTime}
                        onChange={(e) => handleRecordChange(index, 'entryTime', e.target.value)}
                        disabled={record.isAbsent}
                        className="w-32"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={record.exitTime}
                        onChange={(e) => handleRecordChange(index, 'exitTime', e.target.value)}
                        disabled={record.isAbsent}
                        className="w-32"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={record.overtimeHours50}
                        onChange={(e) => handleRecordChange(index, 'overtimeHours50', Number(e.target.value) || 0)}
                        disabled={record.isAbsent}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={record.overtimeHours100}
                        onChange={(e) => handleRecordChange(index, 'overtimeHours100', Number(e.target.value) || 0)}
                        disabled={record.isAbsent}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={record.isAbsent}
                        onChange={(e) => handleRecordChange(index, 'isAbsent', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleBatchSubmit}
              loading={isLoading}
              disabled={selectedEmployeeIds.length === 0}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold"
            >
              Salvar Lançamentos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
