import commondrf from '../commondrf';

export default class PartnerPartnerclientAnalyticAdapter extends commondrf {
  _buildURL(modelName, id) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${id}/analytics`
    );
  }

  urlForQueryRecord(q) {
    const id = q.id;
    q.id = undefined;
    return this._buildURL(null, id);
  }
}
