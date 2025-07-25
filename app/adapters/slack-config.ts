/* eslint-disable ember/use-ember-data-rfc-395-imports */
import CommondrfNestedAdapter from './commondrf-nested';
import Store, { type Snapshot } from '@ember-data/store';
import type { ModelSchema } from 'ember-data';
import type ModelRegistry from 'ember-data/types/registries/model';
import type SlackConfigModel from 'irene/models/slack-config';

export default class SlackConfigAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/slack`);
  }

  updateRecord<K extends keyof ModelRegistry>(
    _: Store,
    _type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const { riskThreshold } = snapshot.record as SlackConfigModel;
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
    'slack-config': SlackConfigAdapter;
  }
}
