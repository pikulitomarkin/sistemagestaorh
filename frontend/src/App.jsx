import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from './components/ui/Toast';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RHDashboard } from './pages/rh/RHDashboard';
import { AttendancePage } from './pages/rh/AttendancePage';
import { EmployeesPage } from './pages/rh/EmployeesPage';
import { PayrollPage } from './pages/rh/PayrollPage';
import { ReportsPage } from './pages/rh/ReportsPage';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ManagerEmployeesPage } from './pages/manager/ManagerEmployeesPage';
import { ManagerReportsPage } from './pages/manager/ManagerReportsPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeAttendancePage } from './pages/employee/EmployeeAttendancePage';
import { EmployeePayslipsPage } from './pages/employee/EmployeePayslipsPage';
import useAuthStore from './stores/authStore';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes - RH */}
            <Route path="/rh" element={
              <ProtectedRoute allowedRoles={['RH']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/rh/dashboard" replace />} />
              <Route path="dashboard" element={<RHDashboard />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* Protected Routes - Manager */}
            <Route path="/manager" element={
              <ProtectedRoute allowedRoles={['Gerente']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/manager/dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="team" element={<ManagerEmployeesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="reports" element={<ManagerReportsPage />} />
            </Route>

            {/* Protected Routes - Employee */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['Colaborador']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<EmployeeAttendancePage />} />
              <Route path="payslips" element={<EmployeePayslipsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="text-gray-600 mt-2">Página não encontrada</p>
              </div>
            </div>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
