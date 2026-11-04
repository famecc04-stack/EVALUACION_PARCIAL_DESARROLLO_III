import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Mascota } from '../../../../models/mascota.model';
import { Dueno } from '../../../../models/dueno.model';
import { Veterinario } from '../../../../models/veterinario.model';
import { ICita, MotivoConsulta, PrioridadCita } from '../../../../models/cita.model';
import { ClinicaValidators } from '../../../../shared/validators/clinica-validators';
import { FechaUtils } from '../../../../shared/utils/fecha.utils';

/** Datos que el formulario necesita para que el contenedor calcule los turnos libres. */
export interface ICriterioDisponibilidad {
  fecha: Date;
  veterinarioId: string;
  duracionMinutos: number;
}

@Component({
  selector: 'app-formulario-cita',
  templateUrl: './formulario-cita.component.html',
  styleUrls: ['./formulario-cita.component.scss'],
  standalone: false
})
export class FormularioCitaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mascotas: Mascota[] = [];
  @Input() duenos: Dueno[] = [];
  @Input() veterinarios: Veterinario[] = [];
  @Input() fechaSugerida: Date = new Date();
  /** Turnos libres calculados por el contenedor (AgendaCitasComponent) según veterinario y fecha. */
  @Input() horariosDisponibles: string[] = [];
  /** Mensaje de error de negocio devuelto por el servicio (p. ej. cruce de horarios). */
  @Input() errorServidor: string | null = null;

  @Output() guardarCita = new EventEmitter<Partial<ICita>>();
  @Output() cancelar = new EventEmitter<void>();
  /** Se emite cada vez que cambia fecha, hora, veterinario o duración, para recalcular turnos. */
  @Output() consultarDisponibilidad = new EventEmitter<ICriterioDisponibilidad>();

  public formularioCita!: FormGroup;
  public fechaMinima: string = FechaUtils.aFechaIso(new Date());
  public motivosDisponibles: MotivoConsulta[] = [
    'CONTROL_RUTINA',
    'VACUNACION',
    'DESPARASITACION',
    'CIRUGIA',
    'URGENCIA_MEDICA',
    'DERMATOLOGIA',
    'ODONTOLOGIA'
  ];
  public prioridadesDisponibles: PrioridadCita[] = ['BAJA', 'MEDIA', 'ALTA', 'URGENCIA'];

  private suscripciones = new Subscription();

  constructor(private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.construirFormulario();
    ['fecha', 'hora', 'veterinarioId', 'duracionMinutos'].forEach(campo =>
      this.suscripciones.add(
        this.formularioCita.get(campo)!.valueChanges.subscribe(() => this.solicitarDisponibilidad())
      )
    );
    this.solicitarDisponibilidad();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Cuando llegan nuevos turnos, si la hora elegida ya no está libre se limpia la selección.
    if (changes['horariosDisponibles'] && this.formularioCita) {
      const horaActual = this.formularioCita.get('hora')!.value;
      if (!this.horariosDisponibles.includes(horaActual)) {
        this.formularioCita.get('hora')!.setValue(this.horariosDisponibles[0] ?? '', { emitEvent: false });
      }
    }
  }

  public ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  public get fechaControl() {
    return this.formularioCita.get('fecha')!;
  }

  public get sinHorarios(): boolean {
    return this.fechaControl.valid && !!this.formularioCita.get('veterinarioId')!.value &&
           this.horariosDisponibles.length === 0;
  }

  public onCambioMascota(mascotaId: string): void {
    const mascota = this.mascotas.find(m => m.id === mascotaId);
    if (mascota) {
      const dueno = this.duenos.find(d => d.id === mascota.duenoId);
      this.formularioCita.patchValue({
        duenoId: mascota.duenoId,
        duenoNombre: dueno ? dueno.nombreCompleto : 'Propietario Registrado',
        mascotaNombre: mascota.nombre
      });
    }
  }

  public emitirGuardado(): void {
    if (this.formularioCita.invalid) {
      this.formularioCita.markAllAsTouched();
      return;
    }

    const valor = this.formularioCita.value;
    // Se construye la fecha en hora local (evita que la cita se guarde un día antes).
    const fechaCompleta = FechaUtils.combinarFechaHora(valor.fecha, valor.hora);
    const veterinario = this.veterinarios.find(v => v.id === valor.veterinarioId);

    const payload: Partial<ICita> = {
      mascotaId: valor.mascotaId,
      mascotaNombre: valor.mascotaNombre,
      duenoId: valor.duenoId,
      duenoNombre: valor.duenoNombre,
      veterinarioId: valor.veterinarioId,
      veterinarioNombre: veterinario?.nombreProfesional,
      fechaHora: fechaCompleta,
      motivo: valor.motivo,
      descripcionSintomas: valor.descripcionSintomas,
      prioridad: valor.prioridad,
      costoEstimado: Number(valor.costoEstimado) || 50,
      duracionMinutos: Number(valor.duracionMinutos) || 30
    };

    this.guardarCita.emit(payload);
  }

  public emitirCancelacion(): void {
    this.cancelar.emit();
  }

  private solicitarDisponibilidad(): void {
    const { fecha, veterinarioId, duracionMinutos } = this.formularioCita.getRawValue();
    if (!fecha || this.fechaControl.invalid) {
      this.consultarDisponibilidad.emit({ fecha: new Date(NaN), veterinarioId: '', duracionMinutos: 30 });
      return;
    }
    this.consultarDisponibilidad.emit({
      fecha: FechaUtils.parsearFechaLocal(fecha),
      veterinarioId,
      duracionMinutos: Number(duracionMinutos) || 30
    });
  }

  private construirFormulario(): void {
    // Si el día seleccionado en el calendario ya pasó o es domingo, se sugiere el siguiente día hábil.
    const fechaInicial = FechaUtils.aFechaIso(FechaUtils.siguienteDiaHabil(this.fechaSugerida));

    this.formularioCita = this.fb.group({
      mascotaId: ['', [Validators.required]],
      mascotaNombre: [''],
      duenoId: [''],
      duenoNombre: [''],
      veterinarioId: [this.veterinarios[0]?.id ?? '', [Validators.required]],
      fecha: [fechaInicial, [Validators.required, ClinicaValidators.fechaCitaValida]],
      hora: ['', [Validators.required]],
      motivo: ['CONTROL_RUTINA', [Validators.required]],
      prioridad: ['MEDIA', [Validators.required]],
      descripcionSintomas: ['', [Validators.required, Validators.minLength(5)]],
      costoEstimado: [60, [Validators.required, Validators.min(0)]],
      duracionMinutos: [30, [Validators.required, Validators.min(15)]]
    });

    if (this.mascotas.length > 0) {
      this.formularioCita.patchValue({ mascotaId: this.mascotas[0].id });
      this.onCambioMascota(this.mascotas[0].id);
    }
  }
}
