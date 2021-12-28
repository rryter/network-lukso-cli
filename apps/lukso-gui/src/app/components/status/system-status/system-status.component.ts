import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'lukso-system-status',
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.scss'],
})
export class SystemStatusComponent implements OnChanges {
  @Input() metricsData: { cpuSysload: number; memUsed: number } | null = null;

  now: number = Date.now();
  ngOnChanges(): void {
    this.now = Date.now();
  }
}
