import { useState, useEffect } from 'react';
import api from '../services/api';
// import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // const decoded = jwtDecode(token);
        // setUser({ role: decoded.role, username: decoded.unique_name });
        setUser({ role: 'Funcionario', username: 'test' }); // Temporário
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.Token);
      // const decoded = jwtDecode(res.data.Token);
      // setUser({ role: decoded.role, username: decoded.unique_name });
      setUser({ role: res.data.Role, username: username }); // Temporário
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, login, logout };
};