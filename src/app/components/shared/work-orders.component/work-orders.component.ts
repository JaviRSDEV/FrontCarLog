import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Workorder } from '../../../models/workorder';
import { User } from '../../../models/user';
import { WorkOrderFormComponent } from '../work-order-form.component/work-order-form.component';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  role: string = '';
  userDni: string = '';
  workshopId: number = 0;

  activeTab: TabType = 'activas';
  modoVista: VistaType = '';

  ordenesActivas: Workorder[] = [];
  ordenesCompletadas: Workorder[] = [];

  mostrarFormulario: boolean = false;

  constructor(
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');

    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.role = user.role;
      this.userDni = user.dni;
      this.workshopId = user.workShopId || 0;

      if (this.role === 'MANAGER' || this.role === 'CO_MANAGER') {
        this.modoVista = 'todas';
      } else if (this.role === 'MECHANIC') {
        this.modoVista = 'asignadas';
      }

      this.cargarDatos();
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
    this.activeTab = tab;
  }

  cargarDatos(): void {
    const peticion$: Observable<Workorder[]> =
      this.modoVista === 'todas'
        ? this.workOrderService.getAllWorkOrders(this.workshopId)
        : this.workOrderService.getWorkOrdersByMechanic(this.userDni);

    peticion$.subscribe({
      next: (data: Workorder[]) => {
        this.ordenesActivas = data.filter((o) => o.status !== 'COMPLETED');
        this.ordenesCompletadas = data.filter((o) => o.status === 'COMPLETED');

        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar órdenes', err);
      },
    });
  }

  onOrdenGuardada(): void {
    this.mostrarFormulario = false;
    this.cargarDatos();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }
}
