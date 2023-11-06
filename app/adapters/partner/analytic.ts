import commondrf from '../commondrf';

export default class PartnerAnalyticAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partners/${this.organization.selected?.id}/analytics`
    );
  }

  async getDownloadURL(filter: string) {
    const url = `${this._buildURL()}/download_url`;

    return await this.ajax(url, 'GET', {
      data: filter,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/analytic': PartnerAnalyticAdapter;
  }
}
