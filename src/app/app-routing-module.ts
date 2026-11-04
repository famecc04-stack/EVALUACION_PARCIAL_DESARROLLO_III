import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'citas',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/citas/citas.module').then(m => m.CitasModule)
  },
  {
    path: 'mascotas',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/mascotas/mascotas.module').then(m => m.MascotasModule)
  },
  {
    path: '',
    redirectTo: 'citas',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'citas'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
