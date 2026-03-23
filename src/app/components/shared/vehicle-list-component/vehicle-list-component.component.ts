import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';

@Component({
  selector: 'app-vehicle-list-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-list-component.html',
  styleUrl: './vehicle-list-component.css',
})
export class VehicleListComponent implements OnInit{

  activeTab: string = 'mis-vehiculos';
  role: string = '';
  userDni: string = '';

  mostrarFormulario: boolean = false;
  vehiculoForm: FormGroup;

  constructor(private fb: FormBuilder){
    this.vehiculoForm = this.fb.group({
      matricula: ['', [Validators.required, Validators.pattern(/^[0-9]{4}[A-Z]{3}$/)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      dniBueno: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(){
    const userJson = localStorage.getItem('user');
    if(userJson){
      const user: User = JSON.parse(userJson);
      this.role = user.role;

      if(user.UserDni){
        this.userDni = user.dni;
      }
    }
  }

  cambiarPestana(pestana: string){
    this.activeTab = pestana;
    this.mostrarFormulario = false;
  }

  toggleFormulario(){
    this.mostrarFormulario = !this.mostrarFormulario;
    this.vehiculoForm.reset();
  }

  guardarVehiculo(){
    if(this.vehiculoForm.valid){
      const vehiculoData = { ...this.vehiculoForm.value };

      this.toggleFormulario();
    }else{
      this.vehiculoForm.markAllAsTouched();
    }
  }
}
