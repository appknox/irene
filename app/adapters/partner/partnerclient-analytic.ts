import commondrf from '../commondrf';

export default class PartnerPartnerclientAnalyticAdapter extends commondrf {
  _buildURL(modelName: string | null, id: string | number | undefined) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${id}/analytics`
    );
  }

  urlForQueryRecord(q: { id: string | number | undefined }) {
    const id = q.id;
    q.id = undefined;

    return this._buildURL(null, id);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-analytic': PartnerPartnerclientAnalyticAdapter;
  }
}
