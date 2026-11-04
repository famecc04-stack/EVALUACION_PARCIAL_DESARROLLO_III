import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mascota } from '../../../../models/mascota.model';
import { Dueno } from '../../../../models/dueno.model';

@Component({
  selector: 'app-tarjeta-mascota',
  templateUrl: './tarjeta-mascota.component.html',
  styleUrls: ['./tarjeta-mascota.component.scss'],
  standalone: false
})
export class TarjetaMascotaComponent {
  @Input() mascota!: Mascota;
  @Input() dueno?: Dueno;
  @Input() seleccionada: boolean = false;
  @Output() seleccionar = new EventEmitter<string>();

  public onSeleccionar(): void {
    this.seleccionar.emit(this.mascota.id);
  }
}
