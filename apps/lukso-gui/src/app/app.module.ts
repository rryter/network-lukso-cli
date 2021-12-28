import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RxState } from '@rx-angular/state';
import {
  LetModule,
  PushModule,
  ViewportPrioModule,
} from '@rx-angular/template';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TimeagoModule } from 'ngx-timeago';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  AvailableVersionsComponent,
  NetworkStatusComponent,
  OrchestratorStatusComponent,
  SettingsComponent,
  SetupComponent,
  StatusBoxComponent,
  StatusComponent,
  SystemStatusComponent,
  ValidatorStatusComponent,
} from './components';
import { SharedModule } from './modules/shared/shared.module';
import { GlobalState, GLOBAL_RX_STATE } from './shared/rx-state';

@NgModule({
  declarations: [
    AppComponent,
    AvailableVersionsComponent,
    StatusComponent,
    OrchestratorStatusComponent,
    ValidatorStatusComponent,
    SettingsComponent,
    NetworkStatusComponent,
    StatusBoxComponent,
    SetupComponent,
    SystemStatusComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    TimeagoModule.forRoot(),
    LetModule,
    PushModule,
    ViewportPrioModule,
    SharedModule,
  ],
  providers: [
    {
      provide: GLOBAL_RX_STATE,
      useFactory: () => new RxState<GlobalState>(),
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
