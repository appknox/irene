import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import FileModel from 'irene/models/file';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import DevicePreferenceModel from 'irene/models/device-preference';
import DevicefarmService from 'irene/services/devicefarm';

export interface VncViewerSignature {
  Args: {
    file: FileModel;
    profileId?: number;
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

    this.fetchDevicePreference.perform();
  }

  get deviceFarmURL() {
    const token = this.args.file.deviceToken;

    return this.devicefarm.getTokenizedWSURL(token);
  }

  fetchDevicePreference = task(async () => {
    const profileId = this.args.profileId;

    if (profileId) {
      this.devicePreference = await this.store.queryRecord(
        'device-preference',
        { id: profileId }
      );
    }
  });

  get screenRequired() {
    const platform = this.args.file.project.get('platform');
    const deviceType = this.devicePreference?.deviceType;

    return (
      platform === ENUMS.PLATFORM.ANDROID &&
      deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED
    );
  }

  get deviceType() {
    const platform = this.args.file.project.get('platform');
    const deviceType = this.devicePreference?.deviceType;

    if (platform === ENUMS.PLATFORM.ANDROID) {
      if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
        return 'tablet';
      } else {
        return 'nexus5';
      }
    } else if (platform === ENUMS.PLATFORM.IOS) {
      if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
        return 'ipad black';
      } else {
        return 'iphone5s black';
      }
    }

    return '';
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
