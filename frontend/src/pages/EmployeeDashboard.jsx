import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PayrollSlip } from '../components/PayrollSlip';
import { DollarSign, Download, Calendar, FileText } from 'lucide-react';
import api from '../services/api';

const EmployeeDashboard = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payroll/my-payrolls');
      setPayrolls(response.data || []);
      
      // Define o próximo pagamento baseado na última folha
      if (response.data && response.data.length > 0) {
        const latest = response.data[0];
        setSelectedPayroll(latest);
      }
    } catch (error) {
      console.error('Erro ao buscar holerites:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getNextPayment = () => {
    if (payrolls.length === 0) {
      return {
        date: '20/02/2026',
        amount: 'R$ 0,00',
        period: 'Aguardando fechamento',
      };
    }
    
    const latest = payrolls[0];
    const nextDate = latest.paymentType === 'Adiantamento' ? '05' : '20';
    const nextMonth = new Date(latest.periodEnd);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return {
      date: `${nextDate}/${String(nextMonth.getMonth() + 1).padStart(2, '0')}/${nextMonth.getFullYear()}`,
      amount: formatCurrency(latest.netSalary),
      period: new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(nextMonth),
    };
  };

  const nextPayment = getNextPayment();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Dashboard</h1>
          <p className="text-slate-600 mt-1">Acompanhe seus pagamentos e holerites</p>
        </div>

        {/* Próximo Pagamento - Card de Destaque */}
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-indigo-100 text-sm mb-2">Próximo Fechamento</p>
              <div className="flex items-baseline gap-2 mb-1">
                <DollarSign size={32} className="text-indigo-200" />
                <span className="text-4xl font-bold">{nextPayment.amount}</span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-indigo-100">
                <Calendar size={18} />
                <span className="text-sm">{nextPayment.period}</span>
                <span className="text-indigo-200">•</span>
                <span className="text-sm">Pagamento em {nextPayment.date}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <DollarSign size={48} className="text-indigo-200" />
              </div>
            </div>
          </div>
        </Card>

        {/* Holerite Selecionado */}
        {selectedPayroll && (
          <PayrollSlip payroll={selectedPayroll} />
        )}

        {/* Histórico de Fechamentos */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Histórico de Fechamentos</h2>
            <p className="text-sm text-slate-600 mt-1">Visualize seus holerites anteriores</p>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum holerite disponível</div>
          ) : (
            <div className="space-y-3">
              {payrolls.map((payroll) => (
                <div
                  key={payroll.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                    selectedPayroll?.id === payroll.id
                      ? 'bg-indigo-50 border-2 border-indigo-300'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                  onClick={() => setSelectedPayroll(payroll)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {payroll.paymentType === 'Adiantamento' ? 'Adiantamento' : 'Folha Principal'} - {formatDate(payroll.periodEnd)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-slate-600">{formatCurrency(payroll.netSalary)}</p>
                          <span className="text-slate-400">•</span>
                          <p className="text-sm text-slate-600">
                            {formatDate(payroll.periodStart)} a {formatDate(payroll.periodEnd)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={selectedPayroll?.id === payroll.id ? "primary" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPayroll(payroll);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Visualizar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold text-slate-900 mb-2">Informações Importantes</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Os holerites ficam disponíveis até 12 meses</li>
              <li>• Pagamentos são realizados nos dias 5 e 20 de cada mês</li>
              <li>• Em caso de dúvidas, entre em contato com o RH</li>
            </ul>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-900 mb-2">Próximos Eventos</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-slate-900">Fechamento Janeiro</p>
                  <p className="text-slate-600">20 de Fevereiro</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-slate-900">Fechamento Fevereiro</p>
                  <p className="text-slate-600">5 de Março</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
