import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import DevicefarmService from 'irene/services/devicefarm';
import { tracked } from '@glimmer/tracking';

export default class SystemStatusComponent extends Component {
  @service declare devicefarm: DevicefarmService;
  @service declare ajax: any;

  @tracked isStorageWorking = false;
  @tracked isDeviceFarmWorking = false;
  @tracked isAPIServerWorking = false;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getStorageStatus.perform();
    this.getDeviceFarmStatus.perform();
    this.getAPIServerStatus.perform();
  }

  getStorageStatus = task({ drop: true }, async () => {
    try {
      const status = await this.ajax.request(ENV.endpoints['status']);

      await this.ajax.request(status.data.storage, { headers: {} });
    } catch (error) {
      this.isStorageWorking = false;
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
