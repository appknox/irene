import { Model, Server } from 'miragejs';
import { ModelDefinition } from 'miragejs/-types';

import { MIRAGE_FACTORIES } from './factories.config';
import seeds from './seeds.config';

class MirageE2EServer {
  private instance: Server | null = null;

  createServer() {
    if (this.instance) {
      return this.instance;
    }

    const server = new Server({
      seeds,
      factories: MIRAGE_FACTORIES,
      models: Object.keys(MIRAGE_FACTORIES).reduce(
        (models, currFactory) => ({ ...models, [currFactory]: Model }),
        {} as Record<keyof typeof MIRAGE_FACTORIES, ModelDefinition>
      ),
      routes() {},
    });

    this.instance = server;
  }

  shutdown() {
    if (!this.instance) {
      return;
    }

    this.instance.shutdown();
    this.instance = null;
  }

  get db() {
    return this.instance?.db || null;
  }

  createRecord(
    modelName: keyof typeof MIRAGE_FACTORIES,
    propertyOverride?: object
  ) {
    if (!this.instance) {
      this.createServer();
    }

    return (this.instance?.create(modelName, propertyOverride).attrs ||
      {}) as Record<string, unknown>;
  }

  createRecordList(modelName: keyof typeof MIRAGE_FACTORIES, size = 5) {
    if (!this.instance) {
      this.createServer();
    }

    return (this.instance?.createList(modelName, size).map((_) => _.attrs) ||
      []) as Array<Record<string, unknown>>;
  }
}

const mirageServer = new MirageE2EServer();

export { mirageServer };
