import commondrf from '../commondrf';

export type SecurityAnalysisFindingQuery = {
  analysisId?: string | number;
  limit?: number;
  offset?: number;
};

export default class SecurityAnalysisFindingAdapter extends commondrf {
  urlForQuery(query: SecurityAnalysisFindingQuery) {
    const { analysisId } = query;

    delete query.analysisId;

    return this.buildURLFromBase(
      `${this.hudson_namespace}/analyses/${analysisId}/findings`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/analysis-finding': SecurityAnalysisFindingAdapter;
  }
}
