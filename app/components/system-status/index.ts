import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { isNotFoundError, AjaxError } from 'ember-ajax/errors';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import DevicefarmService from 'irene/services/devicefarm';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

export default class SystemStatusComponent extends Component {
  @service declare devicefarm: DevicefarmService;
  @service declare ajax: any;
  @service declare intl: IntlService;

  @tracked isStorageWorking = false;
  @tracked isDeviceFarmWorking = false;
  @tracked isAPIServerWorking = false;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getStorageStatus.perform();
    this.getDeviceFarmStatus.perform();
    this.getAPIServerStatus.perform();
  }

  get columns() {
    return [
      { name: this.intl.t('system'), valuePath: 'system' },
      { name: this.intl.t('status'), component: 'system-status/status' },
    ];
  }

  get rows() {
    return [
      {
        id: 'storage',
        system: this.intl.t('storage'),
        isRunning: this.getStorageStatus?.isRunning,
        isWorking: this.isStorageWorking,
        message: this.intl.t('proxyWarning'),
      },
      {
        id: 'devicefarm',
        system: this.intl.t('devicefarm'),
        isRunning: this.getDeviceFarmStatus?.isRunning,
        isWorking: this.isDeviceFarmWorking,
      },
      {
        id: 'api-server',
        system: `${this.intl.t('api')} ${this.intl.t('server')}`,
        isRunning: this.getAPIServerStatus?.isRunning,
        isWorking: this.isAPIServerWorking,
      },
    ];
  }

  getStorageStatus = task({ drop: true }, async () => {
    try {
      const status = await this.ajax.request(ENV.endpoints['status']);

      await this.ajax.request(status.data.storage, { headers: {} });
    } catch (error) {
      this.isStorageWorking = !!isNotFoundError(error as AjaxError);
    }
  });

  getDeviceFarmStatus = task({ drop: true }, async () => {
    try {
      const isWorking = await this.devicefarm.testPing();

      this.isDeviceFarmWorking = isWorking;
    } catch (_) {
      this.isDeviceFarmWorking = false;
    }
  });

  getAPIServerStatus = task({ drop: true }, async () => {
    try {
      await this.ajax.request(ENV.endpoints['ping']);

      this.isAPIServerWorking = true;
    } catch (_) {
      this.isAPIServerWorking = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SystemStatus: typeof SystemStatusComponent;
  }
}
