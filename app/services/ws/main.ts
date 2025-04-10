import Service from '@ember/service';
import { service } from '@ember/service';

import type UserModel from 'irene/models/user';
import type WsNotifHandlerService from './notif-handler';
import WsModelSyncService, { type ModelLoadHandler } from './model-sync';
import WsCounterSyncService, { type CounterSyncHandler } from './counter-sync';

import WsCoreService, {
  type WsEvent,
  type WsEventHandler,
  type WsEventType,
} from './core';

export default class WsService extends Service {
  @service('ws/core') declare wsCore: WsCoreService;
  @service('ws/notif-handler') declare wsNotifHandler: WsNotifHandlerService;
  @service('ws/model-sync') declare wsModelSync: WsModelSyncService;
  @service('ws/counter-sync') declare wsCounterSync: WsCounterSyncService;

  constructor(args: object) {
    super(args);

    this.wsModelSync.initialize();
    this.wsNotifHandler.initialize();
    this.wsCounterSync.initialize();
  }

  // Websocket core methods
  async configure(user: UserModel) {
    return this.wsCore.configure(user);
  }

  getHost() {
    return this.wsCore.host;
  }

  getSocketInstance() {
    return this.wsCore.getSocketInstance();
  }

  closeConnection() {
    return this.wsCore.closeSocketConnection();
  }

  // Register Counter event handlers
  registerCounterEventHandler(handler: CounterSyncHandler) {
    return this.wsCounterSync.addCounterEventHandler(handler);
  }

  removeCounterEventHandler(handler: CounterSyncHandler) {
    return this.wsCounterSync.removeCounterEventHandler(handler);
  }

  // Register Object/NewObject event handlers
  registerModelLoadHandler<T extends object>(handler: ModelLoadHandler<T>) {
    return this.wsModelSync.addObjectEventHandler(handler);
  }

  removeModelLoadHandler<T extends object>(handler: ModelLoadHandler<T>) {
    return this.wsModelSync.removeObjectHandler(handler);
  }

  // Generic event handlers
  on<T extends WsEvent>(eventType: WsEventType, handler: WsEventHandler<T>) {
    return this.wsCore.on(eventType, handler);
  }

  off<T extends WsEvent>(eventType: WsEventType, handler: WsEventHandler<T>) {
    return this.wsCore.off(eventType, handler);
  }

  // Cleanup event handlers
  willDestroy() {
    super.willDestroy();

    this.wsModelSync.cleanup();
    this.wsNotifHandler.cleanup();
    this.wsCounterSync.cleanup();
  }
}

export { WsEventType, SocketInstance } from './core';
