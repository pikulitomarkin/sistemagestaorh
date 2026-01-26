import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cria instância do Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request - Injeta o Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Tratamento Global de Erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // 401 - Não autenticado
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
      }

      // 403 - Não autorizado
      if (status === 403) {
        return Promise.reject(new Error('Você não tem permissão para acessar este recurso.'));
      }

      // 404 - Não encontrado
      if (status === 404) {
        return Promise.reject(new Error('Recurso não encontrado.'));
      }

      // 500 - Erro no servidor
      if (status >= 500) {
        return Promise.reject(new Error('Erro no servidor. Tente novamente mais tarde.'));
      }

      // Outros erros
      const message = error.response.data?.message || error.response.data || 'Erro ao processar requisição';
      return Promise.reject(new Error(message));
    }

    // Erro de rede
    if (error.request) {
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'));
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ==================== EMPLOYEES ====================
export const employeeService = {
  getAll: async (params) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Check availability for cpf or username
  checkAvailability: async (params) => {
    const response = await api.get('/employees/check', { params });
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get('/employees/statistics');
    return response.data;
  },
};

// ==================== ATTENDANCE ====================
export const attendanceService = {
  getAll: async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },
  
  createBatch: async (dataArray) => {
    const response = await api.post('/attendance/bulk', dataArray);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
  
  getByCycle: async (month, year, cycle) => {
    const response = await api.get(`/attendance/cycle/${month}/${year}/${cycle}`);
    return response.data;
  },
  
  getByEmployee: async (employeeId, params) => {
    const response = await api.get(`/attendance/employee/${employeeId}`, { params });
    return response.data;
  },
};

// ==================== PAYROLL ====================
export const payrollService = {
  getAll: async (params) => {
    const response = await api.get('/payroll', { params });
    return response.data;
  },
  
  getMyPayrolls: async (params) => {
    const response = await api.get('/payroll/my-payrolls', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },
  
  calculate: async (data) => {
    const response = await api.post('/payroll/calculate', data);
    return response.data;
  },
  
  processBatch: async (month, year, cycle) => {
    const response = await api.post('/payroll/process-batch', { month, year, cycle });
    return response.data;
  },

  processCycle: async ({ employeeIds, cycleType, referenceDate, includeOvertime = true, includeDoubleTime = true }) => {
    // Sends selected employee IDs along with cycle info and flags to the API
    const payload = { EmployeeIds: employeeIds, CycleType: cycleType, ReferenceDate: referenceDate, IncludeOvertime: includeOvertime, IncludeDoubleTime: includeDoubleTime };
    const response = await api.post('/payroll/process-cycle', payload);
    return response.data;
  },
  
  getByEmployee: async (employeeId, params) => {
    const response = await api.get(`/payroll/employee/${employeeId}`, { params });
    return response.data;
  },
  
  getByCycle: async (month, year, cycle) => {
    const response = await api.get(`/payroll/cycle/${month}/${year}/${cycle}`);
    return response.data;
  },
  
  getPayslip: async (id) => {
    const response = await api.get(`/payroll/${id}/payslip`);
    return response.data;
  },
  
  getAnalytics: async (month, year) => {
    const response = await api.get(`/payroll/analytics/${month}/${year}`);
    return response.data;
  },
};

export default api;
