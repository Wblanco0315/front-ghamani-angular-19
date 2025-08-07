import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces para los datos de pedidos
interface OrderItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  imagenUrl: string;
  talla: string;
  color: string;
}

interface Order {
  id: string;
  fecha: Date;
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  items: OrderItem[];
  direccionEnvio: string;
  metodoPago: string;
  numeroSeguimiento?: string;
}

@Component({
  selector: 'app-view-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-orders.component.html',
  styleUrl: './view-orders.component.scss'
})
export class ViewOrdersComponent implements OnInit {
  // Signals para estado reactivo
  orders = signal<Order[]>([]);
  isLoading = signal(false);
  selectedStatus = signal<string>('todos');
  searchTerm = signal('');

  // Computed para filtros
  filteredOrders = computed(() => {
    const orders = this.orders();
    const status = this.selectedStatus();
    const search = this.searchTerm().toLowerCase();

    return orders.filter(order => {
      const matchesStatus = status === 'todos' || order.estado === status;
      const matchesSearch = search === '' ||
        order.id.toLowerCase().includes(search) ||
        order.direccionEnvio.toLowerCase().includes(search) ||
        order.items.some(item => item.nombre.toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });
  });

  // Estadísticas computadas
  totalOrders = computed(() => this.orders().length);
  totalSpent = computed(() =>
    this.orders().reduce((sum, order) => sum + order.total, 0)
  );

  ngOnInit() {
    this.loadOrders();
  }

  // Cargar pedidos (simulado con datos demo)
  loadOrders() {
    this.isLoading.set(true);

    // Simular carga async
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: 'ORD-2024-001',
          fecha: new Date('2024-12-15'),
          estado: 'entregado',
          total: 189000,
          direccionEnvio: 'Calle 123 #45-67, Bogotá',
          metodoPago: 'Tarjeta de Crédito',
          numeroSeguimiento: 'TRK123456789',
          items: [
            {
              id: 1,
              nombre: 'Vestido Floral Elegante',
              cantidad: 1,
              precio: 149000,
              imagenUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
              talla: 'M',
              color: 'Rosa'
            },
            {
              id: 2,
              nombre: 'Tacones Dorados',
              cantidad: 1,
              precio: 40000,
              imagenUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop',
              talla: '37',
              color: 'Dorado'
            }
          ]
        },
        {
          id: 'ORD-2024-002',
          fecha: new Date('2024-12-20'),
          estado: 'enviado',
          total: 95000,
          direccionEnvio: 'Carrera 7 #12-34, Medellín',
          metodoPago: 'PSE',
          numeroSeguimiento: 'TRK987654321',
          items: [
            {
              id: 3,
              nombre: 'Blusa de Seda Premium',
              cantidad: 1,
              precio: 95000,
              imagenUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=300&h=400&fit=crop',
              talla: 'S',
              color: 'Blanco'
            }
          ]
        },
        {
          id: 'ORD-2024-003',
          fecha: new Date('2024-12-22'),
          estado: 'procesando',
          total: 234000,
          direccionEnvio: 'Avenida 68 #123-45, Cali',
          metodoPago: 'Tarjeta de Débito',
          items: [
            {
              id: 4,
              nombre: 'Conjunto Deportivo Elegante',
              cantidad: 1,
              precio: 124000,
              imagenUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop',
              talla: 'L',
              color: 'Negro'
            },
            {
              id: 5,
              nombre: 'Chaqueta de Cuero',
              cantidad: 1,
              precio: 110000,
              imagenUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=400&fit=crop',
              talla: 'M',
              color: 'Marrón'
            }
          ]
        },
        {
          id: 'ORD-2024-004',
          fecha: new Date('2024-12-25'),
          estado: 'pendiente',
          total: 67000,
          direccionEnvio: 'Calle 85 #11-23, Barranquilla',
          metodoPago: 'Efectivo contra entrega',
          items: [
            {
              id: 6,
              nombre: 'Falda Midi Estampada',
              cantidad: 1,
              precio: 67000,
              imagenUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d24?w=300&h=400&fit=crop',
              talla: 'S',
              color: 'Multicolor'
            }
          ]
        }
      ];

      this.orders.set(mockOrders);
      this.isLoading.set(false);
    }, 1000);
  }

  // Métodos utilitarios
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'entregado': return '#2ecc71';
      case 'enviado': return '#3498db';
      case 'procesando': return '#f39c12';
      case 'pendiente': return '#e74c3c';
      case 'cancelado': return '#95a5a6';
      default: return '#95a5a6';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'entregado': return 'fas fa-check-circle';
      case 'enviado': return 'fas fa-shipping-fast';
      case 'procesando': return 'fas fa-clock';
      case 'pendiente': return 'fas fa-exclamation-circle';
      case 'cancelado': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  // Eventos de filtros
  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
