import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Workorder } from './../../../models/workorder';
import { WorkOrderLinesComponent } from '../work-order-lines.component/work-order-lines.component';
import { FormsModule } from '@angular/forms';
import { TallerService } from '../../../services/tallerService/taller.service';

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
  mecanicosDisponibles: any[] = [];
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
        const userData = JSON.parse(userStorage);

        this.esManager = userData.role === 'MANAGER';
        const miWorkshopId = userData.workShopId;
        console.log(userData);
        console.log(miWorkshopId);

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
      next: (data: any) => {
        this.orden = data;
        this.cargando = false;

        const nombreMecanico = (this.orden as any)?.mechanicName;
        if (nombreMecanico && this.mecanicosDisponibles.length > 0) {
          const encontrado = this.mecanicosDisponibles.find(
            (m) => m.name.toLowerCase() === nombreMecanico.toLowerCase(),
          );
          if (encontrado) this.mecanicoSeleccionado = encontrado.dni;
        }

        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/dashboard/mantenimientos']),
    });
  }

  cambiarEstado(nuevoEstado: string) {
    if (!this.orden) return;
    this.workOrderService.updateWorkOrder(this.orden.id, { status: nuevoEstado }).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
    });
  }

  borrarOrden() {
    if (!this.orden || !confirm('¿Seguro que quieres borrar esta orden?')) return;
    this.workOrderService.deleteWorkOrder(this.orden.id).subscribe({
      next: () => this.volver(),
    });
  }

  volver() {
    this.router.navigate(['/dashboard/mantenimientos']);
  }

  manejarNuevaLinea(lineaData: any) {
    if (!this.orden) return;
    this.workOrderService.addWorkOrderLine(this.orden.id, lineaData).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
    });
  }

  manejarBorradoLinea(lineId: number) {
    if (!this.orden) return;
    this.workOrderService.deleteWorkOrderLine(this.orden.id, lineId).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
    });
  }

  manejarActualizacionLinea(evento: { lineId: number; data: any }) {
    if (!this.orden) return;
    this.workOrderService.updateWorkOrderLine(this.orden.id, evento.lineId, evento.data).subscribe({
      next: () => this.cargarOrden(this.orden!.id),
    });
  }

  cargarMecanicosDelTaller(workshopId: number) {
    this.tallerService.getMecanicosPorTaller(workshopId).subscribe({
      next: (mecanicos) => {
        this.mecanicosDisponibles = mecanicos;

        const nombreMecanico = (this.orden as any)?.mechanicName;

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
      error: (err: any) => console.error(err),
    });
  }

  reasignarMecanico(nuevoMechanicId: string) {
    if (!this.orden || !nuevoMechanicId) return;
    if (!confirm('¿Seguro que quieres asignar esta orden a otro mecánico?')) return;

    this.workOrderService.reassignWorkOrder(this.orden.id, nuevoMechanicId).subscribe({
      next: () => {
        this.cargarOrden(this.orden!.id);
      },
      error: (err) => console.error('Error al asignar', err),
    });
  }
}
