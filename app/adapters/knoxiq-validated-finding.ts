import CommonDRFAdapter from './commondrf';

export type KnoxiqValidatedFindingQuery = {
  analysisId?: string | number;
  limit?: number;
  offset?: number;
};

export default class KnoxiqValidatedFindingAdapter extends CommonDRFAdapter {
  urlForQuery(query: KnoxiqValidatedFindingQuery) {
    const { analysisId } = query;

    delete query.analysisId;

    const url = `${this.namespace}/knoxiq/analyses/${analysisId}/findings`;

    return this.buildURLFromBase(url);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'knoxiq-validated-finding': KnoxiqValidatedFindingAdapter;
  }
}
