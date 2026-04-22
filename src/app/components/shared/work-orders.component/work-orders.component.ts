import { Component, OnInit, inject, DestroyRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { WorkOrderService } from '../../../services/workOrderService/work-order.service';
import { Auth } from '../../../services/authService/auth.service';
import { Workorder } from '../../../models/workorder';
import { User } from '../../../models/user';
import { WorkOrderFormComponent } from '../work-order-form.component/work-order-form.component';

type TabType = 'activas' | 'completadas';
type VistaType = 'todas' | 'asignadas' | '';

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [WorkOrderFormComponent, CurrencyPipe],
  templateUrl: './work-orders.component.html',
  styleUrl: './work-orders.component.css',
})
export class WorkOrdersComponent implements OnInit {
  private workOrderService = inject(WorkOrderService);
  private authService = inject(Auth);
  private router = inject(Router);
  private destroy$ = inject(DestroyRef);

  role: string = '';
  userDni: string = '';
  workshopId: number = 0;

  activeTab = signal<TabType>('activas');
  modoVista = signal<VistaType>('');
  mostrarFormulario = signal(false);

  private todasLasOrdenes = signal<Workorder[]>([]);

  ordenesActivas = computed(() => this.todasLasOrdenes().filter((o) => o.status !== 'COMPLETED'));
  ordenesCompletadas = computed(() =>
    this.todasLasOrdenes().filter((o) => o.status === 'COMPLETED'),
  );

  ngOnInit(): void {
    const userJson = this.authService.getUserFromStorage();

    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);

        this.role = (user.role || '').toString().replace(/"/g, '').toUpperCase();
        this.userDni = user.dni;
        this.workshopId =
          user.workShopId || (user.workshop as any)?.workshopId || (user.workshop as any)?.id || 0;

        if (this.role === 'MANAGER' || this.role === 'CO_MANAGER') {
          this.modoVista.set('todas');
        } else if (this.role === 'MECHANIC') {
          this.modoVista.set('asignadas');
        }

        this.cargarDatos();
      } catch (e) {
        console.error('Error al parsear el usuario en WorkOrders:', e);
      }
    }
  }

  abrirDetallesOrden(orden: Workorder): void {
    if (orden.id) {
      this.router.navigate(['/dashboard/mantenimientos', orden.id]);
    } else {
      console.error('La orden no tiene ID');
    }
  }

  cambiarPestana(tab: TabType): void {
    this.activeTab.set(tab);
  }

  cargarDatos(): void {
    if (!this.userDni && !this.workshopId) return;

    const peticion$: Observable<Workorder[]> =
      this.modoVista() === 'todas'
        ? this.workOrderService.getAllWorkOrders(this.workshopId)
        : this.workOrderService.getWorkOrdersByMechanic(this.userDni);

    peticion$.pipe(takeUntilDestroyed(this.destroy$)).subscribe({
      next: (data: Workorder[]) => {
        this.todasLasOrdenes.set(data);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar órdenes de trabajo:', err);
      },
    });
  }

  onOrdenGuardada(): void {
    this.mostrarFormulario.set(false);
    this.cargarDatos();
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update((v) => !v);
  }
}
