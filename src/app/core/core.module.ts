import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { MascotasService } from './services/mascotas.service';
import { CitasService } from './services/citas.service';
import { NotificationService } from './services/notification.service';
import { AuthGuard } from './guards/auth.guard';
import { PermisoGuard } from './guards/permiso.guard';
import { VeterinariosService } from './services/veterinarios.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    StorageService,
    MascotasService,
    CitasService,
    NotificationService,
    AuthGuard,
    PermisoGuard,
    VeterinariosService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule ya ha sido cargado. Importar únicamente en AppModule.');
    }
  }
}
