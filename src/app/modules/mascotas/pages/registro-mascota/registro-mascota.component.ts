import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MascotasService } from '../../../../core/services/mascotas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IDueno, Dueno } from '../../../../models/dueno.model';
import { IDatosRegistroMascotaDueno } from '../../components/formulario-mascota/formulario-mascota.component';

@Component({
  selector: 'app-registro-mascota',
  templateUrl: './registro-mascota.component.html',
  styleUrls: ['./registro-mascota.component.scss'],
  standalone: false
})
export class RegistroMascotaComponent implements OnInit {
  public duenosExistentes: Dueno[] = [];
  public enviando: boolean = false;

  constructor(
    private mascotasService: MascotasService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.cargarDuenos();
  }

  public procesarGuardado(datos: IDatosRegistroMascotaDueno): void {
    this.enviando = true;

    this.mascotasService.registrarMascotaConDueno(datos.dueno, datos.mascota).subscribe({
      next: ({ dueno, mascota }) => {
        this.enviando = false;
        this.notificationService.mostrarExito(
          `¡Mascota ${mascota.nombre} y propietario ${dueno.nombreCompleto} registrados correctamente!`
        );
        // Recepción no accede al historial clínico: tras registrar vuelve a la agenda para agendar la cita.
        if (this.authService.tienePermiso('HISTORIAL_VER')) {
          this.router.navigate(['/mascotas/historial'], { queryParams: { mascotaId: mascota.id } });
        } else {
          this.router.navigate(['/citas']);
        }
      },
      error: () => {
        this.enviando = false;
        this.notificationService.mostrarError('Error al registrar la información del paciente.');
      }
    });
  }

  public cancelar(): void {
    this.router.navigate(['/citas']);
  }

  private cargarDuenos(): void {
    this.mascotasService.obtenerDuenos().subscribe({
      next: (duenos) => {
        this.duenosExistentes = duenos;
      }
    });
  }
}
