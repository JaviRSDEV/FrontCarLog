import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { Vehicle } from '../../../models/vehicle';
import { Workorder } from '../../../models/workorder';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { WorkOrderService } from '../../../services/workOrderService/work-order.service';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-vehicle-list-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vehicle-list-component.html',
  styleUrl: './vehicle-list-component.css',
})
export class VehicleListComponent implements OnInit{

  activeTab: 'mis-vehiculos' | 'asignados' | 'flota' = 'mis-vehiculos';
  role: string = '';
  userDni: string = '';
  workshopId: number = 0;
  mostrarFormulario: boolean = false;

  misVehiculos: Vehicle[] = [];
  ordenesAsignadas: Workorder[] = [];
  flotaTaller: Vehicle[] = [];

  vehiculoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private workOrderService: WorkOrderService
  ){
    this.vehiculoForm = this.fb.group({
      plate: ['', [Validators.required]],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      kilometers: [0, [Validators.required, Validators.min(0)]],
      engine: [''],
      horsePower: [0],
      torque: [0],
      tires:[''],
      lastMaintenance: [null],
      image: [null],
      ownerId: ['']
    });
  }

ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.role = user.role;

      this.userDni = user.userId ? String(user.userId) : '';
      console.log(this.userDni);
      this.workshopId = user.workshopId || 0;
    }

    this.cargarDatos(this.activeTab);
  }

  cargarDatos(tab: string){
    if(tab === 'mis-vehiculos' && this.userDni){
      this.vehicleService.getVehiclesByOwner(this.userDni).subscribe({
        next: (data) => this.misVehiculos = data,
        error: (err) => console.error(err)
      });
    }
    else if(tab === 'asignados' && this.userDni){
      this.workOrderService.getWorkOrdersByMechanic(this.userDni).subscribe({
        next: (data) => this.ordenesAsignadas = data,
        error: (err) => console.error(err)
      });
    }
    else if(tab === 'flota' && this.userDni){
      this.vehicleService.getVehiclesByWorkshop(this.workshopId).subscribe({
        next: (data) => this.flotaTaller = data,
        error: (err) => console.error(err)
      });
    }
  }

  cambiarPestana(pestana: any){
    this.activeTab = pestana;
    this.mostrarFormulario = false;
    this.cargarDatos(pestana);
  }

  toggleFormulario(){
    this.mostrarFormulario = !this.mostrarFormulario;
    if(!this.mostrarFormulario){
      this.vehiculoForm.reset({ kilometers: 0, horsePower: 0, torque: 0 });
    }
  }

  async onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    try {
      const compressedBase64 = await this.compressImage(file, 800, 600, 0.7);

      this.vehiculoForm.patchValue({
        image: compressedBase64
      });

      console.log("Imagen comprimida con éxito");
    } catch (error) {
      console.error("Error al comprimir la imagen", error);
    }
  }
}

  compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string>{
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if(width > height){
            if(width > maxWidth){
              height *= maxWidth / width;
              width = maxWidth;
            }
          }else{
            if(height > maxHeight){
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
      };
      reader.onerror = error => reject(error);
    });
  }

  guardarVehiculo() {
    if (this.vehiculoForm.valid) {
      const vehiculoData: Vehicle = {
        ...this.vehiculoForm.value,
        workshopId: this.workshopId
      };

      if (!vehiculoData.ownerId) {
        vehiculoData.ownerId = this.userDni;
      }

      this.vehicleService.createVehicle(vehiculoData).subscribe({
        next: () => {
          this.toggleFormulario();
          this.cargarDatos('mis-vehiculos');
        },
        error: (err) => console.error("Error al guardar:", err)
      });
    } else {
      this.vehiculoForm.markAllAsTouched();
    }
  }
}
