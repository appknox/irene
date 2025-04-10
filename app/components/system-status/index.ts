import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { runTask } from 'ember-lifeline';
import { waitForPromise } from '@ember/test-waiters';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import WsCoreService, { type SocketInstance } from 'irene/services/ws/core';
import type DevicefarmService from 'irene/services/devicefarm';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

type StatusResponse = {
  data: {
    storage: string;
  };
};

export interface SocketHealthMessage {
  is_healthy: boolean;
}

export default class SystemStatusComponent extends Component {
  @service declare devicefarm: DevicefarmService;
  @service('ws/core') declare websocket: WsCoreService;
  @service declare ajax: IreneAjaxService;
  @service declare session: any;
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked isStorageWorking = false;
  @tracked isDeviceFarmWorking = false;
  @tracked isAPIServerWorking = false;
  @tracked isWebsocketWorking = false;

  socket?: SocketInstance;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getStorageStatus.perform();
    this.getDeviceFarmStatus.perform();
    this.getAPIServerStatus.perform();

    if (this.showRealtimeServerStatus) {
      runTask(this, () => this.getWebsocketHealthStatus.perform());
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
    return this.isAuthenticated;
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
        isRunning: this.getWebsocketHealthStatus.isRunning,
        isWorking: this.isWebsocketWorking,
      });
    }

    return statusRows;
  }

  getStorageStatus = task({ drop: true }, async () => {
    try {
      const status = await this.ajax.request<StatusResponse>(
        ENV.endpoints['status'] as string
      );

      await this.ajax.request(status.data.storage, { headers: {} });
    } catch (err) {
      const error = err as AjaxError;

      if (error && error.status === 404) {
        this.isStorageWorking = true;
      }
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
      await this.ajax.request(ENV.endpoints['ping'] as string);

      this.isAPIServerWorking = true;
    } catch (_) {
      this.isAPIServerWorking = false;
    }
  });

  getWebsocketHealthStatus = task({ drop: true }, async () => {
    const userId = this.session.data.authenticated.user_id;
    this.socket = this.websocket.getSocketInstance();

    try {
      this.socket.on(
        'websocket_health_check',
        this.onWebsocketHealthCheck.bind(this)
      );

      const user = await this.store.findRecord('user', userId);

      if (user.socketId) {
        await waitForPromise(
          this.triggerWebsocketHealthCheck.perform(user.socketId)
        );
      }
    } catch (_) {
      this.isWebsocketWorking = false;

      this.handleSocketHealthCheckCleanUp();
    }
  });

  triggerWebsocketHealthCheck = task(async (socketId: string) => {
    this.socket?.emit('subscribe', { room: socketId });

    // wait for user to join room
    await timeout(1000);

    await this.ajax.post('/api/websocket_health_check', { data: {} });

    // wait for socket to notify
    await timeout(1000);
  });

  onWebsocketHealthCheck(data: SocketHealthMessage) {
    this.isWebsocketWorking =
      ENV.environment === 'test'
        ? JSON.parse(`${data}`).is_healthy
        : data.is_healthy;

    this.handleSocketHealthCheckCleanUp();
  }

  handleSocketHealthCheckCleanUp() {
    this.socket?.off(
      'websocket_health_check',
      this.onWebsocketHealthCheck,
      this
    );

    this.websocket.closeSocketConnection();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SystemStatus: typeof SystemStatusComponent;
  }
}
