import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout'
import { VehicleListComponent } from './components/shared/vehicle-list-component/vehicle-list-component';
import { AltaTaller } from './components/shared/alta-taller/alta-taller';
import { tallerGuard } from './core/guards/taller-guard';
import { authguardGuard } from './core/guards/auth-guard';
import { altaTallerGuard } from './core/guards/alta-taller-guard';
export const routes: Routes = [

  {
    path: '',
    component: Login,
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authguardGuard],
    children: [
    {
      path: '',
      pathMatch: 'full',
      canActivate: [tallerGuard],
      children: []
    },
    {
      path: 'vehiculos',
      component: VehicleListComponent,
      canActivate: [tallerGuard]
    },
    {
      path: 'alta-taller',
      component: AltaTaller,
      canActivate: [altaTallerGuard]
    }]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];
