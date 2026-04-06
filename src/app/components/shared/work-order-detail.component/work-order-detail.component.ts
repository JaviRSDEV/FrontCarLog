import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Workorder } from './../../../models/workorder';
import { WorkOrderLinesComponent } from '../work-order-lines.component/work-order-lines.component';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, UpperCasePipe, WorkOrderLinesComponent],
  templateUrl: './work-order-detail.component.html',
  styleUrl: './work-order-detail.component.css',
})
export class WorkOrderDetailComponent implements OnInit {
  orden?: Workorder;
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
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
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/dashboard/mantenimientos']),
    });

    setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    }, 5000);
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
}
