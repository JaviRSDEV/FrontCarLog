import { Page } from './../../../models/page.model';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { Vehicle } from '../../../models/vehicle';
import { Workorder } from '../../../models/workorder';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { WorkOrderService } from '../../../services/workOrderService/work-order.service';
import { HttpErrorResponse } from '@angular/common/http';

import { VehicleFormComponent } from '../vehicle-form.component/vehicle-form.component';
import { VehicleCardComponent } from '../vehicle-card.component/vehicle-card.component';
import { VehicleDetailModalComponent } from '../vehicle-detail-modal.component/vehicle-detail-modal.component';
import { SearchComponent } from '../search-component/search.component/search.component';
import Swal from 'sweetalert2';
import {
  AppEventType,
  NotificationBusService,
} from '../../../services/notification-bus/notification-bus.service';
import { Subscription } from 'rxjs';

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
export class VehicleListComponent implements OnInit, OnDestroy {
  activeTab: TabType = 'mis-vehiculos';
  role: string = '';
  userDni: string = '';
  workshopId: number = 0;

  misVehiculos: Vehicle[] = [];
  ordenesAsignadas: Workorder[] = [];
  vehiculosAsignados: Vehicle[] = [];
  flotaTaller: Vehicle[] = [];

  mostrarFormulario: boolean = false;
  isEditing: boolean = false;
  vehiculoParaEditar: Vehicle | null = null;
  vehiculoSeleccionado: Vehicle | null = null;
  matriculaBuscada: string = '';

  // Variables de paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  private eventSub!: Subscription;

  constructor(
    private vehicleService: VehicleService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notificationBus: NotificationBusService,
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);

        this.role = (user.role || '').toString().replace(/"/g, '').toUpperCase();
        this.userDni = user.dni ? String(user.dni) : '';
        this.workshopId =
          user.workShopId || (user.workshop as any)?.workshopId || (user.workshop as any)?.id || 0;
      } catch (e) {
        console.error('Error al leer sesión en VehicleListComponent:', e);
      }
    }

    this.cargarDatos(this.activeTab);

    this.eventSub = this.notificationBus.on(AppEventType.RELOAD_VEHICLES).subscribe(() => {
      this.cargarDatos(this.activeTab);
    });
  }

  ngOnDestroy(): void {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

  buscarVehiculos(texto: string, page: number = 0): void {
    if (!texto.trim()) {
      this.cargarDatos(this.activeTab, page);
      return;
    }

    let searchType = 'OWNER';
    if (this.activeTab === 'flota') searchType = 'WORKSHOP';
    else if (this.activeTab === 'asignados') searchType = 'ASSIGNED';

    this.vehicleService
      .searchVehicles(texto, this.workshopId, searchType, page, this.pageSize)
      .subscribe({
        next: (data: Page<Vehicle>) => {
          // 🚨 AQUÍ EXTRAEMOS EL .content
          if (this.activeTab === 'flota') {
            this.flotaTaller = data.content;
          } else if (this.activeTab === 'asignados') {
            this.vehiculosAsignados = data.content;
          } else {
            this.misVehiculos = data.content;
          }

          // Guardamos los datos de paginación
          this.totalElements = data.totalElements;
          this.currentPage = data.number;

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => console.error('Error en la búsqueda', err),
      });
  }

  cargarDatos(tab: TabType, page: number = 0): void {
    this.currentPage = page;

    if (tab === 'mis-vehiculos') {
      if (!this.userDni) return;
      this.vehicleService.getVehiclesByOwner(this.userDni, page, this.pageSize).subscribe({
        next: (data: Page<Vehicle>) => {
          this.misVehiculos = data.content; // 🚨 EXTRAEMOS .content
          this.totalElements = data.totalElements;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => console.error(err),
      });
    } else if (tab === 'asignados') {
      if (!this.userDni) return;

      // Asumo que WorkOrderService AÚN devuelve un array normal (no paginado en Angular).
      // Si también lo paginaste, aquí tendrías que poner data.content
      this.workOrderService.getWorkOrdersByMechanic(this.userDni).subscribe({
        next: (data: Workorder[] | any) => {
          // Parche temporal: si 'data' viene paginado, usamos data.content. Si no, usamos data.
          const arrayDatos = data.content ? data.content : data;

          this.ordenesAsignadas = arrayDatos;

          const cochesUnicos = new Map<string, Vehicle>();
          arrayDatos.forEach((orden: any) => {
            if (
              orden.vehicle &&
              orden.status !== 'COMPLETED' &&
              !cochesUnicos.has(orden.vehicle.plate)
            ) {
              cochesUnicos.set(orden.vehicle.plate, orden.vehicle);
            }
          });

          this.vehiculosAsignados = Array.from(cochesUnicos.values());
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => console.error(err),
      });
    } else if (tab === 'flota') {
      if (!this.workshopId) return;
      this.vehicleService.getVehiclesByWorkshop(this.workshopId, page, this.pageSize).subscribe({
        next: (data: Page<Vehicle>) => {
          this.flotaTaller = data.content; // 🚨 EXTRAEMOS .content
          this.totalElements = data.totalElements;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => console.error(err),
      });
    }
  }

  // ... (El resto de tus métodos como irAlHistorial, cambiarPestana, eliminarVehiculo, etc., se quedan EXACTAMENTE igual)

  irAlHistorial(plate: string): void {
    this.router.navigate(['/dashboard/historial', plate]);
  }

  cambiarPestana(pestana: TabType): void {
    this.activeTab = pestana;
    this.mostrarFormulario = false;
    this.cargarDatos(pestana, 0); // Cargamos la página 0 al cambiar de pestaña
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.isEditing = false;
      this.vehiculoParaEditar = null;
    }
  }

  abrirDetalles(vehiculo: Vehicle): void {
    this.vehiculoSeleccionado = vehiculo;
  }

  cerrarDetalles(): void {
    this.vehiculoSeleccionado = null;
  }

  editarVehiculo(vehiculo: Vehicle): void {
    this.vehiculoParaEditar = vehiculo;
    this.isEditing = true;
    this.mostrarFormulario = true;
    this.vehiculoSeleccionado = null;
  }

  eliminarVehiculo(plate: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el vehículo ${plate}. Esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-trash"></i>Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.deleteVehicle(plate).subscribe({
          next: () => {
            this.cargarDatos(this.activeTab, this.currentPage);
            this.vehiculoSeleccionado = null;
          },
          error: (err: HttpErrorResponse) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el vehículo',
              icon: 'error',
              background: '#212529',
              color: '#fff',
            });
          },
        });
      }
    });
  }

  onVehiculoGuardado(): void {
    this.cargarDatos(this.activeTab, this.currentPage);
    this.toggleFormulario();
  }

  registerExit(plate: string): void {
    Swal.fire({
      title: 'Registrar Salida',
      text: `¿Confirmas la SALIDA del vehículo ${plate} del taller?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-box-arrow-right"></i> Confirmar Salida',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.registerExit(plate.toUpperCase(), this.workshopId).subscribe({
          next: () => {
            this.cargarDatos(this.activeTab, this.currentPage);
            Swal.fire({
              title: 'Salida Registrada',
              text: 'El vehículo ya no está en el taller.',
              icon: 'success',
              background: '#212529',
              color: '#fff',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (err: HttpErrorResponse) => {
            console.error(err);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo registrar la salida.',
              icon: 'error',
              background: '#212529',
              color: '#fff',
              confirmButtonColor: '#0d6efd',
            });
          },
        });
      }
    });
  }

  solicitarIngreso(): void {
    if (!this.matriculaBuscada.trim()) return;

    this.vehicleService
      .requestEntry(this.matriculaBuscada.toUpperCase(), this.workshopId)
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Solicitud Enviada!',
            text: `Se ha notificado al propietario del vehículo ${this.matriculaBuscada.toUpperCase()}.`,
            icon: 'success',
            background: '#212529',
            color: '#fff',
            confirmButtonColor: '#0d6efd',
          });
          this.matriculaBuscada = '';
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message || 'Error al solicitar el ingreso.';
          Swal.fire({
            title: 'Atención',
            text: msg,
            icon: 'warning',
            background: '#212529',
            color: '#fff',
            confirmButtonColor: '#0d6efd',
          });
        },
      });
  }

  aprobarSolicitud(plate: string): void {
    this.vehicleService.approveEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos', this.currentPage);
        Swal.fire({
          title: 'Ingreso Aprobado',
          text: 'El taller ya tiene acceso a tu vehículo.',
          icon: 'success',
          background: '#212529',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
        });
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo aprobar la solicitud.',
          icon: 'error',
          background: '#212529',
          color: '#fff',
        });
      },
    });
  }

  rechazarSolicitud(plate: string): void {
    this.vehicleService.rejectEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos', this.currentPage);
        Swal.fire({
          title: 'Ingreso Rechazado',
          text: 'Has denegado el acceso al taller.',
          icon: 'info',
          background: '#212529',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
        });
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo rechazar la solicitud.',
          icon: 'error',
          background: '#212529',
          color: '#fff',
        });
      },
    });
  }
}
