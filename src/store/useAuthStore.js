import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Aqui puedes agregar o modificar los usuarios y contrasenas
const VALID_USERS = [
  { username: 'ADMIN', password: 'Admin2026' },
  { username: 'LEABAN', password: 'Leaban2026' },
  { username: 'AAMARTINEZ', password: 'Aamartinez2026' },
  { username: 'JISANCHEZ', password: 'Jisanchez2026' }
];

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      login: (username, password) => {
        const cleanUser = username.trim().toUpperCase();
        const cleanPass = password.trim();
        const found = VALID_USERS.find(u => u.username.toUpperCase() === cleanUser && u.password === cleanPass);
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
