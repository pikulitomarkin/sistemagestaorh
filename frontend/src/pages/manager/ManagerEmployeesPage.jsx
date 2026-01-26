import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { employeeService } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { Users, Search, Plus, Edit, X, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

// Validation schema
const employeeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (formato: 000.000.000-00)'),
  position: z.string().min(2, 'Cargo é obrigatório'),
  department: z.string().min(2, 'Departamento é obrigatório'),
  monthlySalary: z.number().min(0, 'Salário deve ser maior que zero'),
  monthlyWorkHours: z.number().min(1, 'Horas mensais obrigatórias'),
  hireDate: z.string(),
  username: z.string().min(3, 'Usuário deve ter no mínimo 3 caracteres'),
  password: z.string().min(3, 'Senha deve ter no mínimo 3 caracteres'),
});

export function ManagerEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Abrir modal automaticamente se vier de /manager/team?novo=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('novo') === '1') {
      handleOpenModal();
      // Limpa a query string após abrir
      navigate('/manager/team', { replace: true });
    }
    // eslint-disable-next-line
  }, [location.search]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      monthlyWorkHours: 220,
      hireDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
  }, [location.search]);

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
  });

  // Filter employees
  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cpf?.includes(searchTerm)
  );

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingEmployee) {
        return employeeService.update(editingEmployee.id, data);
      }
      return employeeService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      showToast(
        editingEmployee ? 'Funcionário atualizado com sucesso' : 'Funcionário cadastrado com sucesso',
        'success'
      );
      handleCloseModal();
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Erro ao salvar funcionário', 'error');
    },
  });

  const [deletingId, setDeletingId] = useState(null);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: employeeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      showToast('Funcionário excluído com sucesso', 'success');
      setDeletingId(null);
    },
    onError: (error) => {
      showToast(error.response?.data?.message || error?.message || 'Erro ao excluir funcionário', 'error');
      setDeletingId(null);
    },
  });

  const handleDelete = (employee) => {
    if (window.confirm(`Tem certeza que deseja excluir ${employee.name}?\n\nEsta ação não pode ser desfeita.`)) {
      setDeletingId(employee.id);
      deleteMutation.mutate(employee.id);
    }
  };

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee);
    if (employee) {
      Object.keys(employee).forEach(key => {
        setValue(key, employee[key]);
      });
    } else {
      reset();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    reset();
  };

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      monthlySalary: Number(data.monthlySalary),
      monthlyWorkHours: Number(data.monthlyWorkHours),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Funcionários</h1>
          <p className="text-gray-600 mt-1">Cadastre e atualize dados da sua equipe</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum funcionário encontrado</div>
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
                      <td><Badge variant="outline">{employee.department}</Badge></td>
                      <td className="font-medium">{formatCurrency(employee.monthlySalary)}</td>
                      <td>
                        <Badge variant={employee.isActive ? 'success' : 'danger'}>
                          {employee.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(employee)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(employee)}
                            disabled={deletingId === employee.id}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            {deletingId === employee.id ? (
                              'Removendo...'
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Excluir
                              </>
                            )}
                          </Button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
              </CardTitle>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <Input {...register('name')} />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                    <Input {...register('cpf')} placeholder="000.000.000-00" />
                    {errors.cpf && <p className="text-red-600 text-sm mt-1">{errors.cpf.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                    <Input {...register('position')} />
                    {errors.position && <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                    <Input {...register('department')} />
                    {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salário Mensal *</label>
                    <Input type="number" step="0.01" {...register('monthlySalary', { valueAsNumber: true })} />
                    {errors.monthlySalary && <p className="text-red-600 text-sm mt-1">{errors.monthlySalary.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horas Mensais *</label>
                    <Input type="number" {...register('monthlyWorkHours', { valueAsNumber: true })} />
                    {errors.monthlyWorkHours && <p className="text-red-600 text-sm mt-1">{errors.monthlyWorkHours.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão *</label>
                    <Input type="date" {...register('hireDate')} />
                    {errors.hireDate && <p className="text-red-600 text-sm mt-1">{errors.hireDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário *</label>
                    <Input {...register('username')} />
                    {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
                  </div>

                  {!editingEmployee && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                      <Input type="password" {...register('password')} />
                      {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saveMutation.isPending}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6"
                  >
                    {saveMutation.isPending ? 'Salvando...' : editingEmployee ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
