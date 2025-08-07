import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'product' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.scss'
})
export class HomeDashboardComponent implements OnInit {
  // Señales para el estado reactivo
  currentUser = signal<any>(null);
  isLoading = signal(false);
  stats = signal<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    monthlyRevenue: 0
  });

  // Datos estáticos para demo
  quickActions: QuickAction[] = [
    {
      title: 'Gestionar Productos',
      description: 'Crear, editar y administrar productos',
      icon: '📦',
      route: '/dashboard/admin',
      color: 'var(--primary-color)'
    },
    {
      title: 'Ver Pedidos',
      description: 'Revisar y procesar pedidos',
      icon: '🛒',
      route: '/dashboard/orders',
      color: 'var(--secondary-color)'
    },
    {
      title: 'Clientes',
      description: 'Administrar usuarios y clientes',
      icon: '👥',
      route: '/dashboard/users',
      color: 'var(--accent-color)'
    },
    {
      title: 'Reportes',
      description: 'Analizar ventas y estadísticas',
      icon: '📊',
      route: '/dashboard/reports',
      color: 'var(--success-color)'
    }
  ];

  recentActivities = signal<RecentActivity[]>([
    {
      id: '1',
      type: 'order',
      title: 'Nueva orden recibida',
      description: 'Orden #12345 por $150.000',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      icon: '🛍️'
    },
    {
      id: '2',
      type: 'product',
      title: 'Producto actualizado',
      description: 'Blusa Rosa Elegante - Stock actualizado',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      icon: '👕'
    },
    {
      id: '3',
      type: 'user',
      title: 'Nuevo usuario registrado',
      description: 'María González se unió a la plataforma',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      icon: '👤'
    },
    {
      id: '4',
      type: 'system',
      title: 'Backup completado',
      description: 'Respaldo de datos realizado exitosamente',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: '💾'
    }
  ]);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardStats();
  }

  private loadUserData(): void {
    // Cargar datos del usuario actual
    const userData = this.authService.getCurrentUser();

    this.currentUser.set(userData || {
      nombre: 'Administrador',
      email: 'admin@ghamani.com',
      rol: 'ADMIN'
    });
  }

  private async loadDashboardStats(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Simular carga de estadísticas (aquí irían las llamadas reales a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.stats.set({
        totalProducts: 156,
        totalOrders: 89,
        totalUsers: 234,
        monthlyRevenue: 2450000
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) {
      return `Hace ${minutes} min`;
    } else if (hours < 24) {
      return `Hace ${hours}h`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
