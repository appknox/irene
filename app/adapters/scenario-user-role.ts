/* eslint-disable ember/use-ember-data-rfc-395-imports */
import { underscore } from '@ember/string';
import type { Snapshot } from '@ember-data/store';
import type Store from 'ember-data/store';
import type { ModelSchema } from 'ember-data';
import type ModelRegistry from 'ember-data/types/registries/model';

import commondrf from './commondrf';
import type ScenarioUserRoleModel from 'irene/models/scenario-user-role';

interface ScenarioUserRoleQuery {
  projectId: string | number;
  scenarioId: string | number;
  id: string | number;
}

export default class ScenarioUserRoleAdapter extends commondrf {
  namespace = this.namespace_v2;

  _buildNestedURL(
    projectId: string | number,
    scenarioId: string | number,
    id?: string | number
  ) {
    const projectAdapter = this.store.adapterFor('project');
    const projectURL = projectAdapter._buildURL('project', projectId);
    let rolesURL = `${projectURL}/scenarios/${encodeURIComponent(scenarioId)}/roles`;

    rolesURL = rolesURL.replace(this.namespace_v3, this.namespace_v2);

    return id ? `${rolesURL}/${encodeURIComponent(id)}` : rolesURL;
  }

  pathForType(type: keyof ModelRegistry) {
    return underscore(type.toString());
  }

  getOptionsFromSnapshot(snapshot: Snapshot<keyof ModelRegistry>) {
    return snapshot.adapterOptions as Omit<ScenarioUserRoleQuery, 'id'>;
  }

  urlForQuery<K extends string | number>(
    query: Partial<ScenarioUserRoleQuery>,
    modelName: K
  ) {
    if (query.projectId && query.scenarioId) {
      return this._buildNestedURL(query.projectId, query.scenarioId);
    }

    return super.urlForQuery(query, modelName);
  }

  updateRecord<K extends keyof ModelRegistry>(
    _: Store,
    _type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const { projectId, scenarioId } = this.getOptionsFromSnapshot(snapshot);
    const { name } = snapshot.record as ScenarioUserRoleModel;
    const url = this._buildNestedURL(projectId, scenarioId, snapshot.id);

    return this.ajax(url, 'PUT', { data: { name } });
  }

  urlForDeleteRecord<K extends keyof ModelRegistry>(
    id: string,
    _modelName: K,
    snapshot: Snapshot<K>
  ) {
    const { projectId, scenarioId } = this.getOptionsFromSnapshot(snapshot);

    return this._buildNestedURL(projectId, scenarioId, id);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'scenario-user-role': ScenarioUserRoleAdapter;
  }
}
