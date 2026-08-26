import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Aqui puedes agregar o modificar los usuarios y contrasenas
const VALID_USERS = [
  { username: 'comprador1', password: '123' },
  { username: 'comprador2', password: '123' },
  { username: 'limhi', password: '123' }
];

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      login: (username, password) => {
        const found = VALID_USERS.find(u => u.username === username && u.password === password);
        if (found) {
          set({ isAuthenticated: true, user: found.username });
          return true;
        }
        return false;
      },
      
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
