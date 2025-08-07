import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductFilter } from '../../../services/product.service';

@Component({
  selector: 'app-view-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-products.component.html',
  styleUrl: './view-products.component.scss'
})
export class ViewProductsComponent implements OnInit {
  // Señales para estado reactivo
  products = signal<any[]>([]);
  isLoading = signal(false);
  totalProducts = signal(0);

  // Filtros y búsqueda
  searchTerm = '';
  selectedCategory = '';
  selectedGender = '';
  selectedPriceRange = '';
  sortBy = 'nombre';
  sortOrder = 'asc';

  // Opciones para filtros
  categories = ['Ropa', 'Calzado', 'Accesorios'];
  genders = ['MUJER', 'HOMBRE', 'NIÑO', 'NIÑA'];
  priceRanges = [
    { label: 'Todos los precios', value: '' },
    { label: 'Menos de $50,000', value: '0-50000' },
    { label: '$50,000 - $100,000', value: '50000-100000' },
    { label: '$100,000 - $200,000', value: '100000-200000' },
    { label: 'Más de $200,000', value: '200000-999999' }
  ];
  sortOptions = [
    { label: 'Nombre A-Z', value: 'nombre-asc' },
    { label: 'Nombre Z-A', value: 'nombre-desc' },
    { label: 'Precio menor a mayor', value: 'precio-asc' },
    { label: 'Precio mayor a menor', value: 'precio-desc' },
    { label: 'Más nuevo', value: 'fecha-desc' }
  ];

  // Paginación
  currentPage = 0;
  itemsPerPage = 12;
  totalPages = signal(1);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    // Crear filtros basados en la selección del usuario
    const filters = this.buildFilters();

    this.productService.getAllProducts().subscribe({
      next: (response) => {
        let filteredProducts = response.productos || response as any;
        console.log('Productos cargados:', filteredProducts);

        // Aplicar filtros localmente (si la API no los soporta)
        filteredProducts = this.applyLocalFilters(filteredProducts, filters);

        // Aplicar ordenamiento
        filteredProducts = this.applySorting(filteredProducts);

        // Actualizar señales
        this.products.set(filteredProducts);
        this.totalProducts.set(filteredProducts.length);
        this.totalPages.set(Math.ceil(filteredProducts.length / this.itemsPerPage));

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.isLoading.set(false);
      }
    });
  }

  private buildFilters(): ProductFilter {
    const filters: ProductFilter = {};

    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }

    if (this.selectedCategory) {
      filters.categoria = this.selectedCategory;
    }

    if (this.selectedGender) {
      filters.genero = this.selectedGender;
    }

    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-');
      filters.precioMin = parseInt(min);
      filters.precioMax = parseInt(max);
    }

    return filters;
  }

  private applyLocalFilters(products: any[], filters: ProductFilter): any[] {
    return products.filter(product => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          product.nombre.toLowerCase().includes(searchLower) ||
          product.descripcion.toLowerCase().includes(searchLower) ||
          product.color.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro por categoría
      if (filters.categoria && product.categoria !== filters.categoria.toUpperCase()) {
        return false;
      }

      // Filtro por género
      if (filters.genero && product.genero !== filters.genero) {
        return false;
      }

      // Filtro por precio
      if (filters.precioMin !== undefined && product.precio < filters.precioMin) {
        return false;
      }
      if (filters.precioMax !== undefined && product.precio > filters.precioMax) {
        return false;
      }

      return true;
    });
  }

  private applySorting(products: any[]): any[] {
    const [field, order] = this.sortBy.includes('-') ?
      this.sortBy.split('-') : [this.sortBy, this.sortOrder];

    return products.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (field) {
        case 'nombre':
          valueA = a.nombre.toLowerCase();
          valueB = b.nombre.toLowerCase();
          break;
        case 'precio':
          valueA = a.precio;
          valueB = b.precio;
          break;
        default:
          valueA = a.nombre.toLowerCase();
          valueB = b.nombre.toLowerCase();
      }

      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Métodos de eventos
  onSearchChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onSortChange(sortValue: string): void {
    this.sortBy = sortValue;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedGender = '';
    this.selectedPriceRange = '';
    this.sortBy = 'nombre-asc';
    this.currentPage = 0;
    this.loadProducts();
  }

  // Métodos de utilidad
  getPaginatedProducts(): any[] {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.products().slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage = page;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getStockStatus(quantity: number): { text: string; class: string } {
    if (quantity === 0) {
      return { text: 'Sin stock', class: 'out-of-stock' };
    } else if (quantity < 5) {
      return { text: 'Stock bajo', class: 'low-stock' };
    } else {
      return { text: 'Disponible', class: 'in-stock' };
    }
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.itemsPerPage, this.totalProducts());
  }
}
