/* eslint-disable ember/use-ember-data-rfc-395-imports */
import commondrf from './commondrf';
import { ModelSchema } from 'ember-data';
import ModelRegistry from 'ember-data/types/registries/model';
import { underscore } from '@ember/string';
import Store from 'ember-data/store';
import { Snapshot } from '@ember-data/store';
import ScanParameterModel from 'irene/models/scan-parameter';

interface ScanParameterQuery {
  groupId?: string | number;
  id?: string;
}

export default class ScanParameterAdapter extends commondrf {
  namespace = this.namespace_v2;

  scanParameterBaseUrl = this.buildURLFromBase(
    `${this.namespace}/scan_parameters`
  );

  pathForType(type: keyof ModelRegistry) {
    return underscore(type.toString());
  }

  _buildNestedURL(
    _: string | number,
    groupId: string | number,
    id?: string | number
  ) {
    const sPGroupAdapter = this.store.adapterFor('scan-parameter-group');
    const spGroupURL = sPGroupAdapter.urlForFindRecord(groupId);
    const scanParameterURL = `${spGroupURL}/scan_parameters`;

    if (id) {
      return `${scanParameterURL}/${encodeURIComponent(id)}`;
    }

    return scanParameterURL;
  }

  updateRecord<K extends keyof ModelRegistry>(
    _: Store,
    type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const { scenarioId } = snapshot.adapterOptions as { scenarioId: string };
    const { name, value, isSecure } = snapshot.record as ScanParameterModel;
    const url = this._buildNestedURL(type.modelName, scenarioId, snapshot.id);

    return this.ajax(url, 'PUT', {
      data: { name, value, is_secure: isSecure },
    });
  }

  urlForDeleteRecord<K extends keyof ModelRegistry>(
    id: string,
    modelName: K,
    snapshot: Snapshot<K>
  ) {
    const options = snapshot.adapterOptions as { scenarioId: string };

    return this._buildNestedURL(modelName, options.scenarioId, id);
  }

  urlForCreateRecord<K extends keyof ModelRegistry>(
    modelName: K,
    snapshot: Snapshot<K>
  ): string {
    const options = snapshot.adapterOptions as { scenarioId: string };

    return this._buildNestedURL(modelName, options.scenarioId);
  }

  urlForQuery<K extends string | number>(
    query: ScanParameterQuery,
    modelName: K
  ) {
    if (query.groupId) {
      return this._buildNestedURL(modelName, query.groupId);
    }

    return super.urlForQuery(query, modelName);
  }

  urlForQueryRecord(query: ScanParameterQuery, modelName: string | number) {
    if (query.groupId) {
      return this._buildNestedURL(modelName, query.groupId, query.id);
    }

    return this.buildURL(modelName, query.id);
  }

  urlForFindRecord(id: string | number) {
    return `${this.scanParameterBaseUrl}/${id}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'scan-parameter': ScanParameterAdapter;
  }
}
