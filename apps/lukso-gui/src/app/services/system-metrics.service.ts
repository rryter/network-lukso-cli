import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemMetricsService {
  metrics$: Observable<any>;
  metricsOverTime$: Observable<any>;

  constructor(private httpClient: HttpClient) {
    const timer$ = timer(0, 3000);
    this.metrics$ = timer$.pipe(
      switchMap(() => {
        return httpClient.get(environment.API + '/system/metrics').pipe(
          catchError(() => {
            return of({});
          })
        );
      })
    );
    this.metricsOverTime$ = this.setMetricsOverTime$(timer$);
  }

  getMetrics$() {
    return this.metrics$;
  }

  getMetricsOverTime$() {
    return this.metricsOverTime$;
  }

  private setMetricsOverTime$(timer$: Observable<number>) {
    return timer$.pipe(
      switchMap(() => {
        return this.httpClient.get(environment.API + '/system/metrics').pipe(
          catchError(() => {
            return of({});
          })
        );
      })
    );
  }
}
