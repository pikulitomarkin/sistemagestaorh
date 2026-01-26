import { useState } from 'react';
import { MonthCalendar } from '../../components/ui/MonthCalendar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { attendanceService } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function EmployeeAttendancePage() {
  const { user } = useAuthStore();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      entryTime: '',
      exitTime: '',
      isAbsent: false,
      overtimeHours: 0,
      doubleTimeHours: 0,
      notes: '',
    },
  });
  // Atualiza o campo date ao selecionar no calendário
  const handleDaySelect = (date) => {
    setSelectedDate(date);
    setValue('date', date.toISOString().split('T')[0]);
  };
  // Fetch my attendance
  const { data: attendances = [], isLoading } = useQuery({
    queryKey: ['my-attendances', selectedMonth, selectedYear],
    queryFn: () => attendanceService.getByEmployee(user.employeeId, {
      startDate: new Date(selectedYear, selectedMonth - 1, 1).toISOString(),
      endDate: new Date(selectedYear, selectedMonth, 0).toISOString(),
    }),
  });

  // Register attendance mutation
  const registerMutation = useMutation({
    mutationFn: (data) => attendanceService.create({
      ...data,
      employeeId: user.employeeId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-attendances']);
      showToast('Ponto registrado com sucesso', 'success');
      reset();
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao registrar ponto';
      showToast(message, 'error');
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate({
      ...data,
      isAbsent: data.isAbsent === 'true',
      overtimeHours: Number(data.overtimeHours),
      doubleTimeHours: Number(data.doubleTimeHours),
      entryTime: data.entryTime ? `${data.entryTime}:00` : null,
      exitTime: data.exitTime ? `${data.exitTime}:00` : null,
    });
  };

  // Calculate stats
  const totalDays = attendances.length;
  const absences = attendances.filter(a => a.isAbsent).length;
  const presences = totalDays - absences;
  const totalOvertime = attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

  const stats = [
    { label: 'Dias Registrados', value: totalDays, color: 'text-blue-600 bg-blue-50' },
    { label: 'Presenças', value: presences, color: 'text-green-600 bg-green-50' },
    { label: 'Faltas', value: absences, color: 'text-red-600 bg-red-50' },
    { label: 'Horas Extras', value: `${totalOvertime.toFixed(1)}h`, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-3`}>
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Register Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700">
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Registrar Ponto Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o dia do mês</label>
          <MonthCalendar value={selectedDate} onChange={handleDaySelect} />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <Select label="Status" {...register('isAbsent')}>
              <option value={false}>Presente</option>
              <option value={true}>Falta</option>
            </Select>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="HE 50%"
                step="0.5"
                placeholder="0"
                {...register('overtimeHours', { valueAsNumber: true })}
              />
              <Input
                type="number"
                label="HE 100%"
                step="0.5"
                placeholder="0"
                {...register('doubleTimeHours', { valueAsNumber: true })}
              />
            </div>

            <Input 
              label="Observações (opcional)" 
              placeholder="Ex: Home office, visita cliente..."
              {...register('notes')} 
            />

            <div className="flex justify-end pt-4 border-t border-gray-200">
              {user?.role === 'RH' && (
                <Button 
                  type="submit" 
                  size="lg"
                  loading={registerMutation.isPending}
                  className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 text-base shadow-lg"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Salvar Lançamento
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Pontos ({attendances.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum ponto registrado ainda</p>
              <p className="text-gray-400">Use o formulário acima para registrar seu primeiro ponto</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Hora Extra (50%)</th>
                    <th>Hora Extra (100%)</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((attendance) => (
                    <tr key={attendance.id}>
                      <td className="font-medium">{formatDate(attendance.date)}</td>
                      <td>
                        <Badge variant={attendance.isAbsent ? 'danger' : 'success'}>
                          {attendance.isAbsent ? 'Falta' : 'Presente'}
                        </Badge>
                      </td>
                      <td className="text-gray-600">{attendance.overtimeHours?.toFixed(1)}h</td>
                      <td className="text-gray-600">{attendance.doubleTimeHours?.toFixed(1)}h</td>
                      <td className="text-gray-600 max-w-xs truncate">{attendance.notes || '-'}</td>
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
