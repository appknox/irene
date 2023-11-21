import commondrf from '../commondrf';

export default class PartnerclientPlanAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${id}/plan`
    );
  }

  async transferScans(id: string | number, data: { count: number }) {
    const url = `${this.buildURLFromBase(
      this.namespace_v2
    )}/partnerclients/${id}/transfer_scans`;

    return await this.ajax(url, 'POST', {
      data,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-plan': PartnerclientPlanAdapter;
  }
}
