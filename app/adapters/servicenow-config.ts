/* eslint-disable ember/use-ember-data-rfc-395-imports */
import CommondrfNestedAdapter from './commondrf-nested';
import Store, { type Snapshot } from '@ember-data/store';
import type { ModelSchema } from 'ember-data';
import type ModelRegistry from 'ember-data/types/registries/model';
import type ServiceNowConfigModel from 'irene/models/servicenow-config';

export default class ServiceNowConfigAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/servicenow`);
  }

  updateRecord<K extends keyof ModelRegistry>(
    _: Store,
    _type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const { riskThreshold } = snapshot.record as ServiceNowConfigModel;
    const url = this._buildURL();

    return this.ajax(url, 'POST', {
      data: { risk_threshold: riskThreshold },
    });
  }

  setNestedUrlNamespace(projectId: string) {
    this.namespace = `/api/projects/${projectId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'servicenow-config': ServiceNowConfigAdapter;
  }
}
