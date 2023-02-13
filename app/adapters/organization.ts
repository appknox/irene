import commondrf from './commondrf';
import OrganizationModel from 'irene/models/organization';

export default class OrganizationAdapter extends commondrf {
  async saveReportPreference(modelInstance: OrganizationModel, data: object) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('organization', modelId) + '/report_preference';

    await this.ajax(url, 'PUT', { data: data });

    return this.store.findRecord('organization', modelId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    organization: OrganizationAdapter;
  }
}
