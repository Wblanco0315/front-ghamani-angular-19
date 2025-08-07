import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiEndpoints } from '../core/constants/api-endpoints';
import { ProductModel } from '../models/product/ProductModel';
import { AuthService } from '../core/services/auth.service';

export interface ProductFilter {
  categoria?: string;
  genero?: string;
  talla?: string;
  precioMin?: number;
  precioMax?: number;
  color?: string;
  search?: string;
}

export interface ProductResponse {
  productos: ProductModel[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = ApiEndpoints.PRODUCTS;


  constructor(private http: HttpClient, private authService: AuthService) {}

  // Obtener todos los productos con filtros opcionales
  getAllProducts(): Observable<ProductResponse> {

    return this.http.get<ProductResponse>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching products:', error);
        return throwError(() => new Error('Error al obtener productos. Por favor intenta nuevamente.'));
      })
    );
  }

  // Obtener productos para la tienda (solo productos disponibles)
  getShopProducts(): Observable<ProductResponse> {
    return this.getAllProducts();
  }

  // Obtener producto por ID
  getProductById(id: string): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching product with ID ${id}:`, error);
        if (error.status === 404) {
          return throwError(() => new Error('Producto no encontrado'));
        }
        return throwError(() => new Error('Error al obtener el producto'));
      })
    );
  }

  // Crear nuevo producto (solo admin)
  createProduct(product: Omit<ProductModel, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Observable<ProductModel> {
    const productData = {
      ...product,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    return this.http.post<ProductModel>(this.apiUrl+'/crearProducto', productData,{headers: {authorization: `Bearer ${this.authService.getAuthToken()}`}}).pipe(
      catchError((error) => {
        console.error('Error creating product:', error);
        if (error.status === 409) {
          return throwError(() => new Error('Ya existe un producto con ese nombre'));
        }
        return throwError(() => new Error('Error al crear el producto'));
      })
    );
  }

  // Actualizar producto (solo admin)
  updateProduct(id: string, product: Partial<ProductModel>): Observable<ProductModel> {
    const productData = {
      ...product,
      fechaActualizacion: new Date()
    };

    return this.http.put<ProductModel>(`${this.apiUrl}/${id}`, productData).pipe(
      catchError((error) => {
        console.error(`Error updating product with ID ${id}:`, error);
        if (error.status === 404) {
          return throwError(() => new Error('Producto no encontrado'));
        }
        return throwError(() => new Error('Error al actualizar el producto'));
      })
    );
  }

  // Eliminar producto (solo admin)
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: { authorization: `Bearer ${this.authService.getAuthToken()}` } });
  }

  // Obtener categorías disponibles
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError((error) => {
        console.error('Error fetching categories:', error);
        // Fallback con categorías por defecto
        return throwError(() => ['Ropa', 'Calzado', 'Accesorios']);
      })
    );
  }

  // Obtener colores disponibles
  getColors(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/colors`).pipe(
      catchError((error) => {
        console.error('Error fetching colors:', error);
        // Fallback con colores por defecto
        return throwError(() => ['Negro', 'Blanco', 'Rosa', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Morado']);
      })
    );
  }

  // Obtener tallas disponibles
  getSizes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/sizes`).pipe(
      catchError((error) => {
        console.error('Error fetching sizes:', error);
        // Fallback con tallas por defecto
        return throwError(() => ['XS', 'S', 'M', 'L', 'XL', 'XXL']);
      })
    );
  }

  // Subir imagen de producto
  uploadProductImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload-image`, formData).pipe(
      catchError((error) => {
        console.error('Error uploading image:', error);
        return throwError(() => new Error('Error al subir la imagen'));
      })
    );
  }

  // Buscar productos por texto
  searchProducts(query: string, page: number = 0, size: number = 12): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductResponse>(`${this.apiUrl}/search`, { params }).pipe(
      catchError((error) => {
        console.error('Error searching products:', error);
        return throwError(() => new Error('Error en la búsqueda'));
      })
    );
  }
}
