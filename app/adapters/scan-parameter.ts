// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import ModelRegistry from 'ember-data/types/registries/model';
import commondrf from './commondrf';
import { underscore } from '@ember/string';

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
