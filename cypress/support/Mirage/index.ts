import { Instantiate, Model, Server } from 'miragejs';
import { ModelDefinition } from 'miragejs/-types';

import { MIRAGE_FACTORIES, MirageFactoryDefProps } from './factories.config';

class MirageE2EServer {
  private instance: Server | null = null;

  /**
   * Creates a server instance
   */
  createServer() {
    if (this.instance) {
      return this.instance;
    }

    const server = new Server({
      factories: MIRAGE_FACTORIES,
      models: Object.keys(MIRAGE_FACTORIES).reduce(
        (models, currFactory) => ({ ...models, [currFactory]: Model }),
        {} as Record<keyof typeof MIRAGE_FACTORIES, ModelDefinition>
      ),
      routes() {},
    });

    this.instance = server;

    return server;
  }

  /**
   * Shuts down Mirage server
   */
  shutdown() {
    if (!this.instance) {
      return;
    }

    this.instance.shutdown();
    this.instance = null;
  }

  /**
   * Points to the current DB instance
   * @returns null if no server instance is created
   * @returns DB instance if server is created
   */
  get db() {
    return this.instance?.db || null;
  }

  /**
   * Create a single of record for a particular model
   */
  createRecord<T extends keyof MirageFactoryDefProps>(
    modelName: T,
    propertyOverride?: object
  ) {
    if (!this.instance) {
      this.createServer();
    }

    return (this.instance?.create(modelName, propertyOverride) ||
      {}) as Instantiate<MirageFactoryDefProps, T>;
  }

  /**
   * Create an array of records for a particular model
   */
  createRecordList<T extends keyof MirageFactoryDefProps>(
    modelName: T,
    size = 5
  ) {
    if (!this.instance) {
      this.createServer();
    }

    return (this.instance?.createList(modelName, size) || []) as Array<
      Instantiate<MirageFactoryDefProps, T>
    >;
  }
}

const mirageServer = new MirageE2EServer();

export { mirageServer, MirageFactoryDefProps };
