/**
 * CYOD Device Registration Wizard
 *
 * Handles two registration paths:
 *   Android — WebUSB via @yume-chan/adb (Chrome/Edge only)
 *   iOS     — KnoxOps localhost agent on port 17392
 *
 * On success, calls @onDeviceRegistered with the device_identifier
 * returned by moriarty's POST /devicefarm/v2/devices/webusb-register/.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type DevicefarmService from 'irene/services/devicefarm';
import type IreneAjaxService from 'irene/services/ajax';
import type CyodAdbSessionService from 'irene/services/cyod-adb-session';

const KNOXOPS_AGENT_PORT = 17392;
const WEBUSB_REGISTER_PATH = '/devicefarm/v2/devices/webusb-register/';

type WebUSBRegisteredDevice = {
  device_identifier: string;
  model: string;
  platform_version: string;
  serial_number: string;
};

export interface CyodDeviceRegistrationSignature {
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

  @tracked detectedSerial: string | null = null;
  @tracked detectedModel: string | null = null;
  @tracked detectedOsVersion: string | null = null;
  @tracked detectedArch: string | null = null;

  get isAndroid() {
    return this.args.platform === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return this.args.platform === ENUMS.PLATFORM.IOS;
  }

  get isWebUsbSupported() {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  get isDeviceDetected() {
    return !!this.detectedSerial;
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
      this.notify.error(this.intl.t('cyodUsbNotSupported'));
      return;
    }

    try {
      // Dynamically import to avoid SSR/test issues
      const { AdbDaemonWebUsbDeviceManager } = await import(
        '@yume-chan/adb-backend-webusb'
      );
      const { Adb, AdbDaemonTransport } = await import('@yume-chan/adb');

      // Prompt user to select a USB device
      const usbDevice =
        await AdbDaemonWebUsbDeviceManager.BROWSER.requestDevice();

      if (!usbDevice) {
        return;
      }

      // Open the ADB connection
      const transport = await AdbDaemonTransport.authenticate({
        serial: usbDevice.serial,
        connection: usbDevice,
        credentialStore: {
          // Generate a throwaway key for POC — production should persist this
          generateKey: async () => {
            const { AdbSubprocessNoneProtocol } = await import('@yume-chan/adb');
            void AdbSubprocessNoneProtocol; // side-effect import

            return crypto.subtle.generateKey(
              { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-1' },
              true,
              ['sign', 'verify']
            );
          },
          iterateKeys: async function* () { /* no stored keys */ },
        },
      });

      const adb = new Adb(transport);

      // Read device properties
      const serial = usbDevice.serial;
      const model = (
        await adb.subprocess.spawnAndWaitLegacy(['getprop', 'ro.product.model'])
      ).trim();
      const osVersion = (
        await adb.subprocess.spawnAndWaitLegacy([
          'getprop',
          'ro.build.version.release',
        ])
      ).trim();
      const arch = (
        await adb.subprocess.spawnAndWaitLegacy(['getprop', 'ro.product.cpu.abi'])
      ).trim();

      this.detectedSerial = serial;
      this.detectedModel = model;
      this.detectedOsVersion = osVersion;
      this.detectedArch = arch;

      // Keep the ADB connection alive for auto-install once the scan starts.
      // CyodAdbSessionService will dispose it after 10 min or on scan stop.
      this.cyodAdbSession.store(serial, adb);

      await this._postRegistration(
        serial,
        ENUMS.PLATFORM.ANDROID,
        model,
        osVersion,
        arch
      );
    } catch (err) {
      this.notify.error(this.intl.t('cyodRegistrationFailed'));
      console.error('[CYOD] Android registration error:', err);
    }
  });

  registerIosDevice = task(async () => {
    try {
      // KnoxOps agent: GET http://localhost:17392/device-info
      const agentUrl = `http://localhost:${KNOXOPS_AGENT_PORT}/device-info`;
      const response = await fetch(agentUrl);

      if (!response.ok) {
        this.notify.error(this.intl.t('cyodIosAgentNotFound'));
        return;
      }

      const info = (await response.json()) as {
        udid: string;
        model: string;
        product_version: string;
        cpu_architecture: string;
      };

      this.detectedSerial = info.udid;
      this.detectedModel = info.model;
      this.detectedOsVersion = info.product_version;
      this.detectedArch = info.cpu_architecture ?? 'arm64e';

      await this._postRegistration(
        info.udid,
        ENUMS.PLATFORM.IOS,
        info.model,
        info.product_version,
        this.detectedArch
      );
    } catch {
      this.notify.error(this.intl.t('cyodIosAgentNotFound'));
    }
  });

  async _postRegistration(
    serialNumber: string,
    platform: number,
    model: string,
    platformVersion: string,
    cpuArchitecture: string
  ) {
    const url = new URL(WEBUSB_REGISTER_PATH, this.devicefarm.urlbase).href;

    const device = await this.ajax.post<WebUSBRegisteredDevice>(url, {
      data: JSON.stringify({
        serial_number: serialNumber,
        platform,
        model,
        platform_version: platformVersion,
        cpu_architecture: cpuArchitecture,
        name: model,
      }),
      contentType: 'application/json',
    });

    this.notify.success(this.intl.t('cyodDeviceRegistered'));
    this.args.onDeviceRegistered(device);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    CyodDeviceRegistration: typeof CyodDeviceRegistrationComponent;
    'cyod-device-registration': typeof CyodDeviceRegistrationComponent;
  }
}
