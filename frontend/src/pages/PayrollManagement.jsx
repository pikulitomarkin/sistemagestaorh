import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PayrollSummary } from '../components/PayrollSummary';
import { Calendar, Calculator, FileText, Search } from 'lucide-react';
import api from '../services/api';

const PayrollManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [paymentType, setPaymentType] = useState('FolhaPrincipal');
  const [calculatedPayroll, setCalculatedPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    }
  };

  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCalculate = async () => {
    if (!selectedEmployee || !referenceDate) {
      alert('Selecione um funcionário e defina a data de referência');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payroll/calculate-cycle', {
        employeeId: selectedEmployee.id,
        cycleType: paymentType,
        referenceDate: new Date(referenceDate).toISOString(),
      });
      
      setCalculatedPayroll(response.data);
    } catch (error) {
      console.error('Erro ao calcular folha:', error);
      alert('Erro ao calcular folha de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Folha de Pagamento</h1>
          <p className="text-slate-600 mt-1">Calcule e gere folhas de pagamento quinzenais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Cálculo */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-6">
              <Calculator size={20} className="text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">Calcular Folha</h2>
            </div>

            <div className="space-y-4">
              {/* Tipo de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tipo de Pagamento
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Advance">Adiantamento (Dia 20)</option>
                  <option value="Full">Folha Principal (Dia 5)</option>
                </select>
              </div>

              {/* Busca de Funcionário */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Funcionário
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    placeholder="Buscar funcionário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchTerm && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSearchTerm('');
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                          selectedEmployee?.id === emp.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <p className="font-medium text-slate-900">{emp.name}</p>
                        <p className="text-sm text-slate-600">{emp.department}</p>
                      </button>
                    ))}
                  </div>
                )}
                {selectedEmployee && (
                  <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                    <p className="font-medium text-indigo-900">{selectedEmployee.name}</p>
                    <p className="text-sm text-indigo-700">
                      {selectedEmployee.department} • Salário: R$ {selectedEmployee.salary.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data de Referência"
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  required
                />
              </div>

              {/* Botão Calcular */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleCalculate}
                disabled={loading || !selectedEmployee || !referenceDate}
                className="w-full touch-target"
              >
                {loading ? 'Calculando...' : 'Calcular Folha'}
              </Button>
            </div>
          </Card>

          {/* Resumo da Folha */}
          <div>
            {calculatedPayroll ? (
              <PayrollSummary payroll={calculatedPayroll} />
            ) : (
              <Card padding="lg" className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-slate-500">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>Calcule uma folha para visualizar o resumo</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PayrollManagement;
