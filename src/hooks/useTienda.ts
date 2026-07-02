import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTiendaBySlug,
  getTiendaByDominio,
  getProductosDestacados,
  getProductosNormales,
  getProductos,
  getProductoById,
  getCategorias,
  getResenasTienda,
  getResenasEstadisticas,
  getResenasProducto,
  crearResenaTienda,
  crearResenaProducto,
  getProductosRelacionados,
  crearPedido,
  type FiltrosProductos,
  getCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
} from '../api/tienda';
import { useCarritoStore } from '../store/carrito';
import type { CrearPedidoDto } from '../types';

export const useTienda = (slug: string) =>
  useQuery({
    queryKey: ['tienda', slug],
    queryFn: () => getTiendaBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

// Resuelve la tienda según el contexto:
// - Si estamos en un dominio propio (www.mitienda.com) → busca por dominio.
// - Si estamos en la plataforma (netlify/localhost) → busca por el slug de la URL.
export const useTiendaActual = (slug: string, dominioPropio: string | null) =>
  useQuery({
    queryKey: dominioPropio ? ['tienda-dominio', dominioPropio] : ['tienda', slug],
    queryFn: () =>
      dominioPropio ? getTiendaByDominio(dominioPropio) : getTiendaBySlug(slug),
    enabled: dominioPropio ? !!dominioPropio : !!slug,
    staleTime: 1000 * 60 * 5,
  });

export const useDestacados = (tiendaId: number) =>
  useQuery({
    queryKey: ['destacados', tiendaId],
    queryFn: () => getProductosDestacados(tiendaId),
    enabled: !!tiendaId,
  });

export const useProductos = (
  tiendaId: number,
  params: { categoriaId?: number; busqueda?: string; pagina?: number; limite?: number }
) =>
  useQuery({
    queryKey: ['productos', tiendaId, params],
    queryFn: () => getProductosNormales(tiendaId, params),
    enabled: !!tiendaId,
  });

export const useListadoProductos = (tiendaId: number, filtros: FiltrosProductos) =>
  useQuery({
    queryKey: ['listado-productos', tiendaId, filtros],
    queryFn: () => getProductos(tiendaId, filtros),
    enabled: !!tiendaId,
  });

export const useResenasProducto = (tiendaId: number, productoId: number, pagina = 1, limite = 6) =>
  useQuery({
    queryKey: ['resenas-producto', tiendaId, productoId, pagina, limite],
    queryFn: () => getResenasProducto(tiendaId, productoId, { pagina, limite }),
    enabled: !!tiendaId && !!productoId,
  });

export const useProductosRelacionados = (tiendaId: number, productoId: number, categoriaId?: number) =>
  useQuery({
    queryKey: ['relacionados', tiendaId, productoId, categoriaId],
    queryFn: () => getProductosRelacionados(tiendaId, productoId, categoriaId),
    enabled: !!tiendaId && !!productoId,
  });

export const useProducto = (tiendaId: number, productoId: number) =>
  useQuery({
    queryKey: ['producto', tiendaId, productoId],
    queryFn: () => getProductoById(tiendaId, productoId),
    enabled: !!tiendaId && !!productoId,
  });

export const useResenasTienda = (tiendaId: number, pagina = 1, limite = 10) =>
  useQuery({
    queryKey: ['resenas-tienda', tiendaId, pagina, limite],
    queryFn: () => getResenasTienda(tiendaId, { pagina, limite }),
    enabled: !!tiendaId,
  });

export const useResenasEstadisticas = (tiendaId: number) =>
  useQuery({
    queryKey: ['resenas-stats', tiendaId],
    queryFn: () => getResenasEstadisticas(tiendaId),
    enabled: !!tiendaId,
  });

// Crear reseña de tienda. Al terminar, refresca la lista y las estadísticas.
// La reseña queda pendiente de aprobación, así que puede no aparecer al instante.
export const useCrearResenaTienda = (tiendaId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { calificacion: number; comentario?: string; autorNombre?: string }) =>
      crearResenaTienda(tiendaId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resenas-tienda', tiendaId] });
      qc.invalidateQueries({ queryKey: ['resenas-stats', tiendaId] });
    },
  });
};

// Crear reseña de producto (con imagen opcional). Refresca la lista del producto.
export const useCrearResenaProducto = (tiendaId: number, productoId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { calificacion: number; comentario?: string; imagen?: File | null }) =>
      crearResenaProducto(productoId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resenas-producto', tiendaId, productoId] });
    },
  });
};

export const useCategorias = (tiendaId: number) =>
  useQuery({
    queryKey: ['categorias', tiendaId],
    queryFn: () => getCategorias(tiendaId),
    enabled: !!tiendaId,
  });

export const useCarrito = (tiendaId: number) => {
  const { sessionId, setCarrito, abrirCarrito } = useCarritoStore();
  const qc = useQueryClient();

  const { data: carrito } = useQuery({
    queryKey: ['carrito', tiendaId, sessionId],
    queryFn: () => getCarrito(tiendaId, sessionId),
    enabled: !!tiendaId,
  });

  const invalidar = () => qc.invalidateQueries({ queryKey: ['carrito', tiendaId] });

  const agregar = useMutation({
    mutationFn: (vars: { productoId: number; cantidad: number; varianteId?: number | null }) =>
      agregarAlCarrito({ tiendaId, sessionId, ...vars }),
    onSuccess: (data) => { setCarrito(data); invalidar(); abrirCarrito(); },
  });

  const actualizar = useMutation({
    mutationFn: (vars: { itemId: number; cantidad: number }) =>
      actualizarCantidad({ tiendaId, sessionId, ...vars }),
    onSuccess: (data) => { setCarrito(data); invalidar(); },
  });

  const eliminar = useMutation({
    mutationFn: (itemId: number) => eliminarDelCarrito({ tiendaId, sessionId, itemId }),
    onSuccess: (data) => { setCarrito(data); invalidar(); },
  });

  return { carrito, agregar, actualizar, eliminar };
};

export const useCrearPedido = (tiendaId: number) => {
  const { setCarrito } = useCarritoStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CrearPedidoDto) => crearPedido(tiendaId, payload),
    onSuccess: () => {
      // El backend vacía el carrito tras crear el pedido
      setCarrito({ items: [] });
      qc.invalidateQueries({ queryKey: ['carrito', tiendaId] });
    },
  });
};
