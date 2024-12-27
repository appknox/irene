import { inject as service } from '@ember/service';
import { singularize } from 'ember-inflector';
import Service from '@ember/service';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';
import type Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import type ConfigurationService from './configuration';
import type RealtimeService from './realtime';
import type AkNotificationsService from './ak-notifications';
import type UserModel from 'irene/models/user';
import type IreneAjaxService from './ajax';

export interface SocketInstance {
  on: (event: string, handler: (args: any) => void, target?: object) => void;
  off: (event: string, handler: (args: any) => void, target?: object) => void;
  emit: (event: string, data: unknown) => void;
  reconnect: () => void;
  close: () => void;
}

export interface SocketHealthMessage {
  is_healthy: boolean;
}

type ModelNameIdMapper = Record<string, { modelName: string; id: string }>;

export default class WebsocketService extends Service {
  @service declare store: Store;
  @service declare configuration: ConfigurationService;
  @service declare logger: any;
  @service declare realtime: RealtimeService;
  @service declare notifications: NotificationService;
  @service declare akNotifications: AkNotificationsService;
  @service declare ajax: IreneAjaxService;
  @service('socket-io') socketIOService: any;

  connectionPath = '/websocket';

  currentUser: UserModel | null = null;
  currentSocketID: string | null = null;
  connectedSocket: SocketInstance | null = null;
  modelNameIdMapper: ModelNameIdMapper = {};

  getHost() {
    const hostFromConfig = this.configuration.serverData.websocket;

    if (hostFromConfig) {
      return hostFromConfig;
    }

    if (this.ajax.host) {
      return this.ajax.host;
    }

    return '/';
  }

  getSocketInstance(): SocketInstance {
    const host = this.getHost();

    this.logger.debug(`Connecting websocket to ${host}`);

    return this.socketIOService.socketFor(host, {
      path: this.connectionPath,
    });
  }

  closeSocketConnection() {
    const host = this.getHost();

    this.socketIOService.closeSocketFor(host);
  }

  async configure(user: UserModel) {
    if (!user) {
      return;
    }

    const socketId = user.socketId;

    if (!socketId) {
      return;
    }

    this.currentSocketID = socketId;
    this.currentUser = user;

    await this.connect();
  }

  async connect() {
    const socket = this.getSocketInstance();

    this.connectedSocket = socket;
    this._initializeSocket(socket);
  }

  async _initializeSocket(socket: SocketInstance) {
    socket.on('connect', this.onConnect, this);
    socket.on('object', this.onObject, this);
    socket.on('newobject', this.onNewObject, this);
    socket.on('message', this.onMessage, this);
    socket.on('counter', this.onCounter, this);
    socket.on('notification', this.onNotification, this);

    socket.on('close', (event) => {
      this.logger.warning('socket close called. Trying to reconnect', event);

      socket.reconnect();
    });
  }

  onConnect() {
    this.logger.debug('Connecting to room: ' + this.currentSocketID);

    this.connectedSocket?.emit('subscribe', {
      room: this.currentSocketID,
    });
  }

  onObject(data: { id?: string; type?: string } = {}) {
    if (!data) {
      this.logger.error(`invalid data for onObject`);

      return;
    }

    if (!data.id || !data.type) {
      this.logger.error(`invalid data for onObject ${JSON.stringify(data)}`);

      return;
    }

    const objectID = data.id;
    const objectType = data.type;

    const modelName = singularize(objectType);

    this.enqueuePullModel.perform(modelName, objectID);
  }

  onNewObject(...args: { id?: string; type?: string }[]) {
    return this.onObject(...args);
  }

  onNotification(data?: { unread_count: number }) {
    if (!data) {
      this.logger.error(`invalid data for onNotification`);

      return;
    }

    if (!('unread_count' in data)) {
      this.logger.error(
        `invalid data for onNotification ${JSON.stringify(data)}`
      );

      return;
    }

    this.akNotifications.realtimeUpdate({
      unReadCount: data.unread_count,
    });
  }

  onMessage(data?: { message?: string; notifyType?: number }) {
    if (!data) {
      this.logger.error(`invalid data for onMessage`);

      return;
    }

    if (!data.message || !data.notifyType) {
      this.logger.error(`invalid data for onMessage ${JSON.stringify(data)}`);

      return;
    }

    const message = data.message;
    const notifyType = data.notifyType;

    if (notifyType === ENUMS.NOTIFY.INFO) {
      this.notifications.info(message, ENV.notifications);
    }

    if (notifyType === ENUMS.NOTIFY.SUCCESS) {
      this.notifications.success(message, ENV.notifications);
    }

    if (notifyType === ENUMS.NOTIFY.WARNING) {
      this.notifications.warning(message, ENV.notifications);
    }

    if (notifyType === ENUMS.NOTIFY.ALERT) {
      this.notifications.alert(message, ENV.notifications);
    }

    if (notifyType === ENUMS.NOTIFY.ERROR) {
      this.notifications.error(message, {
        autoClear: false,
      });
    }

    this.logger.debug(`${notifyType}: ${message}`);
  }

  onCounter(data?: { type?: string }) {
    if (!data) {
      this.logger.error(`invalid data for onCounter`);

      return;
    }

    if (!data.type) {
      this.logger.error(`invalid data for onCounter ${JSON.stringify(data)}`);

      return;
    }

    this.realtime.incrementProperty(
      `${data.type}Counter` as keyof RealtimeService
    );

    this.logger.debug(`Realtime increment for ${data.type}`);
  }

  // this will ensure task run sequentially
  enqueuePullModel = task(
    { enqueue: true },
    async (modelName: string, id: string) => {
      // store all unique modelName & id until debounce handler
      this.modelNameIdMapper[`${modelName}-${id}`] = { modelName, id };

      // debounce and pass copy of mapper object
      debounce(this, this.handlePullModel, { ...this.modelNameIdMapper }, 300);
    }
  );

  // debounce handler
  handlePullModel(mapper: ModelNameIdMapper) {
    // reset global mapper for next set of messages
    this.modelNameIdMapper = {};

    // pull all models from mapper
    Object.values(mapper).forEach(({ modelName, id }) => {
      this.pullModel.perform(modelName, id);
    });
  }

  pullModel = task(async (modelName, id) => {
    try {
      this.store.modelFor(modelName);

      await this.store.findRecord(modelName, id);
    } catch (error) {
      this.logger.error(error);
    }

    this.logger.debug(`Pulling ${modelName}: ${id}`);
  });
}
