import commondrf from '../commondrf';

type PartnerAnalyticDownloadFilterOptions = {
  start_timestamp: string;
  end_timestamp: string;
};

export default class PartnerAnalyticAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partners/${this.organization.selected?.id}/analytics`
    );
  }

  async getDownloadURL(filter: PartnerAnalyticDownloadFilterOptions) {
    const url = `${this._buildURL()}/download_url`;

    return (await this.ajax(url, 'GET', { data: filter })) as { csv: string };
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/analytic': PartnerAnalyticAdapter;
  }
}
