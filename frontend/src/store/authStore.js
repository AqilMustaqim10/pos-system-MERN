import { create } from "zustand";
import authService from "../services/authService";

const useAuthStore = create((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),

  // Set user
  setUser: (user) => set({ user, isAuthenticated: true }),

  // Logout
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  // Check role
  hasRole: (roles) => {
    const state = useAuthStore.getState();
    if (!state.user) return false;
    return roles.includes(state.user.role);
  },
}));

export default useAuthStore;
