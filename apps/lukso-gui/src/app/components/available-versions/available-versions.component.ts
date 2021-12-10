import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DownloadInfo, Releases } from '../../interfaces/available-software';
import { DownloadedSoftware } from '../../interfaces/downloaded-software';
import { SoftwareService } from '../../services/available-versions/available-versions.service';

@Component({
  selector: 'lukso-available-versions',
  templateUrl: './available-versions.component.html',
  styleUrls: ['./available-versions.component.scss'],
})
export class AvailableVersionsComponent {
  readonly availableSoftware$: Observable<Releases[]>;

  downloadedSoftware$: Observable<DownloadedSoftware>;
  isDownloading = false;

  constructor(private softwareService: SoftwareService) {
    this.softwareService = softwareService;
    this.availableSoftware$ = softwareService.getAvailableVersions$();
    this.downloadedSoftware$ = softwareService.getDownloadedVersions$();
  }

  install(client: string, release: DownloadInfo) {
    release.isDownloading = true;
    this.softwareService
      .downloadClient(client, release.tag, release.downloadUrl)
      .subscribe(() => {
        release.isDownloading = false;
      });
  }
}
