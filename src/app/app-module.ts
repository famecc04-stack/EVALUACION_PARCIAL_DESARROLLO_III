import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { App } from './app';

// Registra el idioma español (Perú) para que los pipes de Angular (date, currency, etc.)
// muestren meses y días en español: "noviembre 2026", "domingo, 1 de noviembre de 2026".
registerLocaleData(localeEsPe, 'es-PE');

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' }
  ],
  bootstrap: [App]
})
export class AppModule {}
