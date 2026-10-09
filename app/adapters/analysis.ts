import commondrf from './commondrf';

import type AnalysisModel from 'irene/models/analysis';

export interface AnalysisSla {
  enabled: boolean;
  remediation_deadline: string | null;
}

export default class AnalysisAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      const baseurl = `${this.namespace_v2}/analyses`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }

  getSla(modelInstance: AnalysisModel): Promise<AnalysisSla> {
    const url = `${this._buildURL('analysis', modelInstance.id)}/sla`;

    return this.ajax(url, 'GET');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    analysis: AnalysisAdapter;
  }
}
