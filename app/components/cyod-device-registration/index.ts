import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb';
import { Adb, AdbDaemonTransport } from '@yume-chan/adb';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type DevicefarmService from 'irene/services/devicefarm';
import type IreneAjaxService from 'irene/services/ajax';
import type CyodAdbSessionService from 'irene/services/cyod-adb-session';
import type OrganizationService from 'irene/services/organization';
import type LoggerService from 'irene/services/logger';

const KNOXOPS_AGENT_PORT = 17392;
const DEFAULT_IOS_ARCH = 'arm64e';

type WebUSBRegisteredDevice = {
  device_identifier: string;
  model: string;
  platform_version: string;
  serial_number: string;
};

type DetectedDevice = {
  serial: string;
  model: string;
  osVersion: string;
  arch: string;
};

type IosDeviceInfo = {
  udid: string;
  model: string;
  product_version: string;
  cpu_architecture: string;
};

type AdbProtocolPropertyKey =
  | 'ro.product.model'
  | 'ro.build.version.release'
  | 'ro.product.cpu.abi';

export interface CyodDeviceRegistrationSignature {
  Element: HTMLElement;
  Args: {
    platform: number;
    onDeviceRegistered: (device: WebUSBRegisteredDevice) => void;
  };
}

export default class CyodDeviceRegistrationComponent extends Component<CyodDeviceRegistrationSignature> {
  @service declare intl: IntlService;
  @service declare devicefarm: DevicefarmService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service('cyod-adb-session') declare cyodAdbSession: CyodAdbSessionService;
  @service declare organization: OrganizationService;
  @service declare logger: LoggerService;
  @service('browser/window') declare window: Window;

  @tracked detectedSerial: string | null = null;
  @tracked detectedModel: string | null = null;
  @tracked detectedOsVersion: string | null = null;
  @tracked detectedArch: string | null = null;

  get isCyodEnabled() {
    return this.organization.isCyodEnabled;
  }

  get isAndroid() {
    return this.args.platform === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return this.args.platform === ENUMS.PLATFORM.IOS;
  }

  get platformLabel() {
    return this.isAndroid ? this.intl.t('android') : this.intl.t('ios');
  }

  get isWebUsbSupported() {
    return (
      this.window.navigator !== undefined && 'usb' in this.window.navigator
    );
  }

  get isDeviceDetected() {
    return !!this.detectedSerial;
  }

  async getProtocolProp(adb: Adb, property: AdbProtocolPropertyKey) {
    const result = await adb.subprocess.noneProtocol.spawnWaitText([
      'getprop',
      property,
    ]);

    return result.trim();
  }

  setDetectedDevice(device: DetectedDevice) {
    this.detectedSerial = device.serial;
    this.detectedModel = device.model;
    this.detectedOsVersion = device.osVersion;
    this.detectedArch = device.arch;
  }

  reportRegistrationError(context: string, err: unknown) {
    this.notify.error(parseError(err, this.intl.t('cyod.registrationFailed')));
    this.logger.error(`[CYOD] ${context}:`, err);
  }

  @action
  handleRegisterClick() {
    if (this.isAndroid) {
      this.registerAndroidDevice.perform();
    } else {
      this.registerIosDevice.perform();
    }
  }

  registerAndroidDevice = task(async () => {
    if (!this.isWebUsbSupported) {
      this.notify.error(this.intl.t('cyod.usbNotSupported'));

      return;
    }

    try {
      const usbDevice =
        await AdbDaemonWebUsbDeviceManager.BROWSER?.requestDevice();

      // The user dismissed the browser's device picker.
      if (!usbDevice) {
        return;
      }

      const serial = usbDevice.serial;

      const transport = await AdbDaemonTransport.authenticate({
        serial,
        connection: await usbDevice.connect(),
        credentialStore: {
          iterateKeys: async function* () {}, // No stored keys

          // A new key each time, so the device re-prompts for USB debugging
          // authorisation on every registration.
          generateKey: () => this.generateAuthenticationKey.perform(),
        },
      });

      const { adb, device } = await this.readDeviceProps.perform(
        transport,
        serial
      );

      this.setDetectedDevice(device);

      // Keep the ADB connection alive for auto-install once the scan starts.
      // CyodAdbSessionService will dispose it after 10 min or on scan stop.
      this.cyodAdbSession.store(serial, adb);

      await this.postRegistration.perform(ENUMS.PLATFORM.ANDROID, device);
    } catch (err) {
      this.reportRegistrationError('Android registration error', err);
    }
  });

  registerIosDevice = task(async () => {
    let info: IosDeviceInfo;

    // The KnoxOps agent runs on the user's machine, so an unreachable agent is
    // the expected failure here and needs its own message.
    try {
      // Plain fetch, not IreneAjaxService: the KnoxOps agent runs on the
      // user's own machine and takes none of mycroft's auth headers.
      const agentUrl = `http://localhost:${KNOXOPS_AGENT_PORT}/device-info`;
      const response = await fetch(agentUrl);

      if (!response.ok) {
        this.notify.error(this.intl.t('cyod.iosAgentNotFound'));

        return;
      }

      info = await response.json();
    } catch (err) {
      this.notify.error(this.intl.t('cyod.iosAgentNotFound'));
      this.logger.error('[CYOD] KnoxOps agent unreachable:', err);

      return;
    }

    const device: DetectedDevice = {
      serial: info.udid,
      model: info.model,
      osVersion: info.product_version,
      arch: info.cpu_architecture ?? DEFAULT_IOS_ARCH,
    };

    this.setDetectedDevice(device);

    try {
      await this.postRegistration.perform(ENUMS.PLATFORM.IOS, device);
    } catch (err) {
      this.reportRegistrationError('iOS registration error', err);
    }
  });

  generateAuthenticationKey = task(async () => {
    const keyPairConfig = {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-1',
    };

    const cryptoSubtle = this.window.crypto.subtle;

    const keyPair = await cryptoSubtle.generateKey(keyPairConfig, true, [
      'sign',
      'verify',
    ]);

    const pkcs8 = await cryptoSubtle.exportKey('pkcs8', keyPair.privateKey);

    return { buffer: new Uint8Array(pkcs8) };
  });

  readDeviceProps = task(
    async (transport: AdbDaemonTransport, serial: string) => {
      const adb = new Adb(transport);

      const [model, osVersion, arch] = await Promise.all([
        this.getProtocolProp(adb, 'ro.product.model'),
        this.getProtocolProp(adb, 'ro.build.version.release'),
        this.getProtocolProp(adb, 'ro.product.cpu.abi'),
      ]);

      return { adb, device: { serial, model, osVersion, arch } };
    }
  );

  postRegistration = task(async (platform: number, device: DetectedDevice) => {
    const { webusbRegisterEndpoint, urlbase } = this.devicefarm;
    const url = new URL(webusbRegisterEndpoint, urlbase).href;

    const requestBody = JSON.stringify({
      serial_number: device.serial,
      platform,
      model: device.model,
      platform_version: device.osVersion,
      cpu_architecture: device.arch,
      name: device.model,
    });

    const registeredDevice = await this.ajax.post<WebUSBRegisteredDevice>(url, {
      data: requestBody,
      contentType: 'application/json',
    });

    this.notify.success(this.intl.t('cyod.deviceRegistered'));
    this.args.onDeviceRegistered(registeredDevice);
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    CyodDeviceRegistration: typeof CyodDeviceRegistrationComponent;
    'cyod-device-registration': typeof CyodDeviceRegistrationComponent;
  }
}
