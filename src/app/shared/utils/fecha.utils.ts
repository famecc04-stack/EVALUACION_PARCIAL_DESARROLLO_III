/**
 * Utilidades de fecha en HORA LOCAL.
 *
 * Importante: `new Date('2026-11-05')` interpreta el texto como medianoche UTC.
 * En Lima (UTC-5) eso equivale al 04/11/2026 a las 19:00, por eso antes las citas
 * se guardaban un día antes. Estas funciones construyen la fecha con sus partes
 * (año, mes, día) para que siempre se respete la zona horaria del usuario.
 */
export class FechaUtils {
  /** 'YYYY-MM-DD' -> Date a las 00:00 hora local. */
  public static parsearFechaLocal(fechaIso: string): Date {
    const [anio, mes, dia] = fechaIso.split('-').map(Number);
    return new Date(anio, mes - 1, dia, 0, 0, 0, 0);
  }

  /** 'YYYY-MM-DD' + 'HH:mm' -> Date local. */
  public static combinarFechaHora(fechaIso: string, hora: string): Date {
    const fecha = FechaUtils.parsearFechaLocal(fechaIso);
    const [horas, minutos] = hora.split(':').map(Number);
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  /** Date -> 'YYYY-MM-DD' (hora local), formato que usa <input type="date">. */
  public static aFechaIso(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  /** Date -> 'HH:mm'. */
  public static aHora(fecha: Date): string {
    return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
  }

  public static mismoDia(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  public static inicioDelDia(fecha: Date = new Date()): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  public static esDomingo(fecha: Date): boolean {
    return fecha.getDay() === 0;
  }

  /** Devuelve la misma fecha si es hábil (lun-sáb) y no pasada; si no, el siguiente día hábil. */
  public static siguienteDiaHabil(desde: Date): Date {
    const hoy = FechaUtils.inicioDelDia();
    let fecha = FechaUtils.inicioDelDia(desde);
    if (fecha < hoy) {
      fecha = hoy;
    }
    while (FechaUtils.esDomingo(fecha)) {
      fecha.setDate(fecha.getDate() + 1);
    }
    return fecha;
  }
}
