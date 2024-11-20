import CommonDRFAdapter from './commondrf';

export default class UnknownAnalysisStatus extends CommonDRFAdapter {
  urlForQueryRecord() {
    const baseurl = `${this.namespace_v2}/sk_app/check_approval_status`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-inventory-approval-status': UnknownAnalysisStatus;
  }
}
