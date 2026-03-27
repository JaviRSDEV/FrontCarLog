import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Component, OnInit } from '@angular/core';
import { Workorder } from '../../../models/workorder';

@Component({
  selector: 'app-work-orders.component',
  imports: [],
  templateUrl: './work-orders.component.html',
  styleUrl: './work-orders.component.css',
})
export class WorkOrdersComponent {
  role: string = '';
  userDni: string = '';

  activeTab: string = '';
  ordenes: Workorder[] = [];

  constructor(private WorkOrderService: WorkOrderService) {}

  ngOnInit(): void{
    const userJson = localStorage.getItem('user');

    if(userJson){
      const user = JSON.parse(userJson);
      this.role = user.role;
      this.userDni = user.dni;

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
    this.WorkOrderService.getAllWorkOrders().subscribe({
      next: (data: any) => this.ordenes = data,
      error: (err: any) => console.error(err)
    });
  }

  cargarOrdenesDelMecanico(){
    this.WorkOrderService.getWorkOrdersByMechanic(this.userDni).subscribe({
      next: (data) => this.ordenes = data,
      error: (err) => console.error('Error al cargar las órdenes del mecánico', err)
    });
  }
}
