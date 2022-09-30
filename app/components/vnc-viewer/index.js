import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { tracked } from '@glimmer/tracking';

export default class VncViewerComponent extends Component {
  rfb = null;
  deviceFarmPassword = ENV.deviceFarmPassword;

  @service intl;
  @service devicefarm;
  @service store;

  @tracked isPoppedOut = false;
  @tracked devicePreference = null;
  @tracked currentOrientation = 0;
  @tracked changingOrientation = false;

  tCloseModal = this.intl.t('closeModal');
  tPopOutModal = this.intl.t('popOutModal');

  constructor() {
    super(...arguments);

    this.fetchDevicePreference();
  }

  get deviceFarmURL() {
    const token = this.args.file.deviceToken;

    return this.devicefarm.getTokenizedWSURL(token);
  }

  get vncPopText() {
    if (this.isPoppedOut) {
      return this.tCloseModal;
    } else {
      return this.tPopOutModal;
    }
  }

  get showVNCControls() {
    const isReady = this.args.file.isReady;

    return this.isPoppedOut || isReady;
  }

  async fetchDevicePreference() {
    const profileId = (await this.args.file.project).activeProfileId;

    if (profileId) {
      this.devicePreference = await this.store.queryRecord(
        'device-preference',
        {
          id: profileId,
        }
      );
    }
  }

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

  get isNotTablet() {
    const deviceType = this.devicePreference?.deviceType;

    return ![
      ENUMS.DEVICE_TYPE.NO_PREFERENCE,
      ENUMS.DEVICE_TYPE.PHONE_REQUIRED,
    ].includes(deviceType);
  }

  get isIOSDevice() {
    const platform = this.args.file.project.get('platform');

    return platform === ENUMS.PLATFORM.IOS;
  }

  @action
  togglePop() {
    if (this.isPoppedOut) {
      this.resetRotation();
    }

    this.isPoppedOut = !this.isPoppedOut;
  }

  @action
  rotateDevice() {
    const deviceContainer = document.querySelector('#vnc-device-container');

    const nextOrientation =
      this.currentOrientation === 270 ? 0 : this.currentOrientation + 90;

    deviceContainer.style.transform = `rotate(${nextOrientation}deg)`;

    this.changingOrientation = true;
    this.currentOrientation = nextOrientation;

    const ctx = this.rfb?._canvas.getContext('2d');
    ctx?.rotate(Math.PI / 2);

    setTimeout(() => {
      this.changingOrientation = false;
    }, 200);
  }

  resetRotation() {
    const deviceContainer = document.querySelector('#vnc-device-container');

    deviceContainer.style.transform = 'rotate(0deg)';

    this.changingOrientation = true;
    this.currentOrientation = 0;

    const ctx = this.rfb?._canvas.getContext('2d');
    ctx?.rotate(0);

    setTimeout(() => {
      this.changingOrientation = false;
    }, 200);
  }

  setFocus(focus) {
    const keyboard = this.rfb?.get_keyboard();
    keyboard?.set_focused(focus);
  }

  focusKeyboard() {
    this.setFocus(true);
  }

  blurKeyboard() {
    this.setFocus(false);
  }
}
