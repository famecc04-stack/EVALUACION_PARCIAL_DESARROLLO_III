import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FechaUtils } from '../utils/fecha.utils';

export class ClinicaValidators {
  public static documentoIdentidad(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const patron = /^[0-9]{8}$/;
    return patron.test(control.value.toString().trim())
      ? null
      : { dniInvalido: { valorActual: control.value, mensaje: 'El DNI debe contener exactamente 8 dígitos numéricos' } };
  }

  public static telefono(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const patron = /^9[0-9]{8}$/;
    return patron.test(control.value.toString().trim())
      ? null
      : { telefonoInvalido: { valorActual: control.value, mensaje: 'El teléfono debe iniciar con 9 y tener 9 dígitos' } };
  }

  public static fechaFutura(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const fechaSeleccionada = new Date(control.value);
    const ahora = new Date();
    return fechaSeleccionada.getTime() > ahora.getTime()
      ? null
      : { fechaPasada: { mensaje: 'La fecha y hora de la cita debe ser posterior al momento actual' } };
  }

  /**
   * Para <input type="date"> (valor 'YYYY-MM-DD'): rechaza fechas anteriores a hoy y domingos.
   * Se interpreta en hora local para evitar el desfase de un día por zona horaria.
   */
  public static fechaCitaValida(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const fecha = FechaUtils.parsearFechaLocal(control.value);
    if (isNaN(fecha.getTime())) {
      return { fechaInvalida: { mensaje: 'Fecha no válida' } };
    }
    if (fecha < FechaUtils.inicioDelDia()) {
      return { fechaPasada: { mensaje: 'No se pueden agendar citas en fechas pasadas' } };
    }
    if (FechaUtils.esDomingo(fecha)) {
      return { diaNoLaborable: { mensaje: 'La clínica no atiende los domingos' } };
    }
    return null;
  }

  public static horarioLaboral(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const fecha = new Date(control.value);
    const hora = fecha.getHours();
    const dia = fecha.getDay();

    if (dia === 0) {
      return { diaNoLaborable: { mensaje: 'La clínica no atiende los días domingos' } };
    }
    if (hora < 8 || hora >= 19) {
      return { horarioInvalido: { mensaje: 'El horario de atención es de 08:00 a 19:00' } };
    }
    return null;
  }

  public static pesoPositivo(control: AbstractControl): ValidationErrors | null {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    const valor = Number(control.value);
    return !isNaN(valor) && valor > 0
      ? null
      : { pesoInvalido: { mensaje: 'El peso debe ser un número mayor a 0 kg' } };
  }

  public static fechaNacimientoNoFutura(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const fecha = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return fecha <= hoy
      ? null
      : { fechaNacimientoInvalida: { mensaje: 'La fecha de nacimiento no puede ser una fecha futura' } };
  }
}
