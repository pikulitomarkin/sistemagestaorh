import { useState } from 'react';
import { 
  Download, 
  Printer, 
  Mail,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

/**
 * Componente de Holerite Digital (Payslip)
 * Exibe de forma clara e transparente todos os cálculos da folha de pagamento
 */
export function PayslipComponent({ payrollData, onClose }) {
  if (!payrollData) return null;

  const {
    employee,
    referenceMonth,
    referenceYear,
    cycle,
    baseSalary,
    grossPay,
    netPay,
    inssAmount,
    fgtsAmount,
    overtimePay50,
    overtimePay100,
    absenceDeduction,
    hoursWorked,
    overtimeHours50,
    overtimeHours100,
    absences,
  } = payrollData;

  // Calcula totais
  const totalEarnings = grossPay + (overtimePay50 || 0) + (overtimePay100 || 0);
  const totalDeductions = (inssAmount || 0) + (absenceDeduction || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Holerite Digital</h2>
              <p className="text-primary-100 mt-1">
                {referenceMonth}/{referenceYear} - Ciclo {cycle} ({cycle === 1 ? 'Dia 20' : 'Dia 05'})
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button
                variant="secondary"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Employee Info */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Funcionário</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{employee?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">CPF</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{employee?.cpf}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Cargo</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{employee?.position}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Departamento</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{employee?.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Salário Base</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(baseSalary)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Proventos</p>
                    <p className="text-2xl font-bold text-success-600 mt-1">
                      {formatCurrency(totalEarnings)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-success-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-danger-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Descontos</p>
                    <p className="text-2xl font-bold text-danger-600 mt-1">
                      {formatCurrency(totalDeductions)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-danger-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Section */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 text-success-600 mr-2" />
                Proventos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <PayslipLine
                  label="Salário Base (50%)"
                  value={grossPay}
                  info={`Referente ao ${cycle === 1 ? 'primeiro' : 'segundo'} ciclo quinzenal`}
                />
                
                {overtimePay50 > 0 && (
                  <PayslipLine
                    label="Horas Extras 50%"
                    value={overtimePay50}
                    info={`${overtimeHours50} horas trabalhadas`}
                    highlight="warning"
                  />
                )}
                
                {overtimePay100 > 0 && (
                  <PayslipLine
                    label="Horas Extras 100%"
                    value={overtimePay100}
                    info={`${overtimeHours100} horas trabalhadas`}
                    highlight="warning"
                  />
                )}

                <div className="px-6 py-4 bg-success-50 border-t-2 border-success-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">Total de Proventos</span>
                    <span className="text-xl font-bold text-success-600">
                      {formatCurrency(totalEarnings)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions Section */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg flex items-center">
                <TrendingDown className="h-5 w-5 text-danger-600 mr-2" />
                Descontos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {cycle === 2 && inssAmount > 0 && (
                  <PayslipLine
                    label="INSS"
                    value={inssAmount}
                    info="Desconto integral do INSS (calculado sobre salário mensal)"
                    highlight="danger"
                    showINSSBreakdown={true}
                    baseSalary={baseSalary}
                  />
                )}

                {cycle === 1 && (
                  <div className="px-6 py-4 bg-primary-50">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-primary-900">
                          INSS não descontado no Ciclo 1
                        </p>
                        <p className="text-xs text-primary-700 mt-1">
                          O desconto do INSS será aplicado integralmente no Ciclo 2 (Dia 05)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {absenceDeduction > 0 && (
                  <PayslipLine
                    label="Desconto de Faltas"
                    value={absenceDeduction}
                    info={`${absences} dia(s) de ausência`}
                    highlight="danger"
                  />
                )}

                {totalDeductions === 0 && cycle === 1 && (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum desconto aplicado neste ciclo
                  </div>
                )}

                <div className="px-6 py-4 bg-danger-50 border-t-2 border-danger-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">Total de Descontos</span>
                    <span className="text-xl font-bold text-danger-600">
                      {formatCurrency(totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FGTS Info */}
          <Card className="border-l-4 border-l-warning-500 bg-warning-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-warning-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">FGTS (8%)</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Valor provisionado mensalmente pela empresa, não descontado do funcionário
                  </p>
                  <p className="text-lg font-bold text-warning-700 mt-2">
                    {formatCurrency(fgtsAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Pay */}
          <Card className="border-4 border-primary-500 bg-gradient-to-br from-primary-50 to-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 uppercase font-medium">Valor Líquido a Receber</p>
                  <p className="text-4xl font-bold text-primary-600 mt-2">
                    {formatCurrency(netPay)}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="text-sm text-gray-600">
                      Pagamento em {cycle === 1 ? '20' : '05'}/{referenceMonth}/{referenceYear}
                    </span>
                  </div>
                </div>
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-start text-xs text-gray-500">
              <div>
                <p className="font-medium text-gray-700">Sistema de Gestão de RH</p>
                <p className="mt-1">Documento gerado automaticamente em {formatDate(new Date())}</p>
              </div>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function PayslipLine({ label, value, info, highlight, showINSSBreakdown, baseSalary }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
        highlight === 'warning' ? 'bg-warning-50' : 
        highlight === 'danger' ? 'bg-danger-50' : ''
      }`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              {showINSSBreakdown && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  {showDetails ? 'Ocultar' : 'Ver'} cálculo
                </button>
              )}
            </div>
            {info && (
              <p className="text-xs text-gray-500 mt-1">{info}</p>
            )}
          </div>
          <span className={`text-sm font-semibold ${
            highlight === 'warning' ? 'text-warning-700' :
            highlight === 'danger' ? 'text-danger-700' :
            'text-gray-900'
          }`}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>

      {/* INSS Breakdown */}
      {showDetails && showINSSBreakdown && (
        <div className="px-6 py-4 bg-gray-50 border-l-4 border-primary-400">
          <INSSBreakdown baseSalary={baseSalary} inssAmount={value} />
        </div>
      )}
    </>
  );
}

// INSS Breakdown Component
function INSSBreakdown({ baseSalary, inssAmount }) {
  const inssTable = [
    { min: 0, max: 1412.00, rate: 7.5 },
    { min: 1412.01, max: 2666.68, rate: 9.0 },
    { min: 2666.69, max: 4000.03, rate: 12.0 },
    { min: 4000.04, max: 7786.02, rate: 14.0 },
  ];

  // Calcula INSS progressivo
  let remaining = baseSalary;
  const breakdown = [];

  for (const bracket of inssTable) {
    if (remaining <= 0) break;
    
    const bracketBase = Math.min(remaining, bracket.max - bracket.min);
    const bracketAmount = bracketBase * (bracket.rate / 100);
    
    if (bracketAmount > 0) {
      breakdown.push({
        range: `R$ ${bracket.min.toFixed(2)} - R$ ${bracket.max.toFixed(2)}`,
        base: bracketBase,
        rate: bracket.rate,
        amount: bracketAmount,
      });
    }
    
    remaining -= bracketBase;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-700 uppercase">Cálculo Progressivo do INSS</p>
      <div className="space-y-2">
        {breakdown.map((item, index) => (
          <div key={index} className="flex justify-between text-xs">
            <span className="text-gray-600">
              {item.range} × {item.rate}%
            </span>
            <span className="font-medium text-gray-900">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-300 flex justify-between text-sm font-bold">
          <span>Total INSS:</span>
          <span className="text-danger-600">{formatCurrency(inssAmount)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 italic">
        * Cálculo baseado na tabela CLT 2024/2025
      </p>
    </div>
  );
}
