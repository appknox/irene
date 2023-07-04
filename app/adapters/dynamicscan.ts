import DynamicscanModal from 'irene/models/dynamicscan';
import commondrf from './commondrf';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import ModelRegistry from 'ember-data/types/registries/model';

export default class DynamicscanAdapter extends commondrf {
  pathForType(type: keyof ModelRegistry) {
    return type.toString();
  }

  extendTime(snapshot: DynamicscanModal, time: number) {
    const id = snapshot.id;
    const modelName = DynamicscanModal.modelName;

    const url = this.buildURL(modelName, id) + '/extend';

    return this.ajax(url, 'POST', {
      data: { time },
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    dynamicscan: DynamicscanAdapter;
  }
}
