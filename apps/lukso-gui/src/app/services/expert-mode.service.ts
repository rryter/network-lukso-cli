import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpertModeService {
  expertMode$: BehaviorSubject<boolean>;

  constructor() {
    this.expertMode$ = new BehaviorSubject(
      this.getExpertModeFromLocalStorage()
    );
  }

  setExpertMode(value: boolean) {
    this.expertMode$.next(value);
    localStorage.setItem('expertModeOn', '' + value);
  }

  private getExpertModeFromLocalStorage(): boolean {
    const value: string | null = localStorage.getItem('expertModeOn');
    if (typeof value === 'string') {
      if (value === 'true') {
        return true;
      }
    }
    return false;
  }
}
