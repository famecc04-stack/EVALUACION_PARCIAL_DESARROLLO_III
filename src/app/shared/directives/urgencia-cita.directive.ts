import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { PrioridadCita } from '../../models/cita.model';

@Directive({
  selector: '[appUrgenciaCita]',
  standalone: false
})
export class UrgenciaCitaDirective implements OnInit, OnChanges {
  @Input('appUrgenciaCita') prioridad: PrioridadCita = 'MEDIA';
  @Input() fechaCita?: Date | string;

  constructor(
    private elemento: ElementRef,
    private renderer: Renderer2
  ) {}

  public ngOnInit(): void {
    this.aplicarEstilos();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['prioridad'] || changes['fechaCita']) {
      this.aplicarEstilos();
    }
  }

  private aplicarEstilos(): void {
    const el = this.elemento.nativeElement;

    this.renderer.removeClass(el, 'border-danger');
    this.renderer.removeClass(el, 'border-warning');
    this.renderer.removeClass(el, 'border-info');
    this.renderer.removeClass(el, 'border-success');
    this.renderer.removeClass(el, 'bg-danger-subtle');
    this.renderer.removeClass(el, 'shadow-urgent');

    const estaProximaEn24h = this.verificarProximidad24Horas();

    if (this.prioridad === 'URGENCIA') {
      this.renderer.addClass(el, 'border-danger');
      this.renderer.addClass(el, 'bg-danger-subtle');
      this.renderer.addClass(el, 'shadow-urgent');
      this.renderer.setStyle(el, 'border-left-width', '6px');
      this.renderer.setStyle(el, 'border-left-color', '#dc3545');
      return;
    }

    if (this.prioridad === 'ALTA' || estaProximaEn24h) {
      this.renderer.addClass(el, 'border-warning');
      this.renderer.setStyle(el, 'border-left-width', '6px');
      this.renderer.setStyle(el, 'border-left-color', '#ffc107');
      return;
    }

    if (this.prioridad === 'MEDIA') {
      this.renderer.setStyle(el, 'border-left-width', '6px');
      this.renderer.setStyle(el, 'border-left-color', '#0dcaf0');
      return;
    }

    this.renderer.setStyle(el, 'border-left-width', '6px');
    this.renderer.setStyle(el, 'border-left-color', '#198754');
  }

  private verificarProximidad24Horas(): boolean {
    if (!this.fechaCita) {
      return false;
    }
    const ahora = new Date().getTime();
    const fecha = new Date(this.fechaCita).getTime();
    const diferenciaMs = fecha - ahora;
    return diferenciaMs > 0 && diferenciaMs <= 24 * 60 * 60 * 1000;
  }
}
