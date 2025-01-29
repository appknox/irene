import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type { AsyncBelongsTo } from '@ember-data/model';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type DevicefarmService from 'irene/services/devicefarm';

export interface VncViewerSignature {
  Args: {
    file: FileModel;
    dynamicScan: AsyncBelongsTo<DynamicscanModel> | null;
    profileId?: number;
    isAutomated?: boolean;
  };
  Blocks: {
    controls?: [];
  };
}

export default class VncViewerComponent extends Component<VncViewerSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare devicefarm: DevicefarmService;

  deviceFarmPassword = ENV.deviceFarmPassword;

  get deviceFarmURL() {
    const token = this.args.dynamicScan?.get('moriartyDynamicscanToken');

    if (token) {
      return this.devicefarm.getTokenizedWSURL(token);
    }

    return null;
  }

  get deviceUsed() {
    return this.args.dynamicScan?.get('deviceUsed');
  }

  get deviceType() {
    const platform = this.args.file.project.get('platform');

    if (platform === ENUMS.PLATFORM.ANDROID) {
      return 'nexus5';
    }

    if (platform === ENUMS.PLATFORM.IOS) {
      return this.isTablet ? 'ipad black' : 'iphone5s black';
    }

    return '';
  }

  get isAutomated() {
    return this.args.isAutomated;
  }

  get isTablet() {
    const isScanInProgress =
      this.args.dynamicScan?.get('isBooting') ||
      this.args.dynamicScan?.get('isInstalling') ||
      this.args.dynamicScan?.get('isLaunching') ||
      this.args.dynamicScan?.get('isHooking') ||
      this.args.dynamicScan?.get('isReadyOrRunning');

    return isScanInProgress && this.deviceUsed?.is_tablet;
  }

  get isIOSDevice() {
    const platform = this.args.file.project.get('platform');

    return platform === ENUMS.PLATFORM.IOS;
  }

  get dynamicScan() {
    return this.args.dynamicScan;
  }

  get startedBy() {
    return this.dynamicScan?.get('startedByUser')?.get('username');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    VncViewer: typeof VncViewerComponent;
  }
}
