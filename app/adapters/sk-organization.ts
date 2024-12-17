import CommonDRFAdapter from './commondrf';
import type SkOrganizationModel from 'irene/models/sk-organization';

export default class SkOrganizationAdapter extends CommonDRFAdapter {
  _buildURL(_: string, id: string | number) {
    const baseurl = `${this.namespace_v2}/sk_organization`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  async toggleAddToInventoryByDefault(
    modelName: string,
    id: string | number,
    addToInventoryByDefault: boolean
  ) {
    const url = this._buildURL(modelName, id);

    const data = {
      add_appknox_project_to_inventory_by_default: addToInventoryByDefault,
    };

    const response = await this.ajax(url, 'PATCH', { data });
    const normalized = this.store.normalize('sk-organization', response);

    return this.store.push(normalized) as SkOrganizationModel;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-organization': SkOrganizationAdapter;
  }
}
