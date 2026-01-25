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
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function EmployeeAttendancePage() {
  const { user } = useAuthStore();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showModal, setShowModal] = useState(false);
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
    queryFn: () => attendanceService.getAll({
      month: selectedMonth,
      year: selectedYear,
      employeeId: user.employeeId,
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
      handleCloseModal();
    },
    onError: () => {
      showToast('Erro ao registrar ponto', 'error');
    },
  });

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = (data) => {
    registerMutation.mutate({
      ...data,
      isAbsent: data.isAbsent === 'true',
      overtimeHours: Number(data.overtimeHours),
      doubleTimeHours: Number(data.doubleTimeHours),
      entryTime: data.entryTime,
      exitTime: data.exitTime,
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Frequência</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o dia do mês</label>
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
                <Select label="Presença" {...register('isAbsent')}>
                  <option value={false}>Presente</option>
                  <option value={true}>Falta</option>
                </Select>
                <Input
                  type="number"
                  label="Horas Extras"
                  step="0.5"
                  {...register('overtimeHours', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  label="Horas Extras 100%"
                  step="0.5"
                  {...register('doubleTimeHours', { valueAsNumber: true })}
                />
                <Input label="Observações" {...register('notes')} />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" loading={registerMutation.isPending}>
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


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
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeiro Ponto
              </Button>
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



      {/* Register Modal com calendário e hora de entrada/saída */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Frequência</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o dia do mês</label>
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
                <Select label="Presença" {...register('isAbsent')}>
                  <option value={false}>Presente</option>
                  <option value={true}>Falta</option>
                </Select>
                <Input
                  type="number"
                  label="Horas Extras"
                  step="0.5"
                  {...register('overtimeHours', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  label="Horas Extras 100%"
                  step="0.5"
                  {...register('doubleTimeHours', { valueAsNumber: true })}
                />
                <Input label="Observações" {...register('notes')} />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" loading={registerMutation.isPending}>
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
