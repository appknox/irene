import CommonDRFAdapter from './commondrf';
import { underscore } from '@ember/string';
import type ModelRegistry from 'ember-data/types/registries/model';

import type ServiceAccountProjectModel from 'irene/models/service-account-project';

export default class ServiceAccountAdapter extends CommonDRFAdapter {
  pathForType(type: keyof ModelRegistry) {
    return underscore(super.pathForType(type));
  }

  async resetKey(
    modelName: keyof ModelRegistry,
    id: string,
    expiry: Date | null
  ) {
    const url = this.buildURL(modelName, id).concat('/key_reset');
    const data = { expiry };

    return await this.ajax(url, 'PUT', { data });
  }

  async addProject(
    modelName: keyof ModelRegistry,
    id: string,
    projectId: number
  ): Promise<ServiceAccountProjectModel> {
    const url = this.buildURL(modelName, id).concat(
      '/service_account_projects'
    );

    const data = {
      project_id: projectId,
    };

    return await this.ajax(url, 'POST', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'service-account': ServiceAccountAdapter;
  }
}
