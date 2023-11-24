// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import ModelRegistry from 'ember-data/types/registries/model';
import commondrf from './commondrf';
import { underscore } from '@ember/string';

interface ScanParameterGroupQuery {
  projectId?: string | number;
  id?: string | number;
}

export default class ScanParameterGroupAdapter extends commondrf {
  namespace = this.namespace_v2;
  scanParameterGroupBaseUrl = this.buildURLFromBase(
    `${this.namespace}/scan_parameter_groups`
  );

  pathForType(type: keyof ModelRegistry) {
    return underscore(type.toString());
  }

  _buildNestedURL(
    _: string | number,
    projectId: string | number,
    id?: string | number
  ) {
    const projectAdapter = this.store.adapterFor('project');
    const projectURL = projectAdapter._buildURL('project', projectId);
    const scanParameterGroupURL = `${projectURL}/scan_parameter_groups`;

    if (id) {
      return `${scanParameterGroupURL}/${encodeURIComponent(id)}`;
    }

    return scanParameterGroupURL;
  }

  urlForQuery<K extends string | number>(
    query: ScanParameterGroupQuery,
    modelName: K
  ) {
    if (query.projectId) {
      return this._buildNestedURL(modelName, query.projectId);
    }

    return super.urlForQuery(query, modelName);
  }

  urlForQueryRecord(
    query: ScanParameterGroupQuery,
    modelName: string | number
  ) {
    if (query.projectId) {
      return this._buildNestedURL(modelName, query.projectId, query.id);
    }

    return this.buildURL(modelName, query.id);
  }

  urlForFindRecord(id: string | number) {
    return `${this.scanParameterGroupBaseUrl}/${id}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'scan-parameter-group': ScanParameterGroupAdapter;
  }
}
