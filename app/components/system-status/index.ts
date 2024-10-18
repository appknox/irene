import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { isNotFoundError, type AjaxError } from 'ember-ajax/errors';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { next } from '@ember/runloop';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type DevicefarmService from 'irene/services/devicefarm';
import type WebsocketService from 'irene/services/websocket';
import type { SocketInstance } from 'irene/services/websocket';

export default class SystemStatusComponent extends Component {
  @service declare devicefarm: DevicefarmService;
  @service declare websocket: WebsocketService;
  @service declare ajax: any;
  @service declare session: any;
  @service declare intl: IntlService;

  @tracked isStorageWorking = false;
  @tracked isDeviceFarmWorking = false;
  @tracked isAPIServerWorking = false;
  @tracked isWebsocketWorking = false;
  @tracked isWebsocketConnecting = false;

  socket?: SocketInstance;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getStorageStatus.perform();
    this.getDeviceFarmStatus.perform();
    this.getAPIServerStatus.perform();

    if (this.showRealtimeServerStatus) {
      next(this, () => this.checkWebsocketConnectionStatus());
    }
  }

  willDestroy(): void {
    super.willDestroy();

    this.handleSocketHealthCheckCleanUp();
  }

  get isAuthenticated() {
    return this.session.isAuthenticated;
  }

  get showRealtimeServerStatus() {
    return this.isAuthenticated && ENV.environment === 'test';
  }

  get columns() {
    return [
      { name: this.intl.t('system'), valuePath: 'system' },
      { name: this.intl.t('status'), component: 'system-status/status' },
    ];
  }

  get rows() {
    const statusRows = [
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

    if (this.showRealtimeServerStatus) {
      statusRows.push({
        id: 'websocket',
        system: this.intl.t('realtimeServer'),
        isRunning: this.isWebsocketConnecting,
        isWorking: this.isWebsocketWorking,
      });
    }

    return statusRows;
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

  checkWebsocketConnectionStatus() {
    this.socket = this.websocket.getSocketInstance();

    try {
      this.isWebsocketConnecting = true;

      this.socket.on('health_check', this.onWebsocketHealthCheck.bind(this));

      this.socket.on('connect', () => {
        this.socket?.emit('health_check', 'ping');
      });
    } catch (_) {
      this.isWebsocketConnecting = false;
      this.isWebsocketWorking = false;

      this.handleSocketHealthCheckCleanUp();
    }
  }

  onWebsocketHealthCheck(data: string) {
    this.isWebsocketConnecting = false;
    this.isWebsocketWorking = data === 'pong';

    this.handleSocketHealthCheckCleanUp();
  }

  handleSocketHealthCheckCleanUp() {
    this.socket?.off('health_check', this.onWebsocketHealthCheck, this);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SystemStatus: typeof SystemStatusComponent;
  }
}
