import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Especie, SexoMascota } from '../../../../models/animal.model';
import { IDueno } from '../../../../models/dueno.model';
import { IMascota } from '../../../../models/mascota.model';
import { ClinicaValidators } from '../../../../shared/validators/clinica-validators';

export interface IDatosRegistroMascotaDueno {
  dueno: Partial<IDueno>;
  mascota: Partial<IMascota>;
}

@Component({
  selector: 'app-formulario-mascota',
  templateUrl: './formulario-mascota.component.html',
  styleUrls: ['./formulario-mascota.component.scss'],
  standalone: false
})
export class FormularioMascotaComponent implements OnInit {
  @Input() duenosExistentes: IDueno[] = [];
  @Input() enviando: boolean = false;
  @Output() guardarRegistro = new EventEmitter<IDatosRegistroMascotaDueno>();
  @Output() cancelar = new EventEmitter<void>();

  public formulario!: FormGroup;
  public especiesDisponibles: Especie[] = ['CANINO', 'FELINO', 'AVE', 'ROEDOR', 'EXOTICO'];
  public sexosDisponibles: SexoMascota[] = ['MACHO', 'HEMBRA'];
  public nuevaAlergia: string = '';
  public nuevaCondicion: string = '';
  public listaAlergias: string[] = [];
  public listaCondiciones: string[] = [];
  public duenoSeleccionadoId: string = 'NUEVO';

  constructor(private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.inicializarFormulario();
  }

  public onSeleccionarDuenoExistente(evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    const duenoId = select.value;
    this.duenoSeleccionadoId = duenoId;

    if (duenoId === 'NUEVO') {
      this.formulario.get('dueno')?.reset();
      this.formulario.get('dueno')?.enable();
    } else {
      const dueno = this.duenosExistentes.find(d => d.id === duenoId);
      if (dueno) {
        this.formulario.get('dueno')?.patchValue({
          nombre: dueno.nombre,
          apellido: dueno.apellido,
          documentoIdentidad: dueno.documentoIdentidad,
          telefono: dueno.telefono,
          correoElectronico: dueno.correoElectronico,
          direccion: dueno.direccion,
          contactoEmergencia: dueno.contactoEmergencia
        });
      }
    }
  }

  public agregarAlergia(): void {
    const valor = this.nuevaAlergia.trim();
    if (valor && !this.listaAlergias.includes(valor)) {
      this.listaAlergias.push(valor);
      this.nuevaAlergia = '';
    }
  }

  public removerAlergia(indice: number): void {
    this.listaAlergias.splice(indice, 1);
  }

  public agregarCondicion(): void {
    const valor = this.nuevaCondicion.trim();
    if (valor && !this.listaCondiciones.includes(valor)) {
      this.listaCondiciones.push(valor);
      this.nuevaCondicion = '';
    }
  }

  public removerCondicion(indice: number): void {
    this.listaCondiciones.splice(indice, 1);
  }

  public emitirGuardado(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.value;

    const payload: IDatosRegistroMascotaDueno = {
      dueno: {
        id: this.duenoSeleccionadoId !== 'NUEVO' ? this.duenoSeleccionadoId : undefined,
        nombre: valores.dueno.nombre,
        apellido: valores.dueno.apellido,
        documentoIdentidad: valores.dueno.documentoIdentidad,
        telefono: valores.dueno.telefono,
        correoElectronico: valores.dueno.correoElectronico,
        direccion: valores.dueno.direccion,
        contactoEmergencia: valores.dueno.contactoEmergencia
      },
      mascota: {
        nombre: valores.mascota.nombre,
        especie: valores.mascota.especie,
        raza: valores.mascota.raza,
        fechaNacimiento: new Date(valores.mascota.fechaNacimiento),
        sexo: valores.mascota.sexo,
        pesoKg: Number(valores.mascota.pesoKg),
        esterilizado: Boolean(valores.mascota.esterilizado),
        microchip: valores.mascota.microchip || undefined,
        alergias: [...this.listaAlergias],
        condicionesPreexistentes: [...this.listaCondiciones]
      }
    };

    this.guardarRegistro.emit(payload);
  }

  public emitirCancelacion(): void {
    this.cancelar.emit();
  }

  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      dueno: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        documentoIdentidad: ['', [Validators.required, ClinicaValidators.documentoIdentidad]],
        telefono: ['', [Validators.required, ClinicaValidators.telefono]],
        correoElectronico: ['', [Validators.required, Validators.email]],
        direccion: ['', [Validators.required, Validators.minLength(5)]],
        contactoEmergencia: ['']
      }),
      mascota: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        especie: ['CANINO', [Validators.required]],
        raza: ['Mestizo', [Validators.required]],
        fechaNacimiento: ['', [Validators.required, ClinicaValidators.fechaNacimientoNoFutura]],
        sexo: ['MACHO', [Validators.required]],
        pesoKg: [null, [Validators.required, ClinicaValidators.pesoPositivo]],
        esterilizado: [false],
        microchip: ['']
      })
    });
  }
}
