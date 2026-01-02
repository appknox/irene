import Service from '@ember/service';
import { service } from '@ember/service';
import { singularize } from '@ember-data/request-utils/string';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import type Store from 'ember-data/store';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import type UserModel from 'irene/models/user';
import type ConfigurationService from './configuration';
import type RealtimeService from 'irene/services/realtime';
import type AkNotificationsService from 'irene/services/ak-notifications';
import type IreneAjaxService from 'irene/services/ajax';
import type SkNotificationsService from 'irene/services/sk-notifications';
import type LoggerService from 'irene/services/logger';
import type EventBusService from 'irene/services/event-bus';

import {
  AnalysisEventHandler,
  DynamicScanEventHandler,
  WsModelEventHandler,
} from 'irene/utils/ws-model-ev-handlers';

interface SocketIOService {
  socketFor(host: string, opts: { path: string }): SocketInstance;
  closeSocketFor(host: string): void;
}

type SocketInstanceHandler<T = unknown> = (data?: T) => void;

type SocketInstanceEventHandler = <T = unknown>(
  event: string,
  handler: SocketInstanceHandler<T>,
  target?: object
) => void;

export interface SocketInstance {
  on: SocketInstanceEventHandler;
  off: SocketInstanceEventHandler;
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
  @service declare logger: LoggerService;
  @service declare realtime: RealtimeService;
  @service declare notifications: NotificationService;
  @service declare akNotifications: AkNotificationsService;
  @service declare skNotifications: SkNotificationsService;
  @service declare ajax: IreneAjaxService;
  @service declare eventBus: EventBusService;
  @service('socket-io') declare socketIOService: SocketIOService;

  connectionPath = '/websocket';

  currentUser: UserModel | null = null;
  currentSocketID: string | null = null;
  connectedSocket: SocketInstance | null = null;
  modelNameIdMapper: ModelNameIdMapper = {};

  private handlers: Map<string, WsModelEventHandler> = new Map();

  getHost() {
    return this.configuration.serverData.websocket || this.ajax.host || '/';
  }

  getSocketInstance(): SocketInstance {
    const host = this.getHost();

    this.logger.debug(`Connecting websocket to ${host}`);

    return this.socketIOService.socketFor(host, {
      path: this.connectionPath,
    });
  }

  closeSocketConnection() {
    this.socketIOService.closeSocketFor(this.getHost());
  }

  private registerHandler(handler: WsModelEventHandler) {
    this.handlers.set(handler.modelName, handler);
  }

  async configure(user: UserModel) {
    if (!user?.socketId) {
      return;
    }

    this.currentSocketID = user.socketId;
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

    // Push messages directly to the store
    socket.on('model_created', this.onModelCreatedNotification, this);
    socket.on('model_updated', this.onModelNotification, this);

    socket.on('close', (event) => {
      this.logger.warn('socket close called. Trying to reconnect', event);
      socket.reconnect();
    });
  }

  private validateData<T extends object>(
    data: T | undefined,
    requiredKeys: (keyof T)[],
    eventName: string
  ): data is NonNullable<T> {
    if (!data) {
      this.logger.error(`invalid data for ${eventName}`);

      return false;
    }

    const hasAllKeys = requiredKeys.every((key) => data[key] !== undefined);

    if (!hasAllKeys) {
      this.logger.error(
        `invalid data for ${eventName} ${JSON.stringify(data)}`
      );

      return false;
    }

    return true;
  }

  onConnect() {
    this.logger.debug('Connecting to room: ' + this.currentSocketID);
    this.connectedSocket?.emit('subscribe', { room: this.currentSocketID });

    // Register handlers to dispatch events via event bus
    const handlers = [
      new AnalysisEventHandler(this.store, this.eventBus, this.realtime),
      new DynamicScanEventHandler(this.store, this.eventBus, this.realtime),
    ];

    handlers.forEach((handler) => {
      this.registerHandler(handler);

      this.logger.debug(
        `Registered ${handler.modelName} handler to websocket service`
      );
    });
  }

  /**
   * Handle model creation and update websocket notifications
   * This will push the model to the store without triggering any queries
   * @param data - The data object containing the file ID and type
   * @returns void
   */
  onModelNotification(
    data?: { model_name: string; data: object },
    isCreated = false
  ) {
    if (
      !this.validateData(data, ['model_name', 'data'], 'onModelNotification')
    ) {
      return;
    }

    // Push the model directly to the store
    const normalized = this.store.normalize(data.model_name, data.data);
    const model = this.store.push(normalized);

    // Broadcast the update to the appropriate handler
    if (!isCreated) {
      this.handlers.get(data.model_name)?.onUpdate?.(data.data, model);
    }

    return model;
  }

  /**
   * Handle model creation and update websocket notifications
   * This will push the model to the store without triggering any queries
   * @param data - The data object containing the file ID and type
   * @returns void
   */
  onModelCreatedNotification(data?: { model_name: string; data: object }) {
    const model = this.onModelNotification(data, true);

    if (data?.model_name && data?.data) {
      this.handlers.get(data.model_name)?.onCreate?.(data.data, model);
    }
  }

  onObject(data?: { id: string; type: string }) {
    if (!this.validateData(data, ['id', 'type'], 'onObject')) {
      return;
    }

    const modelName = singularize(data.type);
    this.enqueuePullModel.perform(modelName, data.id);
  }

  onNewObject(...args: ({ id: string; type: string } | undefined)[]) {
    return this.onObject(...args);
  }

  onNotification(data?: { unread_count: number; product: number }) {
    if (
      !this.validateData(data, ['unread_count', 'product'], 'onNotification')
    ) {
      return;
    }

    const updateData = { unReadCount: data.unread_count };

    const notificationServices = {
      [ENUMS.NOTIF_PRODUCT.APPKNOX]: this.akNotifications,
      [ENUMS.NOTIF_PRODUCT.STOREKNOX]: this.skNotifications,
    };

    notificationServices[data.product]?.realtimeUpdate(updateData);
  }

  private routeNotification(message: string, notifyType: number) {
    const notificationConfig = ENV.notifications;
    const errorConfig = { autoClear: false };

    const notificationMap = {
      [ENUMS.NOTIFY.INFO]: () =>
        this.notifications.info(message, notificationConfig),
      [ENUMS.NOTIFY.SUCCESS]: () =>
        this.notifications.success(message, notificationConfig),
      [ENUMS.NOTIFY.WARNING]: () =>
        this.notifications.warning(message, notificationConfig),
      [ENUMS.NOTIFY.ALERT]: () =>
        this.notifications.alert(message, notificationConfig),
      [ENUMS.NOTIFY.ERROR]: () =>
        this.notifications.error(message, errorConfig),
    };

    notificationMap[notifyType]?.();
  }

  onMessage(data?: { message: string; notifyType: number }) {
    if (!this.validateData(data, ['message', 'notifyType'], 'onMessage')) {
      return;
    }

    this.routeNotification(data.message, data.notifyType);
    this.logger.debug(`${data.notifyType}: ${data.message}`);
  }

  onCounter(data?: { type?: string }) {
    if (!this.validateData(data, ['type'], 'onCounter')) {
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
      debounceTask(this, 'handlePullModel', { ...this.modelNameIdMapper }, 300);
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
