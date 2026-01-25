import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.username, data.password);
      toast.success(`Bem-vindo, ${result.user.name}!`);
      
      // Redirect based on role
      const roleRoutes = {
        'RH': '/rh/dashboard',
        'Gerente': '/manager/dashboard',
        'Colaborador': '/employee/dashboard',
      };
      
      navigate(roleRoutes[result.user.role] || '/');
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const submitForm = handleSubmit(onSubmit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">HR</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestão de RH</h1>
          <p className="text-gray-600 mt-2">Enterprise Edition</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Entrar no Sistema</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Usuário"
                placeholder="Digite seu usuário"
                {...register('username')}
                error={errors.username?.message}
                autoFocus
              />

              <Input
                type="password"
                label="Senha"
                placeholder="Digite sua senha"
                {...register('password')}
                error={errors.password?.message}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
              >
                <LogIn className="h-5 w-5 mr-2" />
                Entrar
              </Button>
            </form>

            {/* Test Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Credenciais de Teste:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>RH:</strong> rh_test / 123</p>
                <p><strong>Gerente:</strong> gerente_test / 123</p>
                <p><strong>Colaborador:</strong> colaborador_test / 123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 Sistema de Gestão de RH. Todos os direitos reservados.
        </p>
      </div>

      {/* Floating Entrar button for quick access */}
      <button
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none"
        onClick={submitForm}
        aria-label="Entrar"
      >
        <LogIn className="w-5 h-5" />
      </button>
    </div>
  );
}
