import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Vehicle } from '../../../models/vehicle';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css'
})
export class VehicleFormComponent implements OnInit {
  @Input() vehiculoEdicion: Vehicle | null = null;
  @Input() userDni: string = '';
  @Input() workshopId: number = 0;
  @Input() isEditing: boolean = false;

  // 🔥 Cambiado de 'actualizado' a 'guardado' para que el Padre lo entienda
  @Output() guardado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  vehiculoForm: FormGroup;
  imagenesTemporales: string[] = [];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef
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
    if (this.isEditing && this.vehiculoEdicion) {
      this.imagenesTemporales = this.vehiculoEdicion.images ? [...this.vehiculoEdicion.images] : [];
      this.vehiculoForm.patchValue({
        ...this.vehiculoEdicion,
        images: this.imagenesTemporales
      });
    }
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
    this.cdr.detectChanges();
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
          resolve(canvas.toDataURL('image/webp', quality));
        };
      };
      reader.onerror = (error) => reject(error);
    });
  }

  eliminarImagenPrevia(index: number) {
    this.imagenesTemporales.splice(index, 1);
    this.vehiculoForm.patchValue({ images: this.imagenesTemporales });
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

      const operacion = (this.isEditing && this.vehiculoEdicion)
        ? this.vehicleService.updateVehicle(this.vehiculoEdicion.plate, vehiculoData)
        : this.vehicleService.createVehicle(vehiculoData);

      operacion.subscribe({
        next: () => {
          // 🔥 Avisamos al padre de que hemos terminado con éxito
          this.guardado.emit();
        },
        error: (err) => console.error('Error en la operación:', err)
      });
    } else {
      this.vehiculoForm.markAllAsTouched();
    }
  }
}
