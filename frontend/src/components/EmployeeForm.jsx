import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCPF } from '../hooks/useCPF';

export const EmployeeForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const cpf = useCPF(initialData?.cpf || '');
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [salary, setSalary] = useState(initialData?.salary || '');
  const [monthlyHours, setMonthlyHours] = useState(initialData?.monthlyHours || '220');
  const [role, setRole] = useState(initialData?.role || 'Funcionario');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!cpf.isValid) {
      cpf.onBlur();
      if (!cpf.value) {
        newErrors.cpf = 'CPF é obrigatório';
      } else {
        newErrors.cpf = cpf.error;
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!department.trim()) {
      newErrors.department = 'Departamento é obrigatório';
    }

    if (!salary || parseFloat(salary) <= 0) {
      newErrors.salary = 'Salário deve ser maior que zero';
    }

    if (!monthlyHours || parseFloat(monthlyHours) <= 0) {
      newErrors.monthlyHours = 'Carga horária mensal deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Envia apenas os números do CPF (sem máscara)
      const formData = {
        name: name.trim(),
        cpf: cpf.value, // Apenas números
        email: email.trim(),
        department: department.trim(),
        salary: parseFloat(salary),
        role: role,
      };

      await onSubmit(formData);
      
      // Limpa o formulário após sucesso
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      setErrors({ submit: 'Erro ao salvar funcionário. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    cpf.clear();
    setEmail('');
    setDepartment('');
    setSalary('');
    setMonthlyHours('220');
    setRole('Funcionario');
    setErrors({});
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {initialData ? 'Editar Funcionário' : 'Novo Cadastro de Funcionário'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Preencha os dados do funcionário
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target"
              aria-label="Fechar"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Nome */}
            <Input
              label="Nome Completo"
              type="text"
              placeholder="Digite o nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            {/* CPF */}
            <Input
              label="CPF"
              type="text"
              placeholder="000.000.000-00"
              value={cpf.maskedValue}
              onChange={cpf.onChange}
              onBlur={cpf.onBlur}
              maxLength={14}
              error={errors.cpf || cpf.error}
              required
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="funcionario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />

            {/* Departamento e Salário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Departamento"
                type="text"
                placeholder="Ex: TI, Vendas, Marketing"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                error={errors.department}
                required
              />

              <Input
                label="Salário Mensal (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                error={errors.salary}
                required
              />
            </div>

            {/* Jornada Mensal */}
            <Input
              label="Carga Horária Mensal (horas)"
              type="number"
              step="0.5"
              min="0"
              placeholder="220"
              value={monthlyHours}
              onChange={(e) => setMonthlyHours(e.target.value)}
              error={errors.monthlyHours}
              required
            />

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tipo de Usuário
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Funcionario">Funcionário</option>
                <option value="RH">RH</option>
                <option value="Gerente">Gerente</option>
              </select>
            </div>

            {/* Erro de submit */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleClose}
                className="flex-1 touch-target"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 touch-target"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
