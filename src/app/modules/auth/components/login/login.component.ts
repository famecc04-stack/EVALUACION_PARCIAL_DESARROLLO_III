import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DESCRIPCION_ROL } from '../../../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  public formularioLogin!: FormGroup;
  public cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.construirFormulario();
  }

  public iniciarSesion(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const credenciales = this.formularioLogin.value;

    this.authService.iniciarSesion(credenciales).subscribe({
      next: (sesion) => {
        this.cargando = false;
        this.notificationService.mostrarExito(`Bienvenido(a), ${sesion.nombre} (${DESCRIPCION_ROL[sesion.rol]}).`);
        this.router.navigate(['/citas']);
      },
      error: (err: Error) => {
        this.cargando = false;
        this.notificationService.mostrarError(err.message || 'Error al autenticar credenciales.');
      }
    });
  }

  public seleccionarRolDemo(correo: string): void {
    this.formularioLogin.patchValue({
      correo: correo,
      password: 'DemoPassword123*'
    });
  }

  private construirFormulario(): void {
    this.formularioLogin = this.fb.group({
      correo: ['amorales@veterinaria.com', [Validators.required, Validators.email]],
      password: ['DemoPassword123*', [Validators.required, Validators.minLength(6)]]
    });
  }
}
