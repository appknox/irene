import CommonDRFAdapter from './commondrf';

export default class FileHealthScoreAuditAdapter extends CommonDRFAdapter {
  _buildURL(_: string | number, id: string | number) {
    const baseurl = `${this.namespace_v3}/files`;

    return this.buildURLFromBase(
      `${baseurl}/${encodeURIComponent(id)}/health_score_audit`
    );
  }

  urlForQueryRecord(id: string | number, modelName: string | number) {
    return this._buildURL(modelName, id);
  }

  urlForFindRecord(id: string | number) {
    return this._buildURL('file-health-score-audit', id);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'file-health-score-audit': FileHealthScoreAuditAdapter;
  }
}
