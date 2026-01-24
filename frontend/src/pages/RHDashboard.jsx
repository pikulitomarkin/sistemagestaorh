import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { AttendanceCalendar } from '../components/AttendanceCalendar';
import { AttendanceModal } from '../components/AttendanceModal';
import { Search, Users, Calendar } from 'lucide-react';

const RHDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const employees = [
    { id: 1, name: 'Ana Silva', cpf: '123.456.789-00', department: 'TI' },
    { id: 2, name: 'Carlos Santos', cpf: '987.654.321-00', department: 'Vendas' },
    { id: 3, name: 'Julia Costa', cpf: '111.222.333-44', department: 'Marketing' },
    { id: 4, name: 'Roberto Lima', cpf: '555.666.777-88', department: 'TI' },
    { id: 5, name: 'Mariana Oliveira', cpf: '999.888.777-66', department: 'Vendas' },
    { id: 6, name: 'Pedro Alves', cpf: '444.333.222-11', department: 'Marketing' },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cpf.includes(searchTerm)
  );

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Se já tiver um funcionário selecionado, abre o modal diretamente
    if (selectedEmployee) {
      setIsModalOpen(true);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Se já tiver uma data selecionada, abre o modal diretamente
    if (selectedDate) {
      setIsModalOpen(true);
    }
  };

  const handleOpenModal = () => {
    if (selectedEmployee && selectedDate) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmAttendance = (data) => {
    // Aqui você faria a chamada à API
    console.log('Marcar frequência:', {
      employeeId: selectedEmployee.id,
      date: selectedDate,
      type: data.type,
      hours: data.hours,
    });

    // Feedback visual (você pode substituir por um toast)
    const typeLabels = {
      absence: 'Falta',
      overtime: `Hora Extra (${data.hours}h)`,
      night: 'Dobra/Noitada',
    };

    alert(`Frequência marcada: ${typeLabels[data.type]}`);

    // Limpar seleções após confirmar
    setSelectedEmployee(null);
    setSelectedDate(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard RH</h1>
          <p className="text-slate-600 mt-1">Gestão operacional de funcionários e frequência</p>
        </div>

        {/* Calendário */}
        <AttendanceCalendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />

        {/* Lista de Funcionários */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Lista de Funcionários</h2>
              <p className="text-sm text-slate-600 mt-1">Selecione um funcionário para lançar frequência</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Employees Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEmployees.map((employee) => {
              const isSelected = selectedEmployee?.id === employee.id;

              return (
                <button
                  key={employee.id}
                  onClick={() => handleEmployeeSelect(employee)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left touch-target ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {employee.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{employee.cpf}</p>
                      <p className="text-xs text-slate-500 mt-1">{employee.department}</p>
                    </div>
                    <Users 
                      size={20} 
                      className={isSelected ? 'text-indigo-600' : 'text-slate-400'} 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Status e Ação */}
        {(selectedEmployee || selectedDate) && (
          <Card className="bg-indigo-50 border-indigo-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-900 mb-2">Seleção atual:</p>
                <div className="space-y-1 text-sm">
                  {selectedEmployee && (
                    <p className="text-indigo-700">
                      <Users size={16} className="inline mr-2" />
                      Funcionário: <span className="font-semibold">{selectedEmployee.name}</span>
                    </p>
                  )}
                  {selectedDate && (
                    <p className="text-indigo-700">
                      <Calendar size={16} className="inline mr-2" />
                      Data: <span className="font-semibold">
                        {new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        }).format(selectedDate)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              {selectedEmployee && selectedDate && (
                <button
                  onClick={handleOpenModal}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors touch-target"
                >
                  Lançar Frequência
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Modal de Lançamento */}
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employee={selectedEmployee}
          date={selectedDate}
          onConfirm={handleConfirmAttendance}
        />
      </div>
    </DashboardLayout>
  );
};

export default RHDashboard;
