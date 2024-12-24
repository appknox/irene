import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type DevicefarmService from 'irene/services/devicefarm';
import type DevicePreferenceModel from 'irene/models/device-preference';

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

  @tracked rfb: any = null;
  @tracked devicePreference?: DevicePreferenceModel;

  deviceFarmPassword = ENV.deviceFarmPassword;

  constructor(owner: unknown, args: VncViewerSignature['Args']) {
    super(owner, args);

    // TODO: get device details based on preference
    // this.fetchDevicePreference.perform();
  }

  get deviceFarmURL() {
    const token = this.args.dynamicScan?.moriartyDynamicscanToken;

    if (token) {
      return this.devicefarm.getTokenizedWSURL(token);
    }

    return null;
  }

  get deviceType() {
    const platform = this.args.file.project.get('platform');

    if (platform === ENUMS.PLATFORM.ANDROID) {
      return 'nexus5';
    } else if (platform === ENUMS.PLATFORM.IOS) {
      return 'iphone5s black';
    }

    return '';
  }

  // get deviceType() {
  //   const platform = this.args.file.project.get('platform');
  //   const deviceType = this.devicePreference?.deviceType;

  //   if (platform === ENUMS.PLATFORM.ANDROID) {
  //     if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
  //       return 'tablet';
  //     } else {
  //       return 'nexus5';
  //     }
  //   } else if (platform === ENUMS.PLATFORM.IOS) {
  //     if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
  //       return 'ipad black';
  //     } else {
  //       return 'iphone5s black';
  //     }
  //   }

  //   return '';
  // }

  get isAutomated() {
    return this.args.isAutomated;
  }

  get isTablet() {
    const deviceType = this.devicePreference?.deviceType;

    return ![
      ENUMS.DEVICE_TYPE.NO_PREFERENCE,
      ENUMS.DEVICE_TYPE.PHONE_REQUIRED,
    ].includes(deviceType as number);
  }

  get isIOSDevice() {
    const platform = this.args.file.project.get('platform');

    return platform === ENUMS.PLATFORM.IOS;
  }

  get dynamicScan() {
    return this.args.dynamicScan;
  }

  get startedBy() {
    return this.dynamicScan?.startedByUser?.get('username');
  }

  @action
  setFocus(focus: boolean) {
    const keyboard = this.rfb?.get_keyboard();

    keyboard.set_focused(focus);
  }

  @action
  focusKeyboard() {
    this.setFocus(true);
  }

  @action
  blurKeyboard() {
    this.setFocus(false);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    VncViewer: typeof VncViewerComponent;
  }
}
