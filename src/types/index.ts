export interface TemaConfig {
  colorAcento?: string;
  modoOscuro?: boolean;
  navbarStyle?: string;
  heroTitulo?: string;
  heroSubtitulo?: string;
  heroCtaTexto?: string;
  tipoSeccionHero?: 'HERO_FIJO' | 'CARRUSEL';
  intervaloCarrusel?: number;
  seccionesVisibles?: Record<string, boolean>;
  bannerPromoActivo?: boolean;
  bannerPromoTitulo?: string | null;
  bannerPromoSubtitulo?: string | null;
  bannerPromoImagenUrl?: string | null;
  bannerPromoLinkUrl?: string | null;
  bannerPromoCtaTexto?: string | null;
}

export interface HeroSlide {
  id?: number;
  url?: string;
  titulo?: string;
  subtitulo?: string;
  etiqueta?: string;
  activa?: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  padreId?: number | null;
}

export interface ProductoVariante {
  id: number;
  nombre: string;
  sku?: string | null;
  precioExtra?: number | string;
  imagenUrl?: string | null;
  stock?: number;
  disponible?: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number | string;
  precioOferta?: number | string;
  precioAnterior?: number | string | null;
  moneda?: string;
  stock?: number;
  imagenPrincipalUrl?: string;
  imagenes?: { url: string; orden?: number }[];
  variantes?: ProductoVariante[];
  tags?: { id: number; nombre: string }[];
  destacado?: boolean;
  categoria?: Categoria;
}

export interface MetodoPagoConfig {
  cbu?: string;
  alias?: string;
  banco?: string;
  titular?: string;
}

export interface MetodoPago {
  detalle?: string | null;
  configExtra?: MetodoPagoConfig | null;
  metodoPago: { id: number; nombre: string };
}

export interface MetodoEntrega {
  detalle?: string | null;
  zonaCobertura?: string | null;
  costo?: number | string | null;
  costoGratis?: number | string | null;
  tiempoEstimado?: string | null;
  metodoEntrega: { id: number; nombre: string };
}

export interface AboutUs {
  titulo?: string | null;
  descripcion?: string | null;
  imagenUrl?: string | null;
  direccion?: string | null;
}

export interface MarqueeItem {
  texto: string;
  orden: number;
}

export interface ResenaTienda {
  id: number;
  autorNombre?: string | null;
  calificacion: number;
  comentario?: string | null;
  respuesta?: string | null;
  respuestaEn?: string | null;
  creadoEn: string;
}

export interface ResenasEstadisticas {
  promedio: number;
  total: number;
  distribucion: { calificacion: number; cantidad: number }[];
}

export interface ResenaProducto {
  id: number;
  autorNombre?: string | null;
  calificacion: number;
  comentario?: string | null;
  imagenUrl?: string | null;
  respuesta?: string | null;
  creadoEn: string;
  cliente?: { id: number; nombre?: string | null } | null;
}

export interface Tienda {
  id: number;
  nombre: string;
  descripcion?: string;
  slug: string;
  logoUrl?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  sitioWeb?: string;
  ciudad?: string;
  provincia?: string;
  activa?: boolean;
  temaConfig?: TemaConfig;
  carrusel?: HeroSlide[];
  aboutUs?: AboutUs | null;
  marqueeItems?: MarqueeItem[];
  metodosPago?: MetodoPago[];
  metodosEntrega?: MetodoEntrega[];
}

export interface CarritoItem {
  id: number;
  cantidad: number;
  precioUnit: number | string;
  subtotal?: number | string;
  producto: Producto;
  variante?: ProductoVariante | null;
}

export interface Carrito {
  id?: number;
  sessionId?: string;
  clienteId?: number | null;
  items: CarritoItem[];
  total?: number | string;
  cantidad?: number;
}

export interface Popup {
  id: number;
  tipo: 'OFERTA' | 'NEWSLETTER' | 'INFO' | 'IMAGEN_CTA';
  activo: boolean;
  titulo: string;
  mensaje?: string | null;
  imagenUrl?: string | null;
  ctaTexto?: string | null;
  ctaUrl?: string | null;
  colorFondo?: string | null;
  delay: number;
  frecuencia: 'SIEMPRE' | 'UNA_VEZ_SESION' | 'UNA_VEZ_DIA';
  codigoDesc?: string | null;
  porcentajeDesc?: number | null;
}

export interface CrearPedidoDto {
  compradorNombre: string;
  compradorEmail: string;
  compradorTel: string;
  metodoEntregaId: number;
  direccionCalle: string;
  direccionNumero?: string;
  direccionPiso?: string;
  direccionCiudad: string;
  direccionProv: string;
  direccionCP?: string;
  direccionNotas?: string;
  metodoPagoId: number;
  notasCliente?: string;
  costoEnvio?: number;
  cuponCodigo?: string;
}

export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

export interface PedidoItem {
  id: number;
  nombreProd: string;
  nombreVar?: string | null;
  imagenUrl?: string | null;
  cantidad: number;
  precioUnit: number | string;
  subtotal: number | string;
}

export interface Pedido {
  id: number;
  compradorNombre: string;
  compradorEmail: string;
  clienteId?: number | null;
  total: number | string;
  subtotal: number | string;
  costoEnvio: number | string;
  estado: EstadoPedido;
  estadoPago: string;
  creadoEn: string;
  items?: PedidoItem[];
  metodoEntrega?: { nombre: string } | null;
  metodoPago?: { nombre: string } | null;
  nroSeguimiento?: string | null;
  urlSeguimiento?: string | null;
  direccionCalle?: string;
  direccionNumero?: string;
  direccionCiudad?: string;
}

export interface PaginatedResponse<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}
