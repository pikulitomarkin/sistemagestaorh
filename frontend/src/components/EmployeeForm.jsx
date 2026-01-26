import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { employeeService } from '../services/api';
import { useToast } from './ui/Toast';

/**
 * EmployeeForm - Formulário reutilizável para cadastro/edição de funcionário
 * Permite modo de visualização (readOnly) e edição/criação
 * Props:
 *   - initialData: dados iniciais do funcionário (ou null para novo)
 *   - mode: 'view' | 'edit' | 'create'
 *   - onSubmit: função chamada ao salvar
 *   - onCancel: função chamada ao cancelar/fechar
 */
export function EmployeeForm({ initialData = null, mode = 'edit', onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    cpf: initialData?.cpf || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    monthlySalary: initialData?.monthlySalary || '',
    monthlyWorkHours: initialData?.monthlyWorkHours || 220,
    hireDate: (function() {
      const hd = initialData?.hireDate;
      if (!hd) return '';
      try {
        if (typeof hd === 'string') return hd.slice(0, 10);
        return new Date(hd).toISOString().slice(0, 10);
      } catch (e) {
        console.error('Failed to parse hireDate', e, hd);
        return '';
      }
    })(),
    username: initialData?.username || '',
    password: '',
    role: initialData?.role || 'Colaborador',
  });
  const [errors, setErrors] = useState({});
  const readOnly = mode === 'view';

  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear server error for this field on change
    setErrors(prev => {
      const copy = { ...prev };
      if (copy[name]) delete copy[name];
      return copy;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    // Validação simples
    const newErrors = {};
    if (!form.name) newErrors.name = 'Nome obrigatório';
    if (!form.cpf) newErrors.cpf = 'CPF obrigatório';
    if (!form.position) newErrors.position = 'Cargo obrigatório';
    if (!form.department) newErrors.department = 'Departamento obrigatório';
    if (!form.monthlySalary) newErrors.monthlySalary = 'Salário obrigatório';
    if (!form.hireDate) newErrors.hireDate = 'Data de admissão obrigatória';
    if (mode === 'create' && !form.password) newErrors.password = 'Senha obrigatória';
    if (!form.username) newErrors.username = 'Usuário obrigatório';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome Completo" name="name" value={form.name} onChange={handleChange} readOnly={readOnly} error={errors.name} required />
        <Input label="CPF" name="cpf" value={form.cpf} onChange={handleChange} onBlur={async() => {
          if (readOnly) return;
          if (!form.cpf) return;
          if (initialData?.cpf && form.cpf === initialData.cpf) return; // unchanged
          try {
            const resp = await employeeService.checkAvailability({ cpf: form.cpf });
            if (!resp.available) {
              setErrors(prev => ({ ...prev, cpf: resp.message || 'CPF já cadastrado' }));
              showToast(resp.message || 'CPF já cadastrado', 'error');
            }
          } catch (err) {
            console.error('CPF check failed', err);
          }
        }} readOnly={readOnly} error={errors.cpf} required />
        <Input label="Cargo" name="position" value={form.position} onChange={handleChange} readOnly={readOnly} error={errors.position} required />
        <Input label="Departamento" name="department" value={form.department} onChange={handleChange} readOnly={readOnly} error={errors.department} required />
        <Input label="Salário Mensal" name="monthlySalary" type="number" value={form.monthlySalary} onChange={handleChange} readOnly={readOnly} error={errors.monthlySalary} required />
        <Input label="Carga Horária Mensal" name="monthlyWorkHours" type="number" value={form.monthlyWorkHours} onChange={handleChange} readOnly={readOnly} error={errors.monthlyWorkHours} required />
        <Input label="Data de Admissão" name="hireDate" type="date" value={form.hireDate} onChange={handleChange} readOnly={readOnly} error={errors.hireDate} required />
        <Input label="Usuário" name="username" value={form.username} onChange={handleChange} onBlur={async() => {
          if (readOnly) return;
          if (!form.username) return;
          if (initialData?.username && form.username === initialData.username) return; // unchanged
          try {
            const resp = await employeeService.checkAvailability({ username: form.username });
            if (!resp.available) {
              setErrors(prev => ({ ...prev, username: resp.message || 'Usuário já existe' }));
              showToast(resp.message || 'Usuário já existe', 'error');
            }
          } catch (err) {
            console.error('Username check failed', err);
          }
        }} readOnly={readOnly} error={errors.username} required />
        {mode === 'create' && (
          <Input label="Senha" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required />
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Usuário</label>
          <select name="role" value={form.role} onChange={handleChange} disabled={readOnly} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg">
            <option value="Colaborador">Colaborador</option>
            <option value="RH">RH</option>
            <option value="Gerente">Gerente</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        {!readOnly && <Button type="submit">{mode === 'edit' ? 'Salvar' : 'Cadastrar'}</Button>}
      </div>
    </form>
  );
}
