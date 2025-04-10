import Service from '@ember/service';
import { service } from '@ember/service';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import type LoggerService from '../logger';
import type AkNotificationsService from '../ak-notifications';
import type SkNotificationsService from '../sk-notifications';

import WsCoreService, {
  WsEventType,
  type MessageEvent,
  type NotificationEvent,
} from './core';

export default class WsNotifHandlerService extends Service {
  @service declare logger: LoggerService;
  @service declare notifications: NotificationService;
  @service declare akNotifications: AkNotificationsService;
  @service declare skNotifications: SkNotificationsService;
  @service('ws/core') declare wsCore: WsCoreService;

  messageEventType = WsEventType.MESSAGE;
  notifEventType = WsEventType.NOTIFICATION;

  initialize() {
    // Subscribe to message and notification events
    this.wsCore.on(this.messageEventType, this.handleMessageEvent);
    this.wsCore.on(this.notifEventType, this.handleNotificationEvent);
  }

  cleanup() {
    // Clean up subscriptions
    this.wsCore.off(this.messageEventType, this.handleMessageEvent);
    this.wsCore.off(this.notifEventType, this.handleNotificationEvent);
  }

  handleMessageEvent = (event: MessageEvent) => {
    const { message, notifyType } = event;

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
  };

  handleNotificationEvent = (event: NotificationEvent) => {
    const { unreadCount, product } = event;

    const updateData = { unReadCount: unreadCount };

    if (product === ENUMS.NOTIF_PRODUCT.APPKNOX) {
      this.akNotifications.realtimeUpdate(updateData);
    }

    if (product === ENUMS.NOTIF_PRODUCT.STOREKNOX) {
      this.skNotifications.realtimeUpdate(updateData);
    }
  };
}
