import { api } from './base';
import type { ClienteAuth } from '../store/auth';
import type { Pedido } from '../types';

export interface AuthResponse extends ClienteAuth {
  token: string;
}

export const registroCliente = async (payload: {
  tiendaId: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await api.post('/clientes/registro', payload);
  return data.datos;
};

export const loginCliente = async (payload: {
  tiendaId: number;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await api.post('/clientes/login', payload);
  return data.datos;
};

export const olvidePasswordCliente = async (payload: {
  tiendaId: number;
  email: string;
}): Promise<void> => {
  await api.post('/clientes/olvide-password', payload);
};

export const reenviarVerificacionCliente = async (payload: {
  tiendaId: number;
  email: string;
}): Promise<void> => {
  await api.post('/clientes/reenviar-verificacion', payload);
};

export const getMisPedidos = async (): Promise<Pedido[]> => {
  const { data } = await api.get('/clientes/mis-pedidos');
  return data.datos?.datos ?? data.datos ?? [];
};
