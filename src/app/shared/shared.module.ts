import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { UrgenciaCitaDirective } from './directives/urgencia-cita.directive';
import { InputValidadorDirective } from './directives/input-validador.directive';
import { TienePermisoDirective } from './directives/tiene-permiso.directive';
import { EstadoCitaPipe } from './pipes/estado-cita.pipe';
import { FechaRelativaPipe } from './pipes/fecha-relativa.pipe';
import { EspecieBadgePipe } from './pipes/especie-badge.pipe';

@NgModule({
  declarations: [
    NavbarComponent,
    UrgenciaCitaDirective,
    InputValidadorDirective,
    TienePermisoDirective,
    EstadoCitaPipe,
    FechaRelativaPipe,
    EspecieBadgePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    UrgenciaCitaDirective,
    InputValidadorDirective,
    TienePermisoDirective,
    EstadoCitaPipe,
    FechaRelativaPipe,
    EspecieBadgePipe
  ]
})
export class SharedModule {}
