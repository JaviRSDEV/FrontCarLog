import { Routes } from '@angular/router';
import { CounterPageComponent } from './pages/counter/counter-page.components';
import { Login } from './login/login';

export const routes: Routes = [

  {
    path: '',
    component: Login
  }
];
