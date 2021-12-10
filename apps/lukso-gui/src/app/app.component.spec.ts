import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RxState } from '@rx-angular/state';
import { PushPipe } from '@rx-angular/template';
import { AppComponent } from './app.component';
import { GLOBAL_RX_STATE } from './shared/rx-state';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, PushPipe],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: GLOBAL_RX_STATE, useClass: RxState }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
