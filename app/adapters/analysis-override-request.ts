import CommonDRFAdapter from './commondrf';

export type AnalysisOverrideRequestQuery = {
  analysisId?: string | number;
};

export default class AnalysisOverrideRequestAdapter extends CommonDRFAdapter {
  _buildURL(analysisId: string | number) {
    return this.buildURLFromBase(
      `${this.namespace}/analyses/${encodeURIComponent(analysisId)}/override_requests`
    );
  }

  _buildActionURL(uuid: string, action: 'approve' | 'reject') {
    return this.buildURLFromBase(
      `${this.namespace}/override_requests/${encodeURIComponent(uuid)}/${action}`
    );
  }

  urlForQueryRecord(query: AnalysisOverrideRequestQuery) {
    const { analysisId } = query;
    delete query.analysisId;

    return this._buildURL(String(analysisId));
  }

  approve(uuid: string) {
    return this.ajax(this._buildActionURL(uuid, 'approve'), 'POST', {});
  }

  reject(uuid: string, rejectionReason: string) {
    return this.ajax(this._buildActionURL(uuid, 'reject'), 'POST', {
      data: { rejection_reason: rejectionReason },
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'analysis-override-request': AnalysisOverrideRequestAdapter;
  }
}
