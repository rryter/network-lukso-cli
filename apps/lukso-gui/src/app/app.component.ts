import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { Settings } from './interfaces/settings';
import { NETWORKS } from './modules/launchpad/launchpad/helpers/create-keys';
import { SoftwareService } from './services/available-versions/available-versions.service';
import { GlobalState, GLOBAL_RX_STATE } from './shared/rx-state';
import { HotkeysService } from './services/hotkey.service';
import { ExpertModeService } from './services/expert-mode.service';

@Component({
  selector: 'lukso-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  NETWORKS = NETWORKS;
  readonly expertMode$ = this.state.select('expertModeEnabled');

  form: FormGroup = new FormGroup({
    network: new FormControl(NETWORKS.L15_DEV, [Validators.required]),
  });

  constructor(
    @Inject(GLOBAL_RX_STATE) private state: RxState<GlobalState>,
    private http: HttpClient,
    private softwareService: SoftwareService,
    private hotkeysService: HotkeysService,
    private expertModeService: ExpertModeService
  ) {
    this.softwareService = softwareService;
    this.expertModeService = expertModeService;

    this.state.connect('expertModeEnabled', expertModeService.expertMode$);

    this.state.connect(
      'network',
      this.networkFormCtrl.valueChanges.pipe(
        startWith(this.networkFormCtrl.value)
      )
    );
    this.state.connect(
      'settings',
      this.state
        .select('network')
        .pipe(switchMap((network) => this.softwareService.getSettings(network)))
    );

    this.hotkeysService
      .addShortcut({ keys: 'shift.meta.e' })
      .pipe(withLatestFrom(this.state.select('expertModeEnabled')))
      .subscribe(([, expertModeEnabled]) => {
        this.expertModeService.setExpertMode(!expertModeEnabled);
      });
  }

  startClients(network: string) {
    this.softwareService
      .getSettings(network)
      .pipe(
        switchMap((settings: Settings) => {
          const clients = ['pandora', 'vanguard', 'orchestrator', 'validator'];
          return this.softwareService.startClients(network, settings, clients);
        })
      )
      .subscribe();
  }

  stopClients() {
    this.softwareService
      .stopClients(['pandora', 'vanguard', 'orchestrator', 'validator'])
      .subscribe();
  }

  get networkFormCtrl() {
    return this.form.get('network') as FormControl;
  }
}
