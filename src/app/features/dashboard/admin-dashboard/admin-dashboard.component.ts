import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductModel } from '../../../models/product/ProductModel';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  products: any;
  productForm: FormGroup;

  // Estados del componente
  isLoading = false;
  showModal = false;
  isEditing = false;
  currentProduct: ProductModel | null = null;

  // Filtros y búsqueda
  searchTerm = '';
  selectedCategory = '';
  categories = ['Ropa', 'Calzado', 'Accesorios'];

  // Paginación
  currentPage = 0;
  itemsPerPage = 6;
  totalPages = 1;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      categoria: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      color: ['', Validators.required],
      genero: ['femenino', Validators.required],
      talla: [''],
      imagen_url: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;

    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Productos cargados:',data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.isLoading = false;
      },
    });

  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentProduct = null;
    this.productForm.reset({
      genero: 'femenino',
    });
    this.showModal = true;
  }

  openEditModal(product: ProductModel): void {
    this.isEditing = true;
    this.currentProduct = product;
    this.productForm.patchValue(product);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.productForm.reset();
    this.currentProduct = null;
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.productForm.value;

    try {
      if (this.isEditing && this.currentProduct) {
        // Para actualizar, necesitamos un ID del producto
        const productId = this.currentProduct.id || this.currentProduct.nombre;
        await this.productService
          .updateProduct(productId, formData)
          .toPromise();
        this.showSuccess('Producto actualizado exitosamente');
      } else {
        await this.productService.createProduct(formData).toPromise();
        this.showSuccess('Producto creado exitosamente');
      }

      this.closeModal();
      this.loadProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      this.showError('Error al guardar el producto');
    } finally {
      this.isLoading = false;
    }
  }

  deleteProduct(product: ProductModel) {
    const productId = product.id; // Usar ID o nombre como fallback
    if (
      !productId ||
      !confirm(`¿Estás segura de eliminar "${product.nombre}"?`)
    ) {
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.showSuccess('Producto eliminado exitosamente');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        this.showError('Error al eliminar el producto');
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  onImageError(event: any): void {
    event.target.src = '/assets/placeholder-product.jpg';
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength'])
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min'])
        return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    // Implementar notificación de éxito
    alert(message);
  }

  private showError(message: string): void {
    // Implementar notificación de error
    alert(message);
  }

  // Métodos helper para el nuevo estilo del template
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getStockStatus(cantidad: number): { text: string; class: string } {
    if (cantidad <= 0) {
      return { text: 'Agotado', class: 'out-of-stock' };
    } else if (cantidad <= 5) {
      return { text: 'Bajo Stock', class: 'low-stock' };
    } else {
      return { text: 'Disponible', class: 'in-stock' };
    }
  }
}
