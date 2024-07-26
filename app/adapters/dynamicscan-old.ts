import DynamicscanOldModel from 'irene/models/dynamicscan-old';
import commondrf from './commondrf';

export default class DynamicscanOldAdapter extends commondrf {
  _buildURL(_: string | null, id: string | number) {
    const baseurl = `${this.namespace}/dynamicscan`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  extendTime(snapshot: DynamicscanOldModel, time: number) {
    const id = snapshot.id;
    const modelName = 'dynamicscan';

    const url = this.buildURL(modelName, id) + '/extend';

    return this.ajax(url, 'POST', {
      data: { time },
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'dynamicscan-old': DynamicscanOldAdapter;
  }
}
