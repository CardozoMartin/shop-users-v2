import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClienteAuth {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  emailVerificado: boolean;
}

interface AuthStore {
  cliente: ClienteAuth | null;
  token: string | null;
  setAuth: (cliente: ClienteAuth, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      cliente: null,
      token: null,
      setAuth: (cliente, token) => {
        // Guardamos el token donde api/base.ts lo lee para el header Authorization
        localStorage.setItem('auth-token', token);
        set({ cliente, token });
      },
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ cliente: null, token: null });
      },
    }),
    { name: 'shopv3-auth' }
  )
);
