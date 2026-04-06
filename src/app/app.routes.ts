import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout'
import { VehicleListComponent } from './components/shared/vehicle-list-component/vehicle-list-component.component';
import { AltaTaller } from './components/shared/alta-taller/alta-taller.component';
import { tallerGuard } from './core/guards/taller-guard/taller-guard';
import { authguardGuard } from './core/guards/auth-guard/auth-guard';
import { altaTallerGuard } from './core/guards/alta-taller-guard/alta-taller-guard';
import { loginGuard } from './core/guards/login-guard/login-guard';
import { DashboardComponent } from './components/shared/dashboard.component/dashboard.component';
import { WorkOrdersComponent } from './components/shared/work-orders.component/work-orders.component';
import { WorkOrderDetailComponent } from './components/shared/work-order-detail.component/work-order-detail.component';
export const routes: Routes = [

  {
    path: '',
    component: Login,
    pathMatch: 'full',
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authguardGuard],
    children: [
    {
      path: '',
      pathMatch: 'full',
      component: DashboardComponent,
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
    },
    {
      path: 'mantenimientos',
      component: WorkOrdersComponent,
      canActivate: [tallerGuard]
    },
    {
      path: 'mantenimientos/:id',
      component: WorkOrderDetailComponent,
      canActivate: [tallerGuard]
    }
  ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];
