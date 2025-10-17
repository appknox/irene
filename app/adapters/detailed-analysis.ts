import commondrf from './commondrf';

export default class DetailedAnalysisAdapter extends commondrf {
  get baseurl() {
    return `${this.namespace}/v2/analyses`;
  }

  _buildURL(_modelName: string, id: number | string) {
    const baseurl = this.baseurl;

    if (id) {
      return this.buildURLFromBase(
        `${baseurl}/${encodeURIComponent(id)}/detailed-analysis`
      );
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'detailed-analysis': DetailedAnalysisAdapter;
  }
}
