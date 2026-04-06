import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Workorder } from './../../../models/workorder';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './work-order-detail.component.html',
  styleUrl: './work-order-detail.component.css',
})
export class WorkOrderDetailComponent implements OnInit{

  orden?: Workorder;
  cargando: boolean = true;

  nuevaLinea = {
    concept: '',
    quantity: 1,
    pricePerUnit: 0,
    IVA: 21,
    discount: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);

    if(id){
      this.cargarOrden(+id);
    }else{
      console.error('No hay Id');
      this.cargando = false;
    }
  }

  cargarOrden(id: number){
    console.log('Llamando al servicio para ID', id)

    this.workOrderService.getWorkOrderById(id).subscribe({
      next: (data: any) => {
        console.log(data);
        this.orden = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.router.navigate(['/dashboard/mantenimientos']);
      }
    });

    setTimeout(() => {
      if(this.cargando){
        console.log("Tiempo de espera agotao");
        this.cargando = false;
        this.cdr.detectChanges();
      }
    }, 5000);
  }

  cambiarEstado(nuevoEstado: string){
    if(!this.orden) return;
    this.workOrderService.updateWorkOrder(this.orden.id, { status: nuevoEstado }).subscribe({
      next: () => {
        this.cargarOrden(this.orden!.id);

        this.nuevaLinea = {
          concept: '',
          quantity: 1,
          pricePerUnit: 0,
          IVA: 21,
          discount: 0
        }
      }
    });
  }

  agregarLinea(){
    if(!this.orden || !this.nuevaLinea.concept) return;
    this.workOrderService.addWorkOrderLine(this.orden.id, this.nuevaLinea).subscribe({
      next: () => {
        this.cargarOrden(this.orden!.id);
        this.nuevaLinea = {
          concept: '',
          quantity: 1,
          pricePerUnit: 0,
          IVA: 21,
          discount: 0
        }
      }
    });
  }

  eliminarLinea(lineId: number){
    if (!this.orden) return;
    this.workOrderService.deleteWorkOrderLine(this.orden.id, lineId).subscribe({
      next: () => this.cargarOrden(this.orden!.id)
    });
  }

  borrarOrden(){
    if(!this.orden || !confirm('¿Seguro que quieres borrar esta orden?')) return;
    this.workOrderService.deleteWorkOrder(this.orden.id).subscribe({
      next: () => this.volver()
    });
  }

  volver(){
    this.router.navigate(['/dashboard/mantenimientos']);
  }
}
