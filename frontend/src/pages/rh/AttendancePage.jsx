import { useState } from 'react';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Frequência</h1>
          <p className="mt-1 text-sm text-gray-600">
            Controle de ponto e lançamento de horas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowBatchModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Lançamento em Lote
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
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
function AttendanceModal({ employees, onClose, onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      hoursWorked: 8,
      overtimeHours50: 0,
      overtimeHours100: 0,
      absences: 0,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Registro de Frequência</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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

          <Input
            type="date"
            label="Data *"
            {...register('date')}
            error={errors.date?.message}
          />

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

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Registrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Batch Attendance Modal Component (Simplified)
function BatchAttendanceModal({ employees, onClose, onSubmit, isLoading }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const handleBatchSubmit = () => {
    const batchData = selectedEmployees.map(empId => ({
      employeeId: empId,
      date: selectedDate,
      hoursWorked: 8,
      overtimeHours50: 0,
      overtimeHours100: 0,
      absences: 0,
    }));
    onSubmit(batchData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lançamento em Lote</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <Input
            type="date"
            label="Data"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Selecione os Funcionários
            </label>
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto p-2">
              {employees.map((emp) => (
                <label key={emp.id} className="flex items-center py-2 px-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    value={emp.id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees([...selectedEmployees, emp.id]);
                      } else {
                        setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {emp.name} - {emp.department}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {selectedEmployees.length} funcionário(s) selecionado(s)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              variant="primary"
              onClick={handleBatchSubmit}
              loading={isLoading}
              disabled={!selectedDate || selectedEmployees.length === 0}
            >
              Registrar Lote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
