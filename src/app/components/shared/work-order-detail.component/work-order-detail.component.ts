import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Workorder } from './../../../models/workorder';
import { WorkOrderLine } from './../../../models/workorderline';
import { User } from './../../../models/user';
import { WorkOrderLinesComponent } from '../work-order-lines.component/work-order-lines.component';
import { FormsModule } from '@angular/forms';
import { TallerService } from '../../../services/tallerService/taller.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, FormsModule, WorkOrderLinesComponent],
  templateUrl: './work-order-detail.component.html',
  styleUrl: './work-order-detail.component.css',
})
export class WorkOrderDetailComponent implements OnInit {
  orden?: Workorder;
  cargando: boolean = true;
  esManager: boolean = false;
  mecanicosDisponibles: User[] = [];
  mecanicoSeleccionado: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrderService: WorkOrderService,
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const userStorage = localStorage.getItem('user');

    if (userStorage) {
      try {
        const userData: User = JSON.parse(userStorage);

        this.esManager = userData.role === 'MANAGER' || userData.role === 'CO_MANAGER';
        const miWorkshopId = userData.workShopId;

        if (this.esManager && miWorkshopId != null) {
          this.cargarMecanicosDelTaller(miWorkshopId);
        }
      } catch (e) {
        console.error(e);
        this.esManager = false;
      }
    }

    if (id) {
      this.cargarOrden(+id);
    } else {
      this.cargando = false;
    }
  }

  cargarOrden(id: number) {
    this.workOrderService.getWorkOrderById(id).subscribe({
      next: (data: Workorder) => {
        this.orden = data;
        this.cargando = false;

        const nombreMecanico = this.orden.mechanicName;

        if (nombreMecanico && this.mecanicosDisponibles.length > 0) {
          const encontrado = this.mecanicosDisponibles.find(
            (m) => m.name.toLowerCase() === nombreMecanico.toLowerCase(),
          );
          if (encontrado) this.mecanicoSeleccionado = encontrado.dni;
        }

        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        const msj = err.error?.message || err.message || 'Error desconocido';
        console.error('Detalle completo del error:', err);
        this.cargando = false;

        Swal.fire({
          title: 'Error al cargar',
          text: `Fallo al obtener la orden: ${msj}`,
          icon: 'error',
          background: '#212529',
          color: '#fff',
          confirmButtonColor: '#0d6efd',
        });
      },
    });
  }

  cambiarEstado(nuevoEstado: string) {
    if (!this.orden) return;
    this.workOrderService.updateWorkOrder(this.orden.id, { status: nuevoEstado }).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  borrarOrden() {
    if (!this.orden) return;
    const idOrden = this.orden.id;

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
            }).then(() => {
              this.volver();
            });
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
    if (!this.orden) return;
    this.workOrderService.addWorkOrderLine(this.orden.id, lineaData).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  manejarBorradoLinea(lineId: number) {
    if (!this.orden) return;
    this.workOrderService.deleteWorkOrderLine(this.orden.id, lineId).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  manejarActualizacionLinea(evento: { lineId: number; data: Partial<WorkOrderLine> }) {
    if (!this.orden) return;
    this.workOrderService.updateWorkOrderLine(this.orden.id, evento.lineId, evento.data).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  cargarMecanicosDelTaller(workshopId: number) {
    this.tallerService.getMecanicosPorTaller(workshopId).subscribe({
      next: (mecanicos: User[]) => {
        this.mecanicosDisponibles = mecanicos;

        const nombreMecanico = this.orden?.mechanicName;

        if (nombreMecanico) {
          const mecanicoEncontrado = this.mecanicosDisponibles.find(
            (m) => m.name.toLowerCase() === nombreMecanico.toLowerCase(),
          );

          if (mecanicoEncontrado) {
            this.mecanicoSeleccionado = mecanicoEncontrado.dni;
          }
        }

        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  reasignarMecanico(nuevoMechanicId: string) {
    if (!this.orden || !nuevoMechanicId) return;

    const idOrden = this.orden.id;

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
            Swal.fire({
              title: 'Error',
              text: 'No se pudo reasignar el mecánico a esta orden.',
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
}
