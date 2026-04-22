import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { Page } from './../../../models/page.model';
import { User } from '../../../models/user';
import { Vehicle } from '../../../models/vehicle';
import { Workorder } from '../../../models/workorder';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { WorkOrderService } from '../../../services/workOrderService/work-order.service';
import { Auth } from '../../../services/authService/auth.service';
import {
  AppEventType,
  NotificationBusService,
} from '../../../services/notification-bus/notification-bus.service';

import { VehicleFormComponent } from '../vehicle-form.component/vehicle-form.component';
import { VehicleCardComponent } from '../vehicle-card.component/vehicle-card.component';
import { VehicleDetailModalComponent } from '../vehicle-detail-modal.component/vehicle-detail-modal.component';
import { SearchComponent } from '../search-component/search.component/search.component';
import { Workshop } from '../../../models/workshop';

type TabType = 'mis-vehiculos' | 'asignados' | 'flota';

@Component({
  selector: 'app-vehicle-list-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    VehicleFormComponent,
    VehicleCardComponent,
    VehicleDetailModalComponent,
    SearchComponent,
  ],
  templateUrl: './vehicle-list-component.html',
  styleUrl: './vehicle-list-component.css',
})
export class VehicleListComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private workOrderService = inject(WorkOrderService);
  private authService = inject(Auth);
  private router = inject(Router);
  private notificationBus = inject(NotificationBusService);
  private destroy$ = inject(DestroyRef);

  role = signal<string>('');
  userDni = signal<string>('');
  workshopId = signal<number>(0);
  activeTab = signal<TabType>('mis-vehiculos');

  misVehiculos = signal<Vehicle[]>([]);
  vehiculosAsignados = signal<Vehicle[]>([]);
  flotaTaller = signal<Vehicle[]>([]);

  mostrarFormulario = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  vehiculoParaEditar = signal<Vehicle | null>(null);
  vehiculoSeleccionado = signal<Vehicle | null>(null);
  matriculaBuscada = signal<string>('');

  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);

  ngOnInit(): void {
    const userJson = this.authService.getUserFromStorage();

    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.role.set((user.role || '').toString().replace(/"/g, '').toUpperCase());
        this.userDni.set(user.dni ? String(user.dni) : '');

        const ws = user.workshop;
        let wsId = 0;

        if (user.workShopId) {
          wsId = user.workShopId;
        } else if (user.workshop && typeof user.workshop !== 'string') {
          const ws = user.workshop as Workshop;
          wsId = ws.workshopId;
        }
        this.workshopId.set(wsId);
      } catch (e) {
        console.error('Error al procesar sesión:', e);
      }
    }

    this.cargarDatos(this.activeTab());

    this.notificationBus
      .on(AppEventType.RELOAD_VEHICLES)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe(() => this.cargarDatos(this.activeTab(), this.currentPage()));
  }

  buscarVehiculos(texto: string, page: number = 0): void {
    if (!texto.trim()) {
      this.cargarDatos(this.activeTab(), page);
      return;
    }

    let searchType = 'OWNER';
    if (this.activeTab() === 'flota') searchType = 'WORKSHOP';
    else if (this.activeTab() === 'asignados') searchType = 'ASSIGNED';

    this.vehicleService
      .searchVehicles(texto, this.workshopId(), searchType, page, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (data: Page<Vehicle>) => {
          this.totalElements.set(data.totalElements);
          this.currentPage.set(data.number);

          if (this.activeTab() === 'flota') this.flotaTaller.set(data.content);
          else if (this.activeTab() === 'asignados') this.vehiculosAsignados.set(data.content);
          else this.misVehiculos.set(data.content);
        },
        error: (err: HttpErrorResponse) => console.error('Error en búsqueda:', err),
      });
  }

  cargarDatos(tab: TabType, page: number = 0): void {
    this.currentPage.set(page);

    switch (tab) {
      case 'mis-vehiculos':
        if (!this.userDni()) return;
        this.vehicleService
          .getVehiclesByOwner(this.userDni(), page, this.pageSize())
          .pipe(takeUntilDestroyed(this.destroy$))
          .subscribe({
            next: (data: Page<Vehicle>) => {
              this.misVehiculos.set(data.content);
              this.totalElements.set(data.totalElements);
            },
            error: (err: HttpErrorResponse) => console.error(err),
          });
        break;

      case 'asignados':
        if (!this.userDni()) return;
        this.workOrderService
          .getWorkOrdersByMechanic(this.userDni())
          .pipe(takeUntilDestroyed(this.destroy$))
          .subscribe({
            next: (data: Page<Workorder> | Workorder[]) => {
              const arrayDatos = Array.isArray(data) ? data : data.content;
              const cochesUnicos = new Map<string, Vehicle>();

              arrayDatos.forEach((orden: Workorder) => {
                if (
                  orden.vehicle &&
                  orden.status !== 'COMPLETED' &&
                  !cochesUnicos.has(orden.vehicle.plate)
                ) {
                  cochesUnicos.set(orden.vehicle.plate, orden.vehicle);
                }
              });
              this.vehiculosAsignados.set(Array.from(cochesUnicos.values()));
            },
            error: (err: HttpErrorResponse) => console.error(err),
          });
        break;

      case 'flota':
        if (!this.workshopId()) return;
        this.vehicleService
          .getVehiclesByWorkshop(this.workshopId(), page, this.pageSize())
          .pipe(takeUntilDestroyed(this.destroy$))
          .subscribe({
            next: (data: Page<Vehicle>) => {
              this.flotaTaller.set(data.content);
              this.totalElements.set(data.totalElements);
            },
            error: (err: HttpErrorResponse) => console.error(err),
          });
        break;
    }
  }

  irAlHistorial(plate: string): void {
    this.router.navigate(['/dashboard/historial', plate]);
  }

  cambiarPestana(pestana: TabType): void {
    this.activeTab.set(pestana);
    this.mostrarFormulario.set(false);
    this.cargarDatos(pestana, 0);
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update((v) => !v);
    if (!this.mostrarFormulario()) {
      this.isEditing.set(false);
      this.vehiculoParaEditar.set(null);
    }
  }

  abrirDetalles(vehiculo: Vehicle): void {
    this.vehiculoSeleccionado.set(vehiculo);
  }

  cerrarDetalles(): void {
    this.vehiculoSeleccionado.set(null);
  }

  editarVehiculo(vehiculo: Vehicle): void {
    this.vehiculoParaEditar.set(vehiculo);
    this.isEditing.set(true);
    this.mostrarFormulario.set(true);
    this.vehiculoSeleccionado.set(null);
  }

  eliminarVehiculo(plate: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el vehículo ${plate}. Esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      background: '#212529',
      color: '#fff',
      confirmButtonText: '<i class="bi bi-trash"></i> Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.deleteVehicle(plate).subscribe({
          next: () => {
            this.cargarDatos(this.activeTab(), this.currentPage());
            this.vehiculoSeleccionado.set(null);
          },
          error: () => this.mostrarError('No se pudo eliminar el vehículo'),
        });
      }
    });
  }

  onVehiculoGuardado(): void {
    this.cargarDatos(this.activeTab(), this.currentPage());
    this.toggleFormulario();
  }

  registerExit(plate: string): void {
    Swal.fire({
      title: 'Registrar Salida',
      text: `¿Confirmas la SALIDA del vehículo ${plate} del taller?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      background: '#212529',
      color: '#fff',
      confirmButtonText: '<i class="bi bi-box-arrow-right"></i> Confirmar Salida',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.registerExit(plate.toUpperCase(), this.workshopId()).subscribe({
          next: () => {
            this.cargarDatos(this.activeTab(), this.currentPage());
            this.notificarExito('Salida Registrada');
          },
          error: () => this.mostrarError('No se pudo registrar la salida'),
        });
      }
    });
  }

  solicitarIngreso(): void {
    const matricula = this.matriculaBuscada().trim();
    if (!matricula) return;

    this.vehicleService.requestEntry(matricula.toUpperCase(), this.workshopId()).subscribe({
      next: () => {
        this.notificarExito(`Solicitud enviada para ${matricula.toUpperCase()}`);
        this.matriculaBuscada.set('');
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarError(err.error?.message || 'Error al solicitar ingreso');
      },
    });
  }

  aprobarSolicitud(plate: string): void {
    this.vehicleService.approveEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos', this.currentPage());
        this.notificarToast('Ingreso Aprobado');
      },
      error: () => this.mostrarError('No se pudo aprobar la solicitud'),
    });
  }

  rechazarSolicitud(plate: string): void {
    this.vehicleService.rejectEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos', this.currentPage());
        this.notificarToast('Ingreso Rechazado');
      },
      error: () => this.mostrarError('No se pudo rechazar la solicitud'),
    });
  }

  private notificarExito(title: string) {
    Swal.fire({
      title,
      icon: 'success',
      background: '#212529',
      color: '#fff',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  private notificarToast(title: string) {
    Swal.fire({
      title,
      icon: 'success',
      background: '#212529',
      color: '#fff',
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
    });
  }

  private mostrarError(text: string) {
    Swal.fire({ title: 'Error', text, icon: 'error', background: '#212529', color: '#fff' });
  }
}
