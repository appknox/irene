import { service } from '@ember/service';
import Service from '@ember/service';

import WsCoreService, { WsEventType, type CounterEvent } from './core';
import { RealtimeCounterTypeValue } from '../realtime';
import type LoggerService from '../logger';
import type RealtimeService from '../realtime';

export interface CounterSyncEvent {
  eventName: RealtimeCounterTypeValue;
}

export type CounterSyncHandler = {
  key: RealtimeCounterTypeValue;
  handler: (event: CounterSyncEvent) => void;
};

export default class WsCounterSyncService extends Service {
  @service declare logger: LoggerService;
  @service declare realtime: RealtimeService;
  @service('ws/core') declare wsCore: WsCoreService;

  private counterSyncHandlers: Set<CounterSyncHandler> = new Set();

  initialize() {
    this.wsCore.on(WsEventType.COUNTER, this.handleCounterEvent);

    console.log('Initialize Counter Listener');
  }

  cleanup() {
    this.wsCore.off(WsEventType.COUNTER, this.handleCounterEvent);
  }

  handleCounterEvent = (event: CounterEvent) => {
    const { counterType } = event;

    this.realtime.incrementProperty(`${counterType}Counter`);

    this.logger.debug(`Realtime increment for ${counterType}`);

    this.emitCounterEvent({ eventName: counterType });
  };

  // Add handler for model sync events
  addCounterEventHandler(handler: CounterSyncHandler): void {
    this.counterSyncHandlers.add(handler);
  }

  // Remove handler for counters sync events
  removeCounterEventHandler(handler: CounterSyncHandler): void {
    this.counterSyncHandlers.forEach((hObj) => {
      if (hObj.key === handler.key && handler.handler === hObj.handler) {
        this.counterSyncHandlers.delete(hObj);
      }
    });
  }

  // Emit to counters sync event
  private emitCounterEvent({ eventName }: CounterSyncEvent): void {
    this.counterSyncHandlers.forEach((handlerInfo) => {
      try {
        if (handlerInfo.key === eventName) {
          handlerInfo.handler({ eventName });
        }
      } catch (error) {
        this.logger.error('Error in model load handler:', error);
      }
    });
  }
}
