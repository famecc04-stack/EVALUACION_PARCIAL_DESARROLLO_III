import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MascotasService } from '../../../../core/services/mascotas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Mascota } from '../../../../models/mascota.model';
import { Dueno } from '../../../../models/dueno.model';
import { IHistorialMedico, TipoRegistroHistorial } from '../../../../models/historial.model';

@Component({
  selector: 'app-historial-mascotas',
  templateUrl: './historial-mascotas.component.html',
  styleUrls: ['./historial-mascotas.component.scss'],
  standalone: false
})
export class HistorialMascotasComponent implements OnInit {
  public mascotas: Mascota[] = [];
  public duenos: Dueno[] = [];
  public mascotaSeleccionada?: Mascota;
  public duenoSeleccionado?: Dueno;
  public registrosHistorial: IHistorialMedico[] = [];
  public terminoBusqueda: string = '';

  public modalNuevaAtencionAbierto: boolean = false;
  public nuevoTipoRegistro: TipoRegistroHistorial = 'CONSULTA';
  public nuevoDiagnostico: string = '';
  public nuevaAnamnesis: string = '';
  public nuevaTemperatura: number = 38.5;
  public nuevaFrecuenciaC: number = 100;
  public nuevaFrecuenciaR: number = 22;
  public nuevoPeso: number = 0;
  public nuevoMedicamento: string = '';
  public nuevaDosisMg: number = 0;
  public nuevasObservaciones: string = '';

  constructor(
    private mascotasService: MascotasService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  /** Solo el médico veterinario registra atenciones; el administrador consulta en modo lectura. */
  public get puedeRegistrarAtencion(): boolean {
    return this.authService.tienePermiso('HISTORIAL_REGISTRAR');
  }

  public ngOnInit(): void {
    this.cargarDatos();
  }

  public get mascotasFiltradas(): Mascota[] {
    if (!this.terminoBusqueda.trim()) {
      return this.mascotas;
    }
    const termino = this.terminoBusqueda.toLowerCase().trim();
    return this.mascotas.filter(m =>
      m.nombre.toLowerCase().includes(termino) ||
      m.raza.toLowerCase().includes(termino) ||
      m.especie.toLowerCase().includes(termino)
    );
  }

  public seleccionarMascota(mascotaId: string): void {
    const encontrada = this.mascotas.find(m => m.id === mascotaId);
    if (!encontrada) {
      return;
    }

    this.mascotaSeleccionada = encontrada;
    this.duenoSeleccionado = this.duenos.find(d => d.id === encontrada.duenoId);
    this.nuevoPeso = encontrada.pesoKg;
    this.cargarHistorial(mascotaId);
  }

  public abrirModalNuevaAtencion(): void {
    if (!this.puedeRegistrarAtencion) {
      return;
    }
    if (!this.mascotaSeleccionada) {
      this.notificationService.mostrarAdvertencia('Por favor seleccione una mascota primero.');
      return;
    }
    this.nuevoPeso = this.mascotaSeleccionada.pesoKg;
    this.calcularDosisSugerida();
    this.modalNuevaAtencionAbierto = true;
  }

  public cerrarModalNuevaAtencion(): void {
    this.modalNuevaAtencionAbierto = false;
  }

  public calcularDosisSugerida(): void {
    if (this.mascotaSeleccionada) {
      this.nuevaDosisMg = this.mascotaSeleccionada.calcularDosisMedicamento(10);
    }
  }

  public guardarNuevaAtencion(): void {
    if (!this.mascotaSeleccionada || !this.puedeRegistrarAtencion) {
      return;
    }
    if (!this.nuevoDiagnostico.trim() || !this.nuevaAnamnesis.trim()) {
      this.notificationService.mostrarAdvertencia('Diagnóstico y anamnesis son obligatorios.');
      return;
    }

    const nuevaEntrada: IHistorialMedico = {
      id: 'HIS-' + Date.now(),
      mascotaId: this.mascotaSeleccionada.id,
      fechaAtencion: new Date(),
      veterinarioNombre: this.authService.usuarioActual?.nombre ?? 'Médico Veterinario',
      tipoRegistro: this.nuevoTipoRegistro,
      anamnesis: this.nuevaAnamnesis.trim(),
      diagnostico: this.nuevoDiagnostico.trim(),
      examenFisico: {
        temperaturaCorporal: Number(this.nuevaTemperatura),
        frecuenciaCardiaca: Number(this.nuevaFrecuenciaC),
        frecuenciaRespiratoria: Number(this.nuevaFrecuenciaR),
        pesoKg: Number(this.nuevoPeso) || this.mascotaSeleccionada.pesoKg
      },
      tratamientos: this.nuevoMedicamento.trim() ? [
        {
          medicamento: this.nuevoMedicamento.trim(),
          dosisMg: Number(this.nuevaDosisMg) || 0,
          frecuenciaHoras: 12,
          duracionDias: 5,
          instrucciones: 'Administrar según indicación médica.'
        }
      ] : [],
      vacunasAplicadas: [],
      observaciones: this.nuevasObservaciones.trim() || 'Control evolutivo programado.',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    this.mascotasService.agregarRegistroHistorial(nuevaEntrada).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Nueva atención clínica añadida al historial.');
        this.modalNuevaAtencionAbierto = false;
        this.limpiarFormularioNuevaAtencion();
        this.cargarHistorial(this.mascotaSeleccionada!.id);
      }
    });
  }

  private cargarDatos(): void {
    this.mascotasService.obtenerDuenos().subscribe(duenos => {
      this.duenos = duenos;
      this.mascotasService.obtenerMascotas().subscribe(mascotas => {
        this.mascotas = mascotas;

        const paramId = this.route.snapshot.queryParamMap.get('mascotaId');
        if (paramId && this.mascotas.some(m => m.id === paramId)) {
          this.seleccionarMascota(paramId);
        } else if (this.mascotas.length > 0) {
          this.seleccionarMascota(this.mascotas[0].id);
        }
      });
    });
  }

  private cargarHistorial(mascotaId: string): void {
    this.mascotasService.obtenerHistorialPorMascota(mascotaId).subscribe(hist => {
      this.registrosHistorial = hist;
    });
  }

  private limpiarFormularioNuevaAtencion(): void {
    this.nuevoDiagnostico = '';
    this.nuevaAnamnesis = '';
    this.nuevoMedicamento = '';
    this.nuevasObservaciones = '';
  }
}
