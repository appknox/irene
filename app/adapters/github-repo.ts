/* eslint-disable ember/use-ember-data-rfc-395-imports */
import commondrf from './commondrf';
import { Snapshot } from '@ember-data/store';
import ModelRegistry from 'ember-data/types/registries/model';

export default class GithubRepo extends commondrf {
  _buildURL(modelName: string | number, id: string) {
    const baseurl = `${this.namespace}/projects/${id}/github`;

    return this.buildURLFromBase(baseurl);
  }

  urlForCreateRecord<K extends keyof ModelRegistry>(
    modelName: string | number,
    snapshot: Snapshot<K>
  ) {
    return this._buildURL(modelName, snapshot.record.project.get('id'));
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'github-repo': GithubRepo;
  }
}
