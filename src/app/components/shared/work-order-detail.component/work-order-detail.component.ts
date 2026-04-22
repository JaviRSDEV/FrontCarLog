import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { TallerService } from '../../../services/tallerService/taller.service';
import { Auth } from '../../../services/authService/auth.service';
import { Workorder } from './../../../models/workorder';
import { WorkOrderLine } from './../../../models/workorderline';
import { User } from './../../../models/user';
import { WorkOrderLinesComponent } from '../work-order-lines.component/work-order-lines.component';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, FormsModule, WorkOrderLinesComponent],
  templateUrl: './work-order-detail.component.html',
  styleUrl: './work-order-detail.component.css',
})
export class WorkOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workOrderService = inject(WorkOrderService);
  private tallerService = inject(TallerService);
  private authService = inject(Auth);
  private destroy$ = inject(DestroyRef);

  orden = signal<Workorder | undefined>(undefined);
  cargando = signal<boolean>(true);
  esManager = signal<boolean>(false);
  mecanicosDisponibles = signal<User[]>([]);
  mecanicoSeleccionado = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const userStorage = this.authService.getUserFromStorage();

    if (userStorage) {
      try {
        const userData: User = JSON.parse(userStorage);
        const role = (userData.role || '').toString().replace(/"/g, '').toUpperCase();

        this.esManager.set(role === 'MANAGER' || role === 'CO_MANAGER');

        const miWorkshopId =
          userData.workShopId ||
          (userData.workshop as any)?.workshopId ||
          (userData.workshop as any)?.id;

        if (this.esManager() && miWorkshopId != null) {
          this.cargarMecanicosDelTaller(miWorkshopId);
        }
      } catch (e) {
        console.error('Error al procesar sesión en WorkOrderDetail:', e);
        this.esManager.set(false);
      }
    }

    if (id) {
      this.cargarOrden(+id);
    } else {
      this.cargando.set(false);
    }
  }

  cargarOrden(id: number) {
    this.cargando.set(true);
    this.workOrderService.getWorkOrderById(id).subscribe({
      next: (data: Workorder) => {
        this.orden.set(data);
        this.cargando.set(false);

        const nombreMecanico = data.mechanicName;

        if (nombreMecanico && this.mecanicosDisponibles().length > 0) {
          const encontrado = this.mecanicosDisponibles().find(
            (m) => m.name.toLowerCase() === nombreMecanico.toLowerCase(),
          );
          if (encontrado) this.mecanicoSeleccionado.set(encontrado.dni);
        }
      },
      error: (err: HttpErrorResponse) => {
        const msj = err.error?.message || err.message || 'Error desconocido';
        console.error('Error al cargar la orden:', err);
        this.cargando.set(false);

        Swal.fire({
          title: 'Error al cargar',
          text: `No se pudo obtener la orden: ${msj}`,
          icon: 'error',
          background: '#212529',
          color: '#fff',
          confirmButtonColor: '#0d6efd',
        });
      },
    });
  }

  cambiarEstado(nuevoEstado: string) {
    const currentOrden = this.orden();
    if (!currentOrden) return;

    this.workOrderService.updateWorkOrder(currentOrden.id, { status: nuevoEstado }).subscribe({
      next: () => this.cargarOrden(currentOrden.id),
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  borrarOrden() {
    const currentOrden = this.orden();
    if (!currentOrden) return;
    const idOrden = currentOrden.id;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Vas a borrar esta orden de trabajo. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-trash"></i> Sí, borrar',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.workOrderService.deleteWorkOrder(idOrden).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Borrada!',
              text: 'La orden ha sido eliminada correctamente.',
              icon: 'success',
              background: '#212529',
              color: '#fff',
              timer: 1500,
              showConfirmButton: false,
            }).then(() => this.volver());
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al borrar la orden', err);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo borrar la orden de trabajo.',
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

  volver() {
    this.router.navigate(['/dashboard/mantenimientos']);
  }

  manejarNuevaLinea(lineaData: {
    concept: string;
    quantity: number;
    pricePerUnit: number;
    IVA: number;
    discount: number;
  }) {
    const currentOrden = this.orden();
    if (!currentOrden) return;
    this.workOrderService.addWorkOrderLine(currentOrden.id, lineaData).subscribe({
      next: () => this.cargarOrden(currentOrden.id),
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  manejarBorradoLinea(lineId: number) {
    const currentOrden = this.orden();
    if (!currentOrden) return;
    this.workOrderService.deleteWorkOrderLine(currentOrden.id, lineId).subscribe({
      next: () => this.cargarOrden(currentOrden.id),
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  manejarActualizacionLinea(evento: { lineId: number; data: Partial<WorkOrderLine> }) {
    const currentOrden = this.orden();
    if (!currentOrden) return;
    this.workOrderService
      .updateWorkOrderLine(currentOrden.id, evento.lineId, evento.data)
      .subscribe({
        next: () => this.cargarOrden(currentOrden.id),
        error: (err: HttpErrorResponse) => console.error(err),
      });
  }

  cargarMecanicosDelTaller(workshopId: number) {
    this.tallerService
      .getMecanicosPorTaller(workshopId)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (mecanicos: User[]) => {
          this.mecanicosDisponibles.set(mecanicos);

          const nombreMecanico = this.orden()?.mechanicName;

          if (nombreMecanico) {
            const mecanicoEncontrado = mecanicos.find(
              (m) => m.name.toLowerCase() === nombreMecanico.toLowerCase(),
            );
            if (mecanicoEncontrado) {
              this.mecanicoSeleccionado.set(mecanicoEncontrado.dni);
            }
          }
        },
        error: (err: HttpErrorResponse) => console.error('Error cargando mecánicos:', err),
      });
  }

  reasignarMecanico(nuevoMechanicId: string) {
    const currentOrden = this.orden();
    if (!currentOrden || !nuevoMechanicId) return;

    const idOrden = currentOrden.id;
    const mecanicoPrevio = this.mecanicoSeleccionado();

    Swal.fire({
      title: '¿Reasignar mecánico?',
      text: 'Vas a asignar esta orden de trabajo a un nuevo mecánico.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-person-lines-fill"></i> Sí, reasignar',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.workOrderService.reassignWorkOrder(idOrden, nuevoMechanicId).subscribe({
          next: () => {
            this.mecanicoSeleccionado.set(nuevoMechanicId);
            this.cargarOrden(idOrden);

            Swal.fire({
              title: 'Mecánico reasignado',
              text: 'La orden ha sido actualizada con éxito.',
              icon: 'success',
              background: '#212529',
              color: '#fff',
              timer: 2500,
              showConfirmButton: false,
              position: 'top-end',
              toast: true,
            });
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al asignar', err);
            this.mecanicoSeleccionado.set(mecanicoPrevio);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo reasignar el mecánico.',
              icon: 'error',
              background: '#212529',
              color: '#fff',
              confirmButtonColor: '#0d6efd',
            });
          },
        });
      } else {
        this.mecanicoSeleccionado.set(mecanicoPrevio);
      }
    });
  }
}
