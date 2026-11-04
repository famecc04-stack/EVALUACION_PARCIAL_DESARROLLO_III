import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private memoria: Map<string, string> = new Map<string, string>();

  public guardar<T>(clave: string, valor: T): void {
    const serializado = JSON.stringify(valor);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(clave, serializado);
        return;
      }
    } catch {
      this.memoria.set(clave, serializado);
      return;
    }
    this.memoria.set(clave, serializado);
  }

  public obtener<T>(clave: string): T | null {
    let serializado: string | null = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        serializado = localStorage.getItem(clave);
      }
    } catch {
      serializado = this.memoria.get(clave) || null;
    }

    if (!serializado && this.memoria.has(clave)) {
      serializado = this.memoria.get(clave) || null;
    }

    if (!serializado) {
      return null;
    }

    try {
      return JSON.parse(serializado) as T;
    } catch {
      return null;
    }
  }

  public eliminar(clave: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(clave);
      }
    } catch {
      this.memoria.delete(clave);
    }
    this.memoria.delete(clave);
  }
}
