import { api } from './base';
import type { Tienda, Producto, Categoria, PaginatedResponse, Carrito, ResenaTienda, ResenaProducto, ResenasEstadisticas, CrearPedidoDto, Pedido, Popup } from '../types';

export interface TiendaListItem {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  logoUrl?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  _count?: { productos: number };
}

export const listarTiendas = async (
  busqueda?: string,
  pagina = 1
): Promise<{ datos: TiendaListItem[]; totalPaginas: number; total: number }> => {
  const { data } = await api.get('/tiendas/', {
    params: { busqueda: busqueda || undefined, pagina, limite: 24, orden: 'vistas', direccion: 'desc' },
  });
  // Este endpoint devuelve el array directo en data.datos (no viene anidado/paginado).
  // La metadata de paginación va aparte en data.paginacion si existe.
  const arr = Array.isArray(data.datos) ? data.datos : (data.datos?.datos ?? []);
  const meta = data.paginacion ?? data.meta ?? {};
  return {
    datos: arr,
    total: meta.total ?? arr.length,
    totalPaginas: meta.totalPaginas ?? 1,
  };
};

export const getTiendaBySlug = async (slug: string): Promise<Tienda> => {
  const { data } = await api.get(`/tiendas/${slug}/`);
  return data.datos;
};

// Resuelve la tienda a partir de un dominio propio (ej: www.mitienda.com).
export const getTiendaByDominio = async (host: string): Promise<Tienda> => {
  const { data } = await api.get('/tiendas/por-dominio', { params: { host } });
  return data.datos;
};

export const getProductosDestacados = async (tiendaId: number): Promise<Producto[]> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/productos/destacados`, {
    params: { limite: 12 },
  });
  // El endpoint devuelve paginado: data.datos = { datos: [...], total, ... }
  const paginado = data.datos;
  return paginado?.datos ?? (Array.isArray(paginado) ? paginado : []);
};

export const getProductosNormales = async (
  tiendaId: number,
  params: { categoriaId?: number; busqueda?: string; pagina?: number; limite?: number }
): Promise<PaginatedResponse<Producto>> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/productos/normales`, { params });
  const paginado = data.datos;
  return {
    datos: paginado?.datos ?? [],
    total: paginado?.total ?? 0,
    pagina: paginado?.pagina ?? 1,
    limite: paginado?.limite ?? 12,
    totalPaginas: paginado?.totalPaginas ?? 1,
  };
};

export interface FiltrosProductos {
  busqueda?: string;
  categoriaId?: number;
  tags?: string;
  precioMin?: number;
  precioMax?: number;
  orden?: 'nombre' | 'precio' | 'vistas' | 'creadoEn' | 'destacado';
  direccion?: 'asc' | 'desc';
  pagina?: number;
  limite?: number;
}

export const getProductos = async (
  tiendaId: number,
  filtros: FiltrosProductos
): Promise<PaginatedResponse<Producto>> => {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
  const { data } = await api.get(`/tiendas/${tiendaId}/productos/`, { params });
  const paginado = data.datos;
  return {
    datos: paginado?.datos ?? [],
    total: paginado?.total ?? 0,
    pagina: paginado?.pagina ?? 1,
    limite: paginado?.limite ?? 20,
    totalPaginas: paginado?.totalPaginas ?? 1,
  };
};

// ── Promociones / Ofertas ──
export interface PromocionNav {
  id: number;
  nombre: string;
  slug: string;
}

export interface PromocionProductoPublico extends Producto {
  precioEfectivo: number;
  enOferta: boolean;
  descuento: { tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO'; valor: number } | null;
}

export interface PromocionPublica {
  id: number;
  nombre: string;
  slug: string;
  bannerTitulo?: string | null;
  bannerImagenUrl?: string | null;
  vigente: boolean;
  productos: PromocionProductoPublico[];
}

// Promos activas de la tienda (para los links del navbar).
export const getPromocionesNav = async (tiendaId: number): Promise<PromocionNav[]> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/promociones`);
  return data.datos ?? [];
};

// Landing de una oferta por slug: sus productos con precio ya calculado.
export const getPromocionPorSlug = async (tiendaId: number, slug: string): Promise<PromocionPublica> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/promociones/${slug}`);
  return data.datos;
};

export const getPopupActivo = async (tiendaId: number): Promise<Popup | null> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/popup`);
  return data.datos ?? null;
};

export const getProductoById = async (tiendaId: number, productoId: number): Promise<Producto> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/productos/${productoId}`);
  return data.datos;
};

export const getCategorias = async (tiendaId: number): Promise<Categoria[]> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/productos/categorias`);
  return data.datos ?? [];
};

export const getResenasTienda = async (
  tiendaId: number,
  params: { pagina?: number; limite?: number } = {}
): Promise<PaginatedResponse<ResenaTienda>> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/resenas/`, { params });
  // Reseñas como array en data.datos y metadata en data.paginacion (con fallback anidado).
  const arr = Array.isArray(data.datos) ? data.datos : (data.datos?.datos ?? []);
  const meta = data.paginacion ?? data.datos ?? {};
  return {
    datos: arr,
    total: meta.total ?? arr.length,
    pagina: meta.pagina ?? 1,
    limite: meta.limite ?? 10,
    totalPaginas: meta.totalPaginas ?? 1,
  };
};

export const getResenasEstadisticas = async (tiendaId: number): Promise<ResenasEstadisticas> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/resenas/estadisticas`);
  return data.datos ?? { promedio: 0, total: 0, distribucion: [] };
};

export const getResenasProducto = async (
  tiendaId: number,
  productoId: number,
  params: { pagina?: number; limite?: number } = {}
): Promise<PaginatedResponse<ResenaProducto>> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/productos/${productoId}/resenas/`, {
    params: { soloAprobadas: true, ...params },
  });
  // Este endpoint devuelve las reseñas como array en data.datos y la metadata
  // aparte en data.paginacion. Contemplamos también el formato anidado por si acaso.
  const arr = Array.isArray(data.datos) ? data.datos : (data.datos?.datos ?? []);
  const meta = data.paginacion ?? data.datos ?? {};
  return {
    datos: arr,
    total: meta.total ?? arr.length,
    pagina: meta.pagina ?? 1,
    limite: meta.limite ?? 10,
    totalPaginas: meta.totalPaginas ?? 1,
  };
};

// Crear reseña de TIENDA (solo texto + calificación). Requiere cliente logueado
// (el token viaja automáticamente por el interceptor de api/base.ts).
export const crearResenaTienda = async (
  tiendaId: number,
  payload: { calificacion: number; comentario?: string; autorNombre?: string }
): Promise<ResenaTienda> => {
  const { data } = await api.post(`/tiendas/${tiendaId}/resenas/`, payload);
  return data.datos;
};

// Crear reseña de PRODUCTO (calificación + comentario + imagen opcional).
// Usa multipart/form-data porque el endpoint acepta una imagen.
export const crearResenaProducto = async (
  productoId: number,
  payload: { calificacion: number; comentario?: string; imagen?: File | null }
): Promise<ResenaProducto> => {
  const form = new FormData();
  form.append('calificacion', String(payload.calificacion));
  if (payload.comentario) form.append('comentario', payload.comentario);
  if (payload.imagen) form.append('imagen', payload.imagen);

  const { data } = await api.post(`/mis-productos/${productoId}/resenas/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.datos;
};

export const getProductosRelacionados = async (
  tiendaId: number,
  productoId: number,
  categoriaId?: number
): Promise<Producto[]> => {
  const res = await getProductos(tiendaId, {
    categoriaId,
    limite: 10,
    orden: 'vistas',
    direccion: 'desc',
  });
  // Excluimos el producto que estamos viendo
  return res.datos.filter((p) => p.id !== productoId).slice(0, 8);
};

// El sessionId también viaja en el header x-session-id (ver api/base.ts),
// pero lo mandamos además en body/query porque el backend lo acepta en ambos.

export const getCarrito = async (tiendaId: number, sessionId: string): Promise<Carrito> => {
  const { data } = await api.get(`/carrito/${tiendaId}/${sessionId}`, {
    params: { sessionId },
  });
  return data.datos ?? { items: [] };
};

export const agregarAlCarrito = async (body: {
  tiendaId: number;
  sessionId: string;
  productoId: number;
  varianteId?: number | null;
  cantidad: number;
}): Promise<Carrito> => {
  const { data } = await api.post('/carrito/items', body);
  return data.datos;
};

export const actualizarCantidad = async (body: {
  tiendaId: number;
  itemId: number;
  cantidad: number;
  sessionId: string;
}): Promise<Carrito> => {
  const { data } = await api.put('/carrito/items', body);
  return data.datos;
};

export const eliminarDelCarrito = async (body: {
  tiendaId: number;
  itemId: number;
  sessionId: string;
}): Promise<Carrito> => {
  const { data } = await api.delete(`/carrito/items/${body.itemId}`, {
    params: { tiendaId: body.tiendaId, sessionId: body.sessionId },
  });
  return data.datos;
};

export interface CuponValido {
  id: number;
  codigo: string;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO';
  valor: number;
  descuento: number;
}

export const validarCupon = async (tiendaId: number, codigo: string, subtotal: number): Promise<CuponValido> => {
  const { data } = await api.post(`/tiendas/${tiendaId}/cupones/validar`, { codigo, subtotal });
  return data.datos;
};

export const crearPedido = async (tiendaId: number, payload: CrearPedidoDto): Promise<Pedido> => {
  const { data } = await api.post(`/tiendas/${tiendaId}/pedidos/`, payload);
  return data.datos;
};

export interface PreferenciaMP {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

export const crearPreferenciaMP = async (tiendaId: number, pedidoId: number): Promise<PreferenciaMP> => {
  const { data } = await api.post(`/tiendas/${tiendaId}/pedidos/${pedidoId}/pagar`);
  return data.datos;
};

// ── Botón de arrepentimiento (Res. 424/2020) ──
export interface RevocacionInput {
  nombre: string;
  email: string;
  telefono?: string;
  nroPedidoTexto?: string;
  motivo?: string;
}

export interface RevocacionConstancia {
  codigo: string;
  creadoEn: string;
  nombre: string;
  email: string;
}

export const crearRevocacion = async (
  tiendaId: number,
  payload: RevocacionInput
): Promise<RevocacionConstancia> => {
  const { data } = await api.post(`/tiendas/${tiendaId}/revocaciones`, payload);
  return data.datos;
};

// ── Páginas legales ──
export type TipoLegal = 'TERMINOS' | 'PRIVACIDAD' | 'CAMBIOS';

export interface PaginaLegal {
  titulo: string;
  contenido: string;
  actualizadoEn: string;
}

export interface PaginaLegalItem {
  tipo: TipoLegal;
  titulo: string;
}

export const getPaginaLegal = async (tiendaId: number, tipo: TipoLegal): Promise<PaginaLegal> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/legal/${tipo}`);
  return data.datos;
};

export const getPaginasLegalesActivas = async (tiendaId: number): Promise<PaginaLegalItem[]> => {
  const { data } = await api.get(`/tiendas/${tiendaId}/legal`);
  return data.datos;
};
