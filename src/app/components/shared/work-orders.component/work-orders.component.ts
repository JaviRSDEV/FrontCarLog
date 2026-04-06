import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Workorder } from '../../../models/workorder';
import { WorkOrderFormComponent } from '../work-order-form.component/work-order-form.component';

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [WorkOrderFormComponent],
  templateUrl: './work-orders.component.html',
  styleUrl: './work-orders.component.css',
})

export class WorkOrdersComponent implements OnInit{
  role: string = '';
  userDni: string = '';

  activeTab: string = '';
  ordenes: Workorder[] = [];
  mostrarFormulario: boolean = false;

  constructor(private workOrderService: WorkOrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void{
    const userJson = localStorage.getItem('user');

    if(userJson){
      const user = JSON.parse(userJson);
      this.role = user.role;
      this.userDni = user.userId;

      if(this.role === 'MANAGER' || this.role === 'CO_MANAGER'){
        this.cambiarPestana('todas');
      }else if (this.role === 'MECHANIC'){
        this.cambiarPestana('asignadas');
      }
    }
  }

  cambiarPestana(tab: string){
    this.activeTab = tab;
    if(tab === 'todas'){
      this.cargarTodasLasOrdenes();
    }else if(tab === 'asignadas'){
      this.cargarOrdenesDelMecanico();
    }
  }

  cargarTodasLasOrdenes(){
    this.workOrderService.getAllWorkOrders().subscribe({
      next: (data: any) => {
        this.ordenes = data;
        this.cdr.detectChanges();
      },
        error: (err: any) => console.error(err)
    });
  }

  cargarOrdenesDelMecanico(){
    this.workOrderService.getWorkOrdersByMechanic(this.userDni).subscribe({
      next: (data) => {
        this.ordenes = data;
        this.cdr.detectChanges();
      },
        error: (err) => console.error('Error al cargar las órdenes del mecánico', err)
    });
  }

  onOrdenGuardada(){
    this.mostrarFormulario = false;

    if(this.activeTab === 'todas'){
      this.cargarTodasLasOrdenes();
    }else{
      this.cargarOrdenesDelMecanico();
    }
  }

   toggleFormulario(){
    this.mostrarFormulario = !this.mostrarFormulario;
  }
}
