import CommonDRFAdapter from './commondrf';
import type SkOrganizationModel from 'irene/models/sk-organization';

export type SkOrgSettingsToggleProps = {
  add_appknox_project_to_inventory_by_default?: boolean;
  auto_discovery_enabled?: boolean;
};

export default class SkOrganizationAdapter extends CommonDRFAdapter {
  _buildURL(_: string, id: string | number) {
    const baseurl = `${this.namespace_v2}/sk_organization`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  async toggleOrganizationSetting(
    modelName: string,
    id: string | number,
    data: SkOrgSettingsToggleProps
  ): Promise<SkOrganizationModel> {
    const url = this._buildURL(modelName, id);

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
