import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Carrito } from '../types';

interface CarritoStore {
  carrito: Carrito;
  sessionId: string;
  isOpen: boolean;
  setCarrito: (c: Carrito) => void;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
}

const generateSessionId = () => `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const useCarritoStore = create<CarritoStore>()(
  persist(
    (set) => ({
      carrito: { items: [] },
      sessionId: generateSessionId(),
      isOpen: false,
      setCarrito: (carrito) => set({ carrito }),
      abrirCarrito: () => set({ isOpen: true }),
      cerrarCarrito: () => set({ isOpen: false }),
    }),
    {
      name: 'shopv3-carrito',
      partialize: (s) => ({ sessionId: s.sessionId }),
    }
  )
);
