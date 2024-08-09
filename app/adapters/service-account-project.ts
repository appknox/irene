import CommonDRFAdapter from './commondrf';
import { underscore } from '@ember/string';
import type ModelRegistry from 'ember-data/types/registries/model';

type ServiceAccountProjectQueryPayload = {
  serviceAccountId: string;
};

export default class ServiceAccountProjectAdapter extends CommonDRFAdapter {
  pathForType(type: keyof ModelRegistry) {
    return underscore(super.pathForType(type));
  }

  urlForQuery<K extends keyof ModelRegistry>(
    { serviceAccountId }: ServiceAccountProjectQueryPayload,
    modelName: K
  ): string {
    return this.buildURL('service-account', serviceAccountId).concat(
      `/${this.pathForType(modelName)}`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'service-account-project': ServiceAccountProjectAdapter;
  }
}
