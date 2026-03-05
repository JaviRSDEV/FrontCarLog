import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { UserView } from './pages/user-view/user-view';

export const routes: Routes = [

  {
    path: '',
    component: Login
  },
  {
    path: '/dashboard',
    component: UserView,
    children: [

    ]
  }
];
