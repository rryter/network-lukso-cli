import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { Subject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { DownloadedSoftware } from '../../interfaces/downloaded-software';
import { Settings } from '../../interfaces/settings';
import { NETWORKS } from '../../modules/launchpad/launchpad/helpers/create-keys';
import { SoftwareService } from '../../services/available-versions/available-versions.service';
import { ExpertModeService } from '../../services/expert-mode.service';
import { ValidatorService } from '../../services/validator.service';
import { coinbaseValidator } from '../../shared/eth-address-validator';
import { GlobalState, GLOBAL_RX_STATE } from '../../shared/rx-state';

interface SettingsState {
  network: NETWORKS;
  settings: Settings;
  isSaving: boolean;
  isResettingValidator: boolean;
  downloadedVersions: DownloadedSoftware;
  expertMode: boolean;
}

@Component({
  selector: 'lukso-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent
  extends RxState<SettingsState>
  implements OnInit
{
  readonly expertMode$ = this.select('expertMode');
  readonly network$ = this.select('network');
  readonly settings$ = this.select('settings');
  readonly downloadedVersions$ = this.select('downloadedVersions');
  readonly isSaving$ = this.select('isSaving');
  readonly isResettingValidator$ = this.select('isResettingValidator');

  resetValidator$ = new Subject<NETWORKS>();
  saveSettings$ = new Subject<{ network: NETWORKS; settings: Settings }>();

  settingsForm: FormGroup;
  defaultTag = 'v0.1.0-develop';

  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private fb: FormBuilder,
    private expertModeService: ExpertModeService,
    private softwareService: SoftwareService,
    private validatorService: ValidatorService
  ) {
    super();

    this.settingsForm = this.initForm(fb);
    this.connect('expertMode', expertModeService.expertMode$);
    this.connect('network', this.globalState.select('network'));
    this.connect('settings', this.globalState.select('settings'));
    this.connect(
      'downloadedVersions',
      softwareService.getDownloadedVersions$()
    );

    this.connect(this.resetValidator$, () => ({ isResettingValidator: true }));
    this.connect(this.saveSettings$, () => ({ isSaving: true }));

    this.hold(this.saveSettings$, (values) =>
      softwareService
        .setSettings(values.network, values.settings)
        .pipe(
          delay(1000),
          tap(() => {
            this.set({ isSaving: false });
          })
        )
        .subscribe()
    );

    this.hold(this.resetValidator$, (network) =>
      validatorService
        .resetValidator(network)
        .pipe(delay(1000))
        .subscribe(() => {
          this.set({ isResettingValidator: false });
        })
    );
  }

  ngOnInit(): void {
    this.select('settings').subscribe((settings) => {
      this.settingsForm.patchValue(settings);
    });
  }

  // TODO: check best practices, this certainly isn't it
  get hostName() {
    return this.settingsForm.get('hostName') as FormControl;
  }
  get coinbase() {
    return this.settingsForm.get('coinbase') as FormControl;
  }
  get isValidatorEnabled() {
    return this.settingsForm.get('isValidatorEnabled') as FormControl;
  }
  get vanguard() {
    const versions = this.settingsForm.get('versions') as FormGroup;
    return versions.get('vanguard') as FormControl;
  }
  get pandora() {
    const versions = this.settingsForm.get('versions') as FormGroup;
    return versions.get('pandora') as FormControl;
  }
  get orchestrator() {
    const versions = this.settingsForm.get('versions') as FormGroup;
    return versions.get('orchestrator') as FormControl;
  }
  get validator() {
    const versions = this.settingsForm.get('versions') as FormGroup;
    return versions.get('validator') as FormControl;
  }

  private initForm(fb: FormBuilder) {
    return fb.group({
      hostName: ['', [Validators.required]],
      externalIp: [''],
      isValidatorEnabled: [0, [Validators.required]],
      versions: fb.group({
        vanguard: [this.defaultTag],
        pandora: [this.defaultTag],
        orchestrator: [this.defaultTag],
        validator: [this.defaultTag],
      }),
      coinbase: [
        '',
        [Validators.required, coinbaseValidator(/^0x[a-fA-F0-9]{40}$/i)],
      ],
    });
  }
}
