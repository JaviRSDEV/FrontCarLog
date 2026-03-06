import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout'
import { VehicleListComponent } from './components/shared/vehicle-list-component/vehicle-list-component';

export const routes: Routes = [

  {
    path: '',
    component: Login,
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [{
      path: 'vehiculos',
      component: VehicleListComponent
    }]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];
