import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { Settings } from '../../interfaces/settings';
import { NETWORKS } from '../../modules/launchpad/launchpad/helpers/create-keys';
import { SoftwareService } from '../../services/available-versions/available-versions.service';
import { PandoraMetricsService } from '../../services/pandora-metrics.service';
import { SystemMetricsService } from '../../services/system-metrics.service';
import { ValidatorMetricsService } from '../../services/validator-metrics.service';
import { VanguardService } from '../../services/vanguard-metrics.service';
import { DEFAULT_NETWORK } from '../../shared/config';
import { GlobalState, GLOBAL_RX_STATE } from '../../shared/rx-state';

interface StatusState {
  network: NETWORKS;
  settings: Settings;
  networkData: any;
  validatorMetrics: any;
  systemMetrics: {
    cpuSysload: number;
    memUsed: number;
  };
  pandoraMetrics: {
    lastBlock: number;
    peers: number;
  };
  isRunning: boolean;
  vanguardMetrics: {
    lastSlot: number;
    peers: number;
    validators: number;
    validatorsBalance: number;
  };
  pandoraPeersOverTime: { name: string; value: number }[];
  vanguardPeersOverTime: { name: string; value: number }[];
}

@Component({
  selector: 'lukso-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent extends RxState<StatusState> {
  readonly network$ = this.select('network');
  readonly settings$ = this.select('settings');
  readonly pandoraPeersOverTime$ = this.select('pandoraPeersOverTime');
  readonly pandoraMetrics$ = this.select('pandoraMetrics');
  readonly vanguardPeersOverTime$ = this.select('vanguardPeersOverTime');
  readonly vanguardMetrics$ = this.select('vanguardMetrics');
  readonly validatorMetrics$ = this.select('validatorMetrics');
  readonly networkData$ = this.select('networkData');
  readonly systemMetrics$ = this.select('systemMetrics');

  softwareService: SoftwareService;
  hasStopped = false;

  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,

    softwareService: SoftwareService,
    vanguardService: VanguardService,
    validatorService: ValidatorMetricsService,
    pandoraService: PandoraMetricsService,
    systemMetricsService: SystemMetricsService
  ) {
    super();

    this.connect('network', this.globalState.select('network'));
    this.connect('settings', this.globalState.select('settings'));

    this.connect('pandoraPeersOverTime', pandoraService.getPeersOverTime$());
    this.connect('pandoraMetrics', pandoraService.getMetrics$());
    this.connect('networkData', pandoraService.networkData$);

    this.connect('vanguardPeersOverTime', vanguardService.getPeersOverTime$());
    this.connect('vanguardMetrics', vanguardService.getMetrics$());
    this.connect('validatorMetrics', validatorService.getMetrics$());
    this.connect('systemMetrics', systemMetricsService.getMetrics$());

    this.softwareService = softwareService;
  }

  stopClients(clients: string[]) {
    this.softwareService.stopClients(clients).subscribe();
  }

  startClients(options: any) {
    this.softwareService
      .startClients(
        localStorage.getItem('network') || DEFAULT_NETWORK,
        options.settings,
        options.clients
      )
      .subscribe();
  }
}
