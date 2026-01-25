import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollService } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PayslipComponent } from '../../components/payroll/PayslipComponent';
import { FileText, Download, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function EmployeePayslipsPage() {
  const { user } = useAuthStore();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Fetch my payrolls
  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['my-payrolls', selectedYear],
    queryFn: () => payrollService.getAll({
      year: selectedYear,
      employeeId: user.employeeId,
    }),
  });

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  // Group by month
  const payrollsByMonth = payrolls.reduce((acc, payroll) => {
    const date = new Date(payroll.periodEnd);
    const month = date.getMonth() + 1;
    if (!acc[month]) acc[month] = [];
    acc[month].push(payroll);
    return acc;
  }, {});

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Holerites</h1>
          <p className="text-gray-600 mt-1">Visualize e baixe seus comprovantes de pagamento</p>
        </div>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
      </div>

      {/* Payslips List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">Carregando holerites...</div>
          </CardContent>
        </Card>
      ) : payrolls.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-center text-gray-500 text-lg">Nenhum holerite encontrado para {selectedYear}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(payrollsByMonth)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([month, monthPayrolls]) => (
              <Card key={month}>
                <CardHeader>
                  <CardTitle>{monthNames[Number(month) - 1]} {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthPayrolls.map((payroll) => (
                      <div
                        key={payroll.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Período: {formatDate(payroll.periodStart)} a {formatDate(payroll.periodEnd)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Ciclo: {payroll.cycleType === 'Day20' ? 'Dia 20' : 'Dia 05'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Base: <span className="font-medium">{formatCurrency(payroll.baseSalary)}</span>
                            </span>
                            <span className="text-green-600">
                              Adições: <span className="font-medium">+{formatCurrency(payroll.additions)}</span>
                            </span>
                            <span className="text-red-600">
                              Deduções: <span className="font-medium">-{formatCurrency(payroll.deductions)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Valor Líquido</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(payroll.netSalary)}
                            </p>
                          </div>
                          <Badge variant={payroll.isProcessed ? 'success' : 'warning'}>
                            {payroll.isProcessed ? 'Pago' : 'Pendente'}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPayslip(payroll)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Holerite - {formatDate(selectedPayslip.periodEnd)}</h2>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <PayslipComponent
                employeeName={user.name}
                period={`${formatDate(selectedPayslip.periodStart)} - ${formatDate(selectedPayslip.periodEnd)}`}
                baseSalary={selectedPayslip.baseSalary}
                additions={selectedPayslip.additions}
                deductions={selectedPayslip.deductions}
                netSalary={selectedPayslip.netSalary}
                payrollDetails={selectedPayslip.payrollDetails ? JSON.parse(selectedPayslip.payrollDetails) : null}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
