import { service } from '@ember/service';
import Service from '@ember/service';

import type UserModel from 'irene/models/user';
import type ConfigurationService from '../configuration';
import type LoggerService from '../logger';
import type IreneAjaxService from '../ajax';
import { RealtimeCounterTypeValue } from '../realtime';

type WsInstanceEventHandlerFn = <T = unknown>(
  event: string,
  handler: (data: T) => void,
  target?: object
) => void;

export interface SocketInstance {
  on: WsInstanceEventHandlerFn;
  off: WsInstanceEventHandlerFn;
  emit<T = unknown>(event: string, data: T): void;
  reconnect(): void;
  close(): void;
}

export interface SocketIOService {
  socketFor(host: string, options: { path: string }): SocketInstance;
  closeSocketFor(host: string): void;
}

// Event types for the event bus
export enum WsEventType {
  CONNECT = 'connect',
  OBJECT = 'object',
  NEWOBJECT = 'newobject',
  MESSAGE = 'message',
  COUNTER = 'counter',
  NOTIFICATION = 'notification',
  CLOSE = 'close',
}

// Base interface for all websocket events
export interface WsEvent {
  type: WsEventType;
}

export interface ConnectEvent extends WsEvent {
  type: WsEventType.CONNECT;
}

export interface ObjectEvent extends WsEvent {
  type: WsEventType.OBJECT | WsEventType.NEWOBJECT;
  id: string;
  objectType: string;
}

export interface MessageEvent extends WsEvent {
  type: WsEventType.MESSAGE;
  message: string;
  notifyType: number;
}

export interface CounterEvent extends WsEvent {
  type: WsEventType.COUNTER;
  counterType: RealtimeCounterTypeValue;
}

export interface NotificationEvent extends WsEvent {
  type: WsEventType.NOTIFICATION;
  unreadCount: number;
  product: number;
}

export interface CloseEvent extends WsEvent {
  type: WsEventType.CLOSE;
}

// Shape of the event handlers
export type WsEventHandler<T extends WsEvent> = (event: T) => void;

export default class WsCoreService extends Service {
  @service declare configuration: ConfigurationService;
  @service declare logger: LoggerService;
  @service declare ajax: IreneAjaxService;
  @service('socket-io') declare socketIOService: SocketIOService;

  connectionPath = '/websocket';

  currentUser: UserModel | null = null;
  currentSocketID: string | null = null;
  connectedSocket: SocketInstance | null = null;

  private eventHandlers: Map<WsEventType, Set<WsEventHandler<any>>> = new Map();

  get host() {
    const hostFromConfig = this.configuration.serverData.websocket;

    if (hostFromConfig) {
      return hostFromConfig;
    }

    if (this.ajax.host) {
      return this.ajax.host;
    }

    return '/';
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
    socket.on('connect', this.handleConnect, this);
    socket.on('object', this.handleObject, this);
    socket.on('newobject', this.handleNewObject, this);
    socket.on('message', this.handleMessage, this);
    socket.on('counter', this.handleCounter, this);
    socket.on('notification', this.handleNotification, this);
    socket.on('close', this.handleClose, this);
  }

  getSocketInstance(): SocketInstance {
    this.logger.debug(`Connecting websocket to ${this.host}`);

    return this.socketIOService.socketFor(this.host, {
      path: this.connectionPath,
    });
  }

  closeSocketConnection() {
    this.socketIOService.closeSocketFor(this.host);
  }

  handleConnect() {
    this.logger.debug('Connecting to room: ' + this.currentSocketID);

    this.connectedSocket?.emit('subscribe', {
      room: this.currentSocketID,
    });

    // Emit the connect event
    this.emit<ConnectEvent>({
      type: WsEventType.CONNECT,
    });
  }

  handleObject(data: { id?: string; type?: string } = {}) {
    if (!data) {
      this.logger.error(`invalid data for handleObject`);

      return;
    }

    if (!data.id || !data.type) {
      this.logger.error(
        `invalid data for handleObject ${JSON.stringify(data)}`
      );

      return;
    }

    const objectID = data.id;
    const objectType = data.type;

    // Emit the object event
    this.emit<ObjectEvent>({
      type: WsEventType.OBJECT,
      id: objectID,
      objectType: objectType,
    });
  }

  handleNewObject(data: { id?: string; type?: string } = {}) {
    if (!data) {
      this.logger.error(`invalid data for handleNewObject`);

      return;
    }

    if (!data.id || !data.type) {
      this.logger.error(
        `invalid data for handleNewObject ${JSON.stringify(data)}`
      );

      return;
    }

    const objectID = data.id;
    const objectType = data.type;

    // Emit the newobject event
    this.emit<ObjectEvent>({
      type: WsEventType.NEWOBJECT,
      id: objectID,
      objectType: objectType,
    });
  }

  handleMessage(data?: { message?: string; notifyType?: number }) {
    if (!data) {
      this.logger.error(`invalid data for handleMessage`);

      return;
    }

    if (!data.message || !data.notifyType) {
      this.logger.error(
        `invalid data for handleMessage ${JSON.stringify(data)}`
      );

      return;
    }

    const message = data.message;
    const notifyType = data.notifyType;

    // Emit the message event
    this.emit<MessageEvent>({
      type: WsEventType.MESSAGE,
      message: message,
      notifyType: notifyType,
    });
  }

  handleCounter(data?: { type?: string }) {
    if (!data) {
      this.logger.error(`invalid data for handleCounter`);

      return;
    }

    if (!data.type) {
      this.logger.error(
        `invalid data for handleCounter ${JSON.stringify(data)}`
      );

      return;
    }

    // Emit the counter event
    this.emit<CounterEvent>({
      type: WsEventType.COUNTER,
      counterType: data.type as RealtimeCounterTypeValue,
    });
  }

  handleNotification(data?: { unread_count: number; product: number }) {
    if (!data) {
      this.logger.error(`invalid data for handleNotification`);

      return;
    }

    if (!('unread_count' in data)) {
      this.logger.error(
        `invalid data for handleNotification ${JSON.stringify(data)}`
      );

      return;
    }

    // Emit the notification event
    this.emit<NotificationEvent>({
      type: WsEventType.NOTIFICATION,
      unreadCount: data.unread_count,
      product: data.product,
    });
  }

  handleClose(event: unknown) {
    this.logger.warn('socket close called. Trying to reconnect', event);

    // Emit the close event
    this.emit({
      type: WsEventType.CLOSE,
    });

    this.connectedSocket?.reconnect();
  }

  on<T extends WsEvent>(eventType: WsEventType, handler: WsEventHandler<T>) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)?.add(handler);
  }

  off<T extends WsEvent>(
    eventType: WsEventType,
    handler: WsEventHandler<T>
  ): void {
    const handlers = this.eventHandlers.get(eventType);

    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit<T extends WsEvent>(event: T): void {
    const handlers = this.eventHandlers.get(event.type);

    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          this.logger.error(
            `Error in websocket event handler for ${event.type}:`,
            error
          );
        }
      });
    }
  }
}
