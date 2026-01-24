import { Card } from './ui/Card';
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';

export const PayrollSummary = ({ payroll }) => {
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
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Card padding="lg">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Resumo de Folha - {payroll.paymentType === 'Adiantamento' ? 'Adiantamento (Dia 20)' : 'Folha Principal (Dia 5)'}
          </h3>
        </div>
        <p className="text-sm text-slate-600">
          Período: {formatDate(payroll.periodStart)} a {formatDate(payroll.periodEnd)}
        </p>
        {payroll.employee && (
          <p className="text-sm text-slate-600 mt-1">
            Funcionário: {payroll.employee.name}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {/* Salário Bruto */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Salário Bruto do Período</span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(payroll.grossSalary)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Base: {formatCurrency(payroll.periodBaseSalary)} | 
            Hora: {formatCurrency(payroll.hourlyRate)}/h
          </div>
        </div>

        {/* Adições */}
        {(payroll.totalAdditions > 0) && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-green-600" />
              <span className="text-sm font-semibold text-green-900">Adições</span>
            </div>
            <div className="space-y-2 text-sm">
              {payroll.overtimeHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">Horas Extras ({payroll.overtimeHours}h)</span>
                  <span className="font-medium text-green-700">
                    {formatCurrency(payroll.overtimeValue)}
                  </span>
                </div>
              )}
              {payroll.doubleTimeHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">Dobras/Noitadas ({payroll.doubleTimeHours}h)</span>
                  <span className="font-medium text-green-700">
                    {formatCurrency(payroll.doubleTimeValue)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-green-200">
                <span className="font-semibold text-green-900">Total de Adições</span>
                <span className="font-bold text-green-900">
                  {formatCurrency(payroll.totalAdditions)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deduções */}
        {(payroll.totalDeductions > 0) && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={18} className="text-red-600" />
              <span className="text-sm font-semibold text-red-900">Deduções</span>
            </div>
            <div className="space-y-2 text-sm">
              {payroll.absenceDays > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">Faltas ({payroll.absenceDays} dias)</span>
                  <span className="font-medium text-red-700">
                    {formatCurrency(payroll.absenceDeduction)}
                  </span>
                </div>
              )}
              {payroll.inssDeduction > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">INSS</span>
                  <span className="font-medium text-red-700">
                    {formatCurrency(payroll.inssDeduction)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-red-200">
                <span className="font-semibold text-red-900">Total de Deduções</span>
                <span className="font-bold text-red-900">
                  {formatCurrency(payroll.totalDeductions)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Valor Líquido */}
        <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-indigo-900">Valor Líquido a Pagar</span>
            <span className="text-2xl font-bold text-indigo-900">
              {formatCurrency(payroll.netSalary)}
            </span>
          </div>
        </div>

        {/* Provisão FGTS (apenas visualização) */}
        <div className="p-3 bg-slate-100 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Provisão de FGTS (8%)</span>
            <span className="font-medium text-slate-700">
              {formatCurrency(payroll.fgtsProvision)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            * Valor informativo para a empresa
          </p>
        </div>
      </div>
    </Card>
  );
};
