import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpertModeEnablerService {
  expertModeOn$: Subject<any>;

  constructor() {
    this.expertModeOn$ = new Subject();
  }

  set expertModeOn(value: boolean) {
    this.expertModeOn$.next(value);
    localStorage.setItem('expertModeOn', '' + value);
  }

  get expertModeOn(): boolean {
    const value: string | null = localStorage.getItem('expertModeOn');
    if (typeof value === 'string') {
      if (value === 'true') {
        return true;
      }
    }
    return false;
  }
}
