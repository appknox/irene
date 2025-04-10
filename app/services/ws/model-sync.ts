import Service from '@ember/service';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import { singularize } from 'ember-inflector';

import type Store from '@ember-data/store';
import type LoggerService from '../logger';
import WsCoreService, { WsEventType, type ObjectEvent } from './core';

export interface ModelLoadEvent<T extends object> {
  modelName: string;
  id: string;
  model: T;
}

export type ModelLoadHandler<T extends object> = {
  modelName: string;
  handler: (event: ModelLoadEvent<T>) => void;
};

// Model name wrapper type
type ModelNameIdMapper = Record<string, { modelName: string; id: string }>;

export default class WsModelSyncService extends Service {
  @service declare store: Store;
  @service declare logger: LoggerService;
  @service('ws/core') declare wsCore: WsCoreService;

  private modelNameIdMapper: ModelNameIdMapper = {};
  private modelSyncHandlers: Set<ModelLoadHandler<any>> = new Set();

  objectEventType = WsEventType.OBJECT;
  newObjectEventType = WsEventType.NEWOBJECT;

  initialize() {
    // Subscribe to object and newobject events
    this.wsCore.on(this.objectEventType, this.handleObjectEvent);
    this.wsCore.on(this.newObjectEventType, this.handleObjectEvent);
  }

  cleanup() {
    // Remove all registered handlers
    this.modelSyncHandlers.clear();

    // Clean up subscriptions
    this.wsCore.off(this.objectEventType, this.handleObjectEvent);
    this.wsCore.off(this.newObjectEventType, this.handleObjectEvent);
  }

  // Add handler for model sync events
  addObjectEventHandler<T extends object>(handler: ModelLoadHandler<T>): void {
    this.modelSyncHandlers.add(handler);
  }

  // Remove handler for model sync events
  removeObjectHandler<T extends object>({
    modelName,
    handler,
  }: ModelLoadHandler<T>): void {
    this.modelSyncHandlers.forEach((hObj) => {
      if (hObj.modelName === modelName && handler === hObj.handler) {
        this.modelSyncHandlers.delete(hObj);
      }
    });
  }

  // Emit model load event
  private emitModelLoad<T extends object>(event: ModelLoadEvent<T>): void {
    this.modelSyncHandlers.forEach((handlerInfo) => {
      try {
        if (handlerInfo.modelName === event.modelName) {
          handlerInfo.handler(event);
        }
      } catch (error) {
        this.logger.error('Error in model load handler:', error);
      }
    });
  }

  // Handle object events from the websocket
  handleObjectEvent = (event: ObjectEvent) => {
    this.enqueuePullModel.perform(singularize(event.objectType), event.id);
  };

  // Debounce handler
  handlePullModel(mapper: ModelNameIdMapper) {
    // Reset global mapper for next set of messages
    this.modelNameIdMapper = {};

    // Pull all models from mapper
    Object.values(mapper).forEach(({ modelName, id }) => {
      this.pullModel.perform(modelName, id);
    });
  }

  // This will ensure tasks run sequentially
  enqueuePullModel = task(
    { enqueue: true },
    async (modelName: string, id: string) => {
      // Store all unique modelName & id until debounce handler
      this.modelNameIdMapper[`${modelName}-${id}`] = { modelName, id };

      // Debounce and pass copy of mapper object
      debounceTask(this, 'handlePullModel', { ...this.modelNameIdMapper }, 300);
    }
  );

  pullModel = task(async (modelName: string, id: string) => {
    try {
      this.store.modelFor(modelName);

      const model = await this.store.findRecord(modelName, id);

      // Emit the model load event
      if (model) {
        this.emitModelLoad({
          modelName,
          id,
          model,
        });
      }
    } catch (error) {
      this.logger.error(`Error pulling model ${modelName}:${id}`, error);
    }

    this.logger.debug(`Pulling ${modelName}: ${id}`);
  });
}
