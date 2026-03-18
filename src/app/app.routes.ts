import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout'
import { VehicleListComponent } from './components/shared/vehicle-list-component/vehicle-list-component';
import { AltaTaller } from './components/shared/alta-taller/alta-taller';
import { tallerGuard } from './core/guards/taller-guard';
import { authguardGuard } from './core/guards/auth-guard';
export const routes: Routes = [

  {
    path: '',
    component: Login,
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [tallerGuard, authguardGuard],
    children: [{
      path: 'vehiculos',
      component: VehicleListComponent,
      canActivate: [tallerGuard, authguardGuard]
    },
    {
      path: 'alta-taller',
      component: AltaTaller,
      canActivate: [authguardGuard]
    }]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];
