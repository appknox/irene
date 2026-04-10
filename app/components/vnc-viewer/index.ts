import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type DevicefarmService from 'irene/services/devicefarm';
import type CyodAdbSessionService from 'irene/services/cyod-adb-session';

const VNC_MODE_NONE = ENUMS.DEVICE_VNC_MODE?.NONE ?? 0;
const VNC_MODE_SCRCPY = ENUMS.DEVICE_VNC_MODE?.SCRCPY ?? 2;
const REGISTRATION_SOURCE_WEBUSB = 2;

export interface VncViewerSignature {
  Args: {
    file: FileModel;
    dynamicScan: DynamicscanModel | null;
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
  @service('cyod-adb-session') declare cyodAdbSession: CyodAdbSessionService;
  @service('notifications') declare notify: NotificationService;

  @tracked webusbInstallStage: string | null = null;
  @tracked webusbInstallPercent = 0;

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

  // CYOD / BYOD — no VNC, user interacts on their own device
  get isByodScan() {
    const deviceUsed = this.args.dynamicScan?.get('deviceUsed');

    return (
      deviceUsed?.vnc_mode === VNC_MODE_NONE ||
      !!deviceUsed?.ios_itms_url ||
      !!deviceUsed?.android_download_url
    );
  }

  get byodDownloadUrl() {
    const deviceUsed = this.args.dynamicScan?.get('deviceUsed');

    return deviceUsed?.android_download_url ?? deviceUsed?.ios_itms_url ?? null;
  }

  get byodIsIos() {
    const deviceUsed = this.args.dynamicScan?.get('deviceUsed');

    return !!deviceUsed?.ios_itms_url;
  }

  // WebUSB CYOD — user registered their device via WebUSB; auto-install in browser
  get isWebusbCyod() {
    const deviceUsed = this.args.dynamicScan?.get('deviceUsed');

    return (
      !!deviceUsed?.android_download_url &&
      deviceUsed?.registration_source === REGISTRATION_SOURCE_WEBUSB &&
      !!deviceUsed?.device_identifier
    );
  }

  get webusbAdb() {
    const identifier = this.args.dynamicScan
      ?.get('deviceUsed')
      ?.device_identifier;
    return identifier ? this.cyodAdbSession.get(identifier) : null;
  }

  get webusbInstallIsRunning() {
    return this.autoInstallViaWebUsb.isRunning;
  }

  autoInstallViaWebUsb = task(async () => {
    const adb = this.webusbAdb;
    const downloadUrl = this.byodDownloadUrl;
    const packageName = this.args.dynamicScan?.get('packageName');

    if (!adb || !downloadUrl || !packageName) {
      return;
    }

    try {
      const { installApkViaWebUsb } = await import(
        'irene/utils/webusb-adb-install'
      );

      await installApkViaWebUsb(adb, downloadUrl, packageName, {
        onProgress: (progress) => {
          this.webusbInstallStage = progress.stage;
          if ('percent' in progress) {
            this.webusbInstallPercent = progress.percent;
          }
        },
      });

      const { launchAppViaWebUsb } = await import(
        'irene/utils/webusb-adb-install'
      );
      await launchAppViaWebUsb(adb, packageName);

      this.webusbInstallStage = 'done';
    } catch (err) {
      this.notify.error(this.intl.t('cyodAutoInstallFailed'));
      throw err;
    }
  });

  // Proxy CYOD — Mercer is streaming; use cyod-viewer instead of noVNC
  get isScrcpyScan() {
    const deviceUsed = this.args.dynamicScan?.get('deviceUsed');

    return deviceUsed?.vnc_mode === VNC_MODE_SCRCPY;
  }

  get scrcpyScanToken() {
    return this.args.dynamicScan?.get('moriartyDynamicscanToken') ?? null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    VncViewer: typeof VncViewerComponent;
  }
}
