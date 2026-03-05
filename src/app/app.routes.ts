import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout'

export const routes: Routes = [

  {
    path: '',
    component: Login,
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [

    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];
