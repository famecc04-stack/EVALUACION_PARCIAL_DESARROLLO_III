import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroMascotaComponent } from './pages/registro-mascota/registro-mascota.component';
import { HistorialMascotasComponent } from './pages/historial-mascotas/historial-mascotas.component';
import { PermisoGuard } from '../../core/guards/permiso.guard';

const routes: Routes = [
  {
    path: 'registro',
    component: RegistroMascotaComponent,
    canActivate: [PermisoGuard],
    data: { permiso: 'MASCOTAS_REGISTRAR' }
  },
  {
    path: 'historial',
    component: HistorialMascotasComponent,
    canActivate: [PermisoGuard],
    data: { permiso: 'HISTORIAL_VER' }
  },
  {
    path: '',
    redirectTo: 'historial',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MascotasRoutingModule {}
