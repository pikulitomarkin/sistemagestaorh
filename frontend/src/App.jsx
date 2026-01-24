import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/ui/Toast';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import Attendance from './pages/Attendance';
import PayrollView from './pages/PayrollView';
import RHDashboard from './pages/RHDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

function AppRoutes() {
  try {
    const { user } = useAuth();

    const ProtectedRoute = ({ children, roles }) => {
      if (!user) return <Navigate to="/login" />;
      if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
      return children;
    };

    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Role-specific dashboards */}
          <Route 
            path="/dashboard/rh" 
            element={
              <ProtectedRoute roles={['RH']}>
                <RHDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/gerente" 
            element={
              <ProtectedRoute roles={['Gerente']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/funcionario" 
            element={
              <ProtectedRoute roles={['Funcionario']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Generic dashboard - redirects based on role */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {user?.role === 'RH' && <Navigate to="/dashboard/rh" />}
                {user?.role === 'Gerente' && <Navigate to="/dashboard/gerente" />}
                {user?.role === 'Funcionario' && <Navigate to="/dashboard/funcionario" />}
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/attendance" 
            element={
              <ProtectedRoute roles={['RH']}>
                <Attendance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payroll" 
            element={
              <ProtectedRoute roles={['Funcionario']}>
                <PayrollView />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    );
  } catch (error) {
    console.error('Error in App:', error);
    return <div className="p-4">Erro no app. Verifique console.</div>;
  }
}

export default App;
