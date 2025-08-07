export interface ProductModel {
  id?: string; // ID único del producto
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria: string;
  imagenUrl?: string; // URL de la imagen del producto
  fechaCreacion?: Date; // Fecha de creación del producto
  color: string; // Color del producto
  genero: string; // Género del producto (masculino, femenino)
  talla?: string; // Talla del producto, si aplica
  fechaActualizacion?: Date; // Fecha de la última actualización del producto
}
