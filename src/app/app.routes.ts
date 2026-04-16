import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent),
  },
  {
    path: 'groups',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/groups/group-list/group-list.component').then(m => m.GroupListComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./features/groups/group-create/group-create.component').then(m => m.GroupCreateComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent),
      },
    ],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      {
        path: 'edit',
        loadComponent: () => import('./features/profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
      },
    ],
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
  },
  { path: '**', redirectTo: 'feed' },
];
