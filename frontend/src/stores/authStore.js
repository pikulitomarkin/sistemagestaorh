import { create } from 'zustand';
import { authService } from '../services/api';

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (username, password) => {
    try {
      const data = await authService.login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true 
      });
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  hasRole: (role) => {
    const state = useAuthStore.getState();
    return state.user?.role === role;
  },
  
  hasAnyRole: (roles) => {
    const state = useAuthStore.getState();
    return roles.includes(state.user?.role);
  },
}));

export default useAuthStore;
