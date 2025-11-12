/* eslint-disable ember/use-ember-data-rfc-395-imports */
import ModelRegistry from 'ember-data/types/registries/model';
import commondrf from './commondrf';
import { underscore } from '@ember/string';
import { Snapshot } from '@ember-data/store';
import Store from '@ember-data/store';
import { ModelSchema } from 'ember-data';
import ScanParameterGroupModel from 'irene/models/scan-parameter-group';

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

    let scanParameterGroupURL = `${projectURL}/scan_parameter_groups`;

    // TODO: Update to use the namespace_v3 when the API has support for it
    scanParameterGroupURL = scanParameterGroupURL.replace(
      this.namespace_v3,
      this.namespace_v2
    );

    if (id) {
      return `${scanParameterGroupURL}/${encodeURIComponent(id)}`;
    }

    return scanParameterGroupURL;
  }

  updateRecord<K extends keyof ModelRegistry>(
    _: Store,
    type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const { projectId } = snapshot.adapterOptions as { projectId: string };
    const { name, isActive, description } =
      snapshot.record as ScanParameterGroupModel;
    const url = this._buildNestedURL(type.modelName, projectId, snapshot.id);

    return this.ajax(url, 'PUT', {
      data: { name, is_active: isActive, description },
    });
  }

  urlForDeleteRecord<K extends keyof ModelRegistry>(
    id: string,
    modelName: K,
    snapshot: Snapshot<K>
  ) {
    const options = snapshot.adapterOptions as { projectId: string };

    return this._buildNestedURL(modelName, options.projectId, id);
  }

  urlForCreateRecord<K extends keyof ModelRegistry>(
    modelName: K,
    snapshot: Snapshot<K>
  ): string {
    const options = snapshot.adapterOptions as { projectId: string };

    return this._buildNestedURL(modelName, options.projectId);
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
