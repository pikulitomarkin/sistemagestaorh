import { Card } from './ui/Card';
import { FileText, Download } from 'lucide-react';
import { Button } from './ui/Button';

export const PayrollSlip = ({ payroll }) => {
  if (!payroll) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleDownload = () => {
    // Aqui você implementaria o download do PDF
    console.log('Download holerite:', payroll.id);
    alert('Download do holerite será implementado');
  };

  return (
    <Card className="bg-white border-2 border-slate-300" padding="lg">
      {/* Cabeçalho do Holerite */}
      <div className="text-center mb-6 pb-6 border-b-2 border-slate-300">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText size={24} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Holerite de Pagamento</h2>
        </div>
        <p className="text-sm text-slate-600">
          {payroll.paymentType === 'Adiantamento' ? 'Adiantamento - Dia 20' : 'Folha Principal - Dia 5'}
        </p>
      </div>

      {/* Informações do Funcionário */}
      {payroll.employee && (
        <div className="mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Funcionário:</span>
            <span className="text-sm font-semibold text-slate-900">{payroll.employee.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Período:</span>
            <span className="text-sm font-semibold text-slate-900">
              {formatDate(payroll.periodStart)} a {formatDate(payroll.periodEnd)}
            </span>
          </div>
        </div>
      )}

      {/* Tabela de Valores */}
      <div className="mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 text-slate-700 font-semibold">Descrição</th>
              <th className="text-right py-2 text-slate-700 font-semibold">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2 text-slate-700">Salário Base do Período</td>
              <td className="py-2 text-right font-medium text-slate-900">
                {formatCurrency(payroll.periodBaseSalary)}
              </td>
            </tr>
            
            {payroll.overtimeHours > 0 && (
              <tr>
                <td className="py-2 text-slate-700">Horas Extras ({payroll.overtimeHours}h)</td>
                <td className="py-2 text-right font-medium text-green-700">
                  + {formatCurrency(payroll.overtimeValue)}
                </td>
              </tr>
            )}
            
            {payroll.doubleTimeHours > 0 && (
              <tr>
                <td className="py-2 text-slate-700">Dobras/Noitadas ({payroll.doubleTimeHours}h)</td>
                <td className="py-2 text-right font-medium text-green-700">
                  + {formatCurrency(payroll.doubleTimeValue)}
                </td>
              </tr>
            )}
            
            {payroll.absenceDays > 0 && (
              <tr>
                <td className="py-2 text-slate-700">Desconto por Faltas ({payroll.absenceDays} dias)</td>
                <td className="py-2 text-right font-medium text-red-700">
                  - {formatCurrency(payroll.absenceDeduction)}
                </td>
              </tr>
            )}
            
            {payroll.inssDeduction > 0 && (
              <tr>
                <td className="py-2 text-slate-700">Desconto INSS</td>
                <td className="py-2 text-right font-medium text-red-700">
                  - {formatCurrency(payroll.inssDeduction)}
                </td>
              </tr>
            )}
            
            <tr className="border-t-2 border-slate-300 font-bold">
              <td className="py-3 text-slate-900">Total Líquido</td>
              <td className="py-3 text-right text-indigo-600 text-lg">
                {formatCurrency(payroll.netSalary)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botão de Download */}
      <div className="flex justify-center pt-4 border-t border-slate-200">
        <Button
          variant="primary"
          onClick={handleDownload}
          className="touch-target"
        >
          <Download size={18} className="mr-2" />
          Baixar PDF
        </Button>
      </div>
    </Card>
  );
};
