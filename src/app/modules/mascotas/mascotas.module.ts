import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MascotasRoutingModule } from './mascotas-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { FormularioMascotaComponent } from './components/formulario-mascota/formulario-mascota.component';
import { TablaHistorialComponent } from './components/tabla-historial/tabla-historial.component';
import { TarjetaMascotaComponent } from './components/tarjeta-mascota/tarjeta-mascota.component';
import { RegistroMascotaComponent } from './pages/registro-mascota/registro-mascota.component';
import { HistorialMascotasComponent } from './pages/historial-mascotas/historial-mascotas.component';

@NgModule({
  declarations: [
    FormularioMascotaComponent,
    TablaHistorialComponent,
    TarjetaMascotaComponent,
    RegistroMascotaComponent,
    HistorialMascotasComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MascotasRoutingModule
  ]
})
export class MascotasModule {}
