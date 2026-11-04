import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CitasRoutingModule } from './citas-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { AgendaCitasComponent } from './pages/agenda-citas/agenda-citas.component';
import { CalendarioCitasComponent } from './components/calendario-citas/calendario-citas.component';
import { FormularioCitaComponent } from './components/formulario-cita/formulario-cita.component';
import { TarjetaCitaComponent } from './components/tarjeta-cita/tarjeta-cita.component';

@NgModule({
  declarations: [
    AgendaCitasComponent,
    CalendarioCitasComponent,
    FormularioCitaComponent,
    TarjetaCitaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CitasRoutingModule
  ]
})
export class CitasModule {}
