// src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./user/ui/pages/user-list/user-list.component')
      .then(m => m.UserListComponent)
  }
];
