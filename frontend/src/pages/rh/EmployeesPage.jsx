import { useState } from 'react';
import { EmployeeForm } from '../../components/EmployeeForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { Users, Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' | 'view' | 'create'
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
  });

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.cpf?.includes(searchTerm);
    const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && emp.isActive) ||
                         (statusFilter === 'inactive' && !emp.isActive);
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  // Stats
  const stats = [
    {
      label: 'Total de Funcionários',
      value: employees.length,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Ativos',
      value: employees.filter(e => e.isActive).length,
      icon: Users,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Departamentos',
      value: departments.length,
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Folha Total',
      value: formatCurrency(employees.reduce((sum, e) => sum + (e.monthlySalary || 0), 0)),
      icon: Users,
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  const [deletingId, setDeletingId] = useState(null);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: employeeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      showToast('Funcionário removido com sucesso', 'success');
      setDeletingId(null);
    },
    onError: (error) => {
      const message = error?.message || 'Erro ao remover funcionário';
      showToast(message, 'error');
      setDeletingId(null);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover este funcionário?')) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleOpenModal = (employee = null, mode = 'edit') => {
    setSelectedEmployee(employee);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setModalMode('edit');
  };

  // Ao cadastrar funcionário, se for RH ou Gerente, já habilita acesso ao sistema (role)
  const handleEmployeeSubmit = async (form) => {
    // employeeService.create já envia o role, backend já cria usuário com acesso
    try {
      await employeeService.create(form);
      queryClient.invalidateQueries(['employees']);
      showToast('Funcionário cadastrado com sucesso', 'success');
      handleCloseModal();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erro ao cadastrar funcionário', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-600 mt-1">Gerencie os funcionários da empresa</p>
        </div>
        <Button onClick={() => handleOpenModal(null, 'edit')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">Todos os Departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum funcionário encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Cargo</th>
                    <th>Departamento</th>
                    <th>Salário</th>
                    <th>Admissão</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="font-medium">{employee.name}</td>
                      <td className="text-gray-600">{employee.cpf}</td>
                      <td className="text-gray-600">{employee.position}</td>
                      <td>
                        <Badge variant="outline">{employee.department}</Badge>
                      </td>
                      <td className="font-medium">{formatCurrency(employee.monthlySalary)}</td>
                      <td className="text-gray-600">{formatDate(employee.hireDate)}</td>
                      <td>
                        <Badge variant={employee.isActive ? 'success' : 'danger'}>
                          {employee.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="Visualizar"
                            onClick={() => handleOpenModal(employee, 'view')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800"
                            title="Editar"
                            onClick={() => handleOpenModal(employee, 'edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-800"
                            title={deletingId === employee.id ? 'Removendo...' : 'Remover'}
                            disabled={deletingId === employee.id}
                          >
                            <Trash2 className={`w-4 h-4 ${deletingId === employee.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Modal de Funcionário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {modalMode === 'view' ? 'Visualizar Funcionário' : selectedEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
              </CardTitle>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </CardHeader>
            <CardContent>
              <EmployeeForm
                initialData={selectedEmployee}
                mode={modalMode === 'view' ? 'view' : selectedEmployee ? 'edit' : 'create'}
                onSubmit={handleEmployeeSubmit}
                onCancel={handleCloseModal}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
