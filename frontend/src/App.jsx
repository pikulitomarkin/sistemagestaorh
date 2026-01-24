import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import Attendance from './pages/Attendance';
import PayrollView from './pages/PayrollView';

function App() {
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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['RH']}><Attendance /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute roles={['Funcionario']}><PayrollView /></ProtectedRoute>} />
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
