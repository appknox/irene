import commondrf from './commondrf';

export default class GDPR extends commondrf {
  _buildURL(modelName: string | number, id: string) {
    const baseurl = `${this.namespace}/v2/gdprs`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    gdpr: GDPR;
  }
}
