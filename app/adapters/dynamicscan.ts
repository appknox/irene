import commondrf from './commondrf';
import type DynamicscanModel from 'irene/models/dynamicscan';

export default class DynamicscanAdapter extends commondrf {
  namespace = this.namespace_v2;

  extendTime(modelName: string, snapshot: DynamicscanModel, time: number) {
    const id = snapshot.id;
    const url = this.buildURL(modelName, id);

    return this.ajax(url, 'PUT', {
      data: { time },
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    dynamicscan: DynamicscanAdapter;
  }
}
