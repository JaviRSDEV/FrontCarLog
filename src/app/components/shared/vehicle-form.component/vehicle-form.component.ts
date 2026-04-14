import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Vehicle } from '../../../models/vehicle';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css',
})
export class VehicleFormComponent implements OnInit {
  @Input() vehiculoEdicion: Vehicle | null = null;
  @Input() userDni: string = '';
  @Input() workshopId: number = 0;
  @Input() isEditing: boolean = false;

  @Output() guardado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  vehiculoForm: FormGroup;
  imagenesTemporales: string[] = [];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
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
    if (this.isEditing && this.vehiculoEdicion) {
      this.imagenesTemporales = this.vehiculoEdicion.images ? [...this.vehiculoEdicion.images] : [];
      this.vehiculoForm.patchValue({
        ...this.vehiculoEdicion,
        images: this.imagenesTemporales,
      });
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    for (let file of files) {
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

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result !== 'string') return reject('Error al leer archivo');

        const img = new Image();
        img.src = result;

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
          if (!ctx) return reject('No se pudo obtener el contexto 2D');

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
    });
  }

  eliminarImagenPrevia(index: number): void {
    this.imagenesTemporales.splice(index, 1);
    this.vehiculoForm.patchValue({ images: this.imagenesTemporales });
  }

  guardarVehiculo(): void {
    if (this.vehiculoForm.valid) {
      const vehiculoData: Vehicle = {
        ...this.vehiculoForm.value,
        workshopId: this.workshopId,
      };

      if (!vehiculoData.ownerId) {
        vehiculoData.ownerId = this.userDni;
      }

      const operacion: Observable<Vehicle> =
        this.isEditing && this.vehiculoEdicion
          ? this.vehicleService.updateVehicle(this.vehiculoEdicion.plate, vehiculoData)
          : this.vehicleService.createVehicle(vehiculoData);

      operacion.subscribe({
        next: () => {
          this.guardado.emit();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error en la operación:', err);
        },
      });
    } else {
      this.vehiculoForm.markAllAsTouched();
    }
  }
}
