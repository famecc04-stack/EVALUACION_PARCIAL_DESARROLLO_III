import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputValidador]',
  standalone: false
})
export class InputValidadorDirective {
  @Input() appInputValidador: boolean = true;

  constructor(
    private elemento: ElementRef,
    private renderer: Renderer2,
    private control: NgControl
  ) {}

  @HostListener('blur')
  public onBlur(): void {
    if (!this.appInputValidador || !this.control) {
      return;
    }

    const el = this.elemento.nativeElement;
    if (this.control.invalid && (this.control.dirty || this.control.touched)) {
      this.renderer.addClass(el, 'is-invalid');
      this.renderer.removeClass(el, 'is-valid');
    } else if (this.control.valid && (this.control.dirty || this.control.touched)) {
      this.renderer.removeClass(el, 'is-invalid');
      this.renderer.addClass(el, 'is-valid');
    }
  }

  @HostListener('input')
  public onInput(): void {
    if (!this.appInputValidador || !this.control) {
      return;
    }

    const el = this.elemento.nativeElement;
    if (this.control.valid) {
      this.renderer.removeClass(el, 'is-invalid');
    }
  }
}
