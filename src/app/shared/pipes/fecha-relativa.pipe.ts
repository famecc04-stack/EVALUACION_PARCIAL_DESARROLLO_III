import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaRelativa',
  standalone: false
})
export class FechaRelativaPipe implements PipeTransform {
  public transform(valor: Date | string | null | undefined): string {
    if (!valor) {
      return '-';
    }

    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) {
      return '-';
    }

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const fechaComparar = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

    const diferenciaDias = Math.round((fechaComparar.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const horaFormateada = `${horas}:${minutos}`;

    if (diferenciaDias === 0) {
      return `Hoy a las ${horaFormateada}`;
    }
    if (diferenciaDias === 1) {
      return `Mañana a las ${horaFormateada}`;
    }
    if (diferenciaDias === -1) {
      return `Ayer a las ${horaFormateada}`;
    }
    if (diferenciaDias > 1 && diferenciaDias <= 7) {
      return `En ${diferenciaDias} días (${horaFormateada})`;
    }

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio} ${horaFormateada}`;
  }
}
