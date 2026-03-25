import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Vehicle } from '../../../models/vehicle';
import { Workorder } from '../../../models/workorder';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { WorkOrderService } from '../../../services/workOrderService/work-order.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vehicle-list-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vehicle-list-component.html',
  styleUrl: './vehicle-list-component.css',
})
export class VehicleListComponent implements OnInit {
  activeTab: 'mis-vehiculos' | 'asignados' | 'flota' = 'mis-vehiculos';
  role: string = '';
  userDni: string = '';
  workshopId: number = 0;

  mostrarFormulario: boolean = false;
  isEditing: boolean = false;
  matriculaEditando: string | null = null;

  imagenesTemporales: string[] = [];

  misVehiculos: Vehicle[] = [];
  ordenesAsignadas: Workorder[] = [];
  flotaTaller: Vehicle[] = [];

  vehiculoForm: FormGroup;
  vehiculoSeleccionado: Vehicle | null = null;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef,
  ) {
    this.vehiculoForm = this.fb.group({
      plate: ['', [Validators.required]],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      kilometers: [0, [Validators.required, Validators.min(0)]],
      engine: [''],
      horsePower: [0],
      torque: [0],
      tires: [''],
      lastMaintenance: [null],
      images: [[]],
      ownerId: [''],
    });
  }

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.role = user.role;
      this.userDni = user.userId ? String(user.userId) : '';
      this.workshopId = user.workshopId || 0;
    }

    setTimeout(() => {
      this.cargarDatos(this.activeTab);
    });
  }

  cargarDatos(tab: string) {
    if (tab === 'mis-vehiculos' && this.userDni) {
      this.vehicleService.getVehiclesByOwner(this.userDni).subscribe({
        next: (data) => {
          this.misVehiculos = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
    } else if (tab === 'asignados' && this.userDni) {
      this.workOrderService.getWorkOrdersByMechanic(this.userDni).subscribe({
        next: (data) => {
          this.ordenesAsignadas = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
    } else if (tab === 'flota' && this.userDni) {
      this.vehicleService.getVehiclesByWorkshop(this.workshopId).subscribe({
        next: (data) => {
          this.flotaTaller = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
    }
  }

  cambiarPestana(pestana: any) {
    this.activeTab = pestana;
    this.mostrarFormulario = false;
    this.cargarDatos(pestana);
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;

    if (!this.mostrarFormulario) {
      this.vehiculoForm.reset();
      this.isEditing = false;
      this.matriculaEditando = null;
      this.imagenesTemporales = [];
    }
  }

  abrirDetalles(vehiculo: Vehicle) {
    this.vehiculoSeleccionado = vehiculo;
  }

  cerrarDetalles() {
    this.vehiculoSeleccionado = null;
  }

  async onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];

    for(let file of files){
      try {
        const compressedBase64 = await this.compressImage(file, 800, 600, 0.7);
        this.imagenesTemporales.push(compressedBase64);
      } catch (error) {
        console.error('Error al comprimir la imagen', error);
      }
    }
    this.vehiculoForm.patchValue({ images: this.imagenesTemporales });

    this.cdr.detectChanges()
  }

  compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
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

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/webp', quality);
          resolve(compressedBase64);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  }

  editarVehiculo(vehiculo: Vehicle) {
    this.mostrarFormulario = true;
    this.activeTab = 'mis-vehiculos';
    this.isEditing = true;
    this.matriculaEditando = vehiculo.plate;

    this.imagenesTemporales = vehiculo.images ? [...vehiculo.images] : [];
    this.vehiculoForm.patchValue({
      plate: vehiculo.plate,
      brand: vehiculo.brand,
      model: vehiculo.model,
      kilometers: vehiculo.kilometers,
      engine: vehiculo.engine,
      horsePower: vehiculo.horsePower,
      torque: vehiculo.torque,
      tires: vehiculo.tires,
      lastMaintenance: vehiculo.lastMaintenance,
      image: this.imagenesTemporales,
    });
  }

  eliminarVehiculo(plate: string) {
    if (confirm(`¿Estás seguro de que quieres eliminar el vehículo con la matrícula ${plate}?`)) {
      this.vehicleService.deleteVehicle(plate).subscribe({
        next: () => {
          this.cargarDatos(this.activeTab);
        },
        error: (err: any) => {
          console.error('Error completo:', err);
          alert('Hubo error al intentar eliminar el vehículo');
        },
      });
    }
  }

  guardarVehiculo() {
    if (this.vehiculoForm.valid) {
      const vehiculoData: Vehicle = {
        ...this.vehiculoForm.value,
        workshopId: this.workshopId,
      };

      if (!vehiculoData.ownerId) {
        vehiculoData.ownerId = this.userDni;
      }

      if (this.isEditing && this.matriculaEditando) {
        this.vehicleService.updateVehicle(this.matriculaEditando, vehiculoData).subscribe({
          next: () => {
            console.log('Vehículo actualizado con éxito');
            this.toggleFormulario();
            this.cargarDatos('mis-vehiculos');
          },
          error: (err: any) => {
            console.error('Error al actualizar:', err);
            alert('No se pudo actualizar el vehículo.');
          },
        });
      } else {
        this.vehicleService.createVehicle(vehiculoData).subscribe({
          next: () => {
            console.log('Vehículo creado con éxito');
            this.toggleFormulario();
            this.cargarDatos('mis-vehiculos');
          },
          error: (err: any) => {
            console.error('Error al crear:', err);
            alert('No se pudo crear el vehículo.');
          },
        });
      }
    } else {
      this.vehiculoForm.markAllAsTouched();
    }
  }

  eliminarImagenPrevia(index: number) {
    this.imagenesTemporales.splice(index, 1);
    this.vehiculoForm.patchValue({ images: this.imagenesTemporales });
  }
}
