import commondrf from '../commondrf';

export default class PartnerAnalyticAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partners/${this.organization.selected.id}/analytics`
    );
  }

  getDownloadURL(filter) {
    const url = `${this._buildURL()}/download`;
    return this.ajax(url, 'GET', {
      data: filter,
    });
  }
}
