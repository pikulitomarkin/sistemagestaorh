import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { attendanceService, payrollService } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import { Calendar, DollarSign, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';

export function EmployeeDashboard() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      isAbsent: 'false',
      entryTime: '',
      exitTime: '',
      overtimeHours: 0,
      doubleTimeHours: 0,
      notes: '',
    },
  });

  // Fetch my attendance
  const { data: attendances = [] } = useQuery({
    queryKey: ['my-attendances', currentMonth, currentYear],
    queryFn: () => attendanceService.getByEmployee(user.employeeId, {
      startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      endDate: new Date(currentYear, currentMonth, 0).toISOString(),
    }),
  });

  // Fetch my payrolls
  const { data: payrolls = [] } = useQuery({
    queryKey: ['my-payrolls', currentMonth, currentYear],
    queryFn: () => payrollService.getMyPayrolls({
      startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      endDate: new Date(currentYear, currentMonth, 0).toISOString(),
    }),
  });

  // Calculate metrics
  const totalDays = attendances.length;
  const absences = attendances.filter(a => a.isAbsent).length;
  const totalOvertime = attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
  const lastPayroll = payrolls[0];

  // Next payment dates (CLT biweekly: Day 20 and Day 05)
  const getNextPaymentDate = () => {
    const today = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    if (today < 5) {
      return new Date(year, month, 5);
    } else if (today < 20) {
      return new Date(year, month, 20);
    } else {
      return new Date(year, month + 1, 5);
    }
  };

  const nextPayment = getNextPaymentDate();
  const daysUntilPayment = Math.ceil((nextPayment - currentDate) / (1000 * 60 * 60 * 24));

  // Register attendance mutation
  const registerMutation = useMutation({
    mutationFn: (data) => attendanceService.create({
      ...data,
      employeeId: user.employeeId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-attendances']);
      showToast('Ponto registrado com sucesso!', 'success');
      reset({
        date: new Date().toISOString().split('T')[0],
        isAbsent: 'false',
        entryTime: '',
        exitTime: '',
        overtimeHours: 0,
        doubleTimeHours: 0,
        notes: '',
      });
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
      entryTime: data.entryTime ? `${data.entryTime}:00` : null,
      exitTime: data.exitTime ? `${data.exitTime}:00` : null,
      overtimeHours: Number(data.overtimeHours),
      doubleTimeHours: Number(data.doubleTimeHours),
    });
  };

  const stats = [
    {
      label: 'Próximo Pagamento',
      value: formatDate(nextPayment.toISOString()),
      subtitle: `Em ${daysUntilPayment} dias`,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Último Salário',
      value: lastPayroll ? formatCurrency(lastPayroll.netSalary) : 'N/A',
      subtitle: lastPayroll ? formatDate(lastPayroll.periodEnd) : 'Nenhum holerite',
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Dias Trabalhados',
      value: totalDays - absences,
      subtitle: `${absences} faltas este mês`,
      icon: Clock,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Horas Extras',
      value: `${totalOvertime.toFixed(1)}h`,
      subtitle: 'Neste mês',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Acompanhe suas informações e holerites</p>
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
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
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

      {/* Quick Attendance Registration */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-blue-900">Registrar Ponto Rápido</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <Input type="date" {...register('date')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select {...register('isAbsent')}>
                  <option value="false">Presente</option>
                  <option value="true">Ausente</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada</label>
                <Input type="time" {...register('entryTime')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Saída</label>
                <Input type="time" {...register('exitTime')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HE 50%</label>
                <Input type="number" step="0.5" {...register('overtimeHours')} placeholder="0" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HE 100%</label>
                <Input type="number" step="0.5" {...register('doubleTimeHours')} placeholder="0" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
              <Input {...register('notes')} placeholder="Ex: Home office, visita cliente..." />
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-200">
              {user?.role === 'RH' && (
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={registerMutation.isPending}
                  className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 text-base shadow-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {registerMutation.isPending ? 'Registrando...' : 'Salvar Lançamento'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Pagamento Dia 05</p>
                <p className="text-sm text-blue-700">Referente ao período 21 a 05</p>
              </div>
              <Badge variant={nextPayment.getDate() === 5 ? 'success' : 'outline'}>
                {nextPayment.getDate() === 5 ? 'Próximo' : '05/' + (currentMonth < 10 ? '0' + currentMonth : currentMonth)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Pagamento Dia 20</p>
                <p className="text-sm text-green-700">Referente ao período 06 a 20</p>
              </div>
              <Badge variant={nextPayment.getDate() === 20 ? 'success' : 'outline'}>
                {nextPayment.getDate() === 20 ? 'Próximo' : '20/' + (currentMonth < 10 ? '0' + currentMonth : currentMonth)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payslips */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Holerites</CardTitle>
        </CardHeader>
        <CardContent>
          {payrolls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum holerite disponível ainda
            </div>
          ) : (
            <div className="space-y-3">
              {payrolls.slice(0, 5).map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(payroll.periodStart)} a {formatDate(payroll.periodEnd)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ciclo: {payroll.cycleType === 'Day20' ? 'Dia 20' : 'Dia 05'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(payroll.netSalary)}
                    </p>
                    <Badge variant={payroll.isProcessed ? 'success' : 'warning'}>
                      {payroll.isProcessed ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/employee/attendance" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Registrar Ponto</p>
            </a>
            <a href="/employee/payslips" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-900">Ver Holerites</p>
            </a>
            <a href="/employee/attendance" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-purple-900">Minha Frequência</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
