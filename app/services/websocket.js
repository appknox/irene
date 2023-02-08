import { inject as service } from '@ember/service';
import { singularize } from 'ember-inflector';
import Service from '@ember/service';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';

export default class WebsocketService extends Service {
  @service store;
  @service configuration;
  @service logger;
  @service realtime;
  @service notifications;
  @service akNotifications;
  @service network;
  @service('socket-io') socketIOService;

  connectionPath = '/websocket';

  currentUser = null;
  currentSocketID = null;
  connectedSocket = null;

  reset() {
    this.currentUser = null;
    this.currentSocketID = null;
    this.connectedSocket = null;
  }

  getHost() {
    const hostFromConfig = this.configuration.serverData.websocket;
    if (hostFromConfig) {
      return hostFromConfig;
    }
    if (this.network.host) {
      return this.network.host;
    }
    return '/';
  }

  async configure(user) {
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
    const host = this.getHost();
    this.logger.debug(`Connecting websocket to ${host}`);
    const socket = this.socketIOService.socketFor(host, {
      path: this.connectionPath,
    });
    this.connectedSocket = socket;
    this._initializeSocket(socket);
  }

  async _initializeSocket(socket) {
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
    const socket = this.connectedSocket;
    this.logger.debug('Connecting to room: ' + this.currentSocketID);
    socket.emit('subscribe', {
      room: this.currentSocketID,
    });
  }

  onObject(data = {}) {
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
    this.pullModel(modelName, objectID);
  }

  onNewObject(...args) {
    return this.onObject(...args);
  }

  onNotification(data) {
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

  onMessage(data) {
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

  onCounter(data) {
    if (!data) {
      this.logger.error(`invalid data for onCounter`);
      return;
    }
    if (!data.type) {
      this.logger.error(`invalid data for onCounter ${JSON.stringify(data)}`);
      return;
    }

    this.realtime.incrementProperty(`${data.type}Counter`);
    this.logger.debug(`Realtime increment for ${data.type}`);
  }

  pullModel(modelName, id) {
    try {
      this.store.modelFor(modelName);
      this.store.findRecord(modelName, id);
    } catch (error) {
      this.logger.error(error);
    }
    this.logger.debug(`Pulling ${modelName}: ${id}`);
  }
}
