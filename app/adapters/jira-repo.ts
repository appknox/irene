/* eslint-disable ember/use-ember-data-rfc-395-imports */
import commondrf from './commondrf';
import { Snapshot } from '@ember-data/store';
import ModelRegistry from 'ember-data/types/registries/model';

export default class JiraRepo extends commondrf {
  _buildURL(modelName: string | number, id: string) {
    const baseurl = `${this.namespace}/projects/${id}/jira`;
    return this.buildURLFromBase(baseurl);
  }

  urlForCreateRecord<K extends keyof ModelRegistry>(
    modelName: string | number,
    snapshot: Snapshot<K>
  ) {
    return this._buildURL(modelName, snapshot.id);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'jira-repo': JiraRepo;
  }
}
