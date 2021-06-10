import commondrf from '../commondrf';

export default class PartnerclientPlanAdapter extends commondrf {
  buildURL(modelName, id) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${id}/plan`
    );
  }

  async transferScans(id, data) {
    const url = `${this.buildURLFromBase(
      this.namespace_v2
    )}/partnerclients/${id}/transfer_scans`;
    return await this.ajax(url, 'POST', {
      data,
    });
  }
}
