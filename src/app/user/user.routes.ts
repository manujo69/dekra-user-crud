import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/pages/user-list/user-list.component')
      .then(m => m.UserListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./ui/pages/user-form/user-form.component')
      .then(m => m.UserFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./ui/pages/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./ui/pages/user-form/user-form.component')
      .then(m => m.UserFormComponent)
  }
];
