/* eslint-disable ember/use-ember-data-rfc-395-imports */
import commondrf from '../commondrf';

import type Store from 'ember-data/store';
import type { ModelSchema } from 'ember-data';
import type { Snapshot } from '@ember-data/store';
import type ModelRegistry from 'ember-data/types/registries/model';

export type SecurityValidatedFindingQuery = {
  analysisId?: string | number;
  limit?: number;
  offset?: number;
};

export type SecurityValidatedFindingAdapterOptions = {
  analysisId: string | number;
};

export default class SecurityValidatedFindingAdapter extends commondrf {
  findingsURL(analysisId: string | number | undefined, id?: string | number) {
    const collection = `${this.namespace}/knoxiq/analyses/${analysisId}/findings`;

    return this.buildURLFromBase(id ? `${collection}/${id}` : collection);
  }

  urlForQuery(query: SecurityValidatedFindingQuery) {
    const { analysisId } = query;
    delete query.analysisId;

    return this.findingsURL(analysisId);
  }

  urlForCreateRecord<K extends keyof ModelRegistry>(
    _modelName: K,
    snapshot: Snapshot<K>
  ) {
    const { analysisId } =
      snapshot.adapterOptions as SecurityValidatedFindingAdapterOptions;

    return this.findingsURL(analysisId);
  }

  urlForUpdateRecord<K extends keyof ModelRegistry>(
    id: string,
    _modelName: K,
    snapshot: Snapshot<K>
  ) {
    const { analysisId } =
      snapshot.adapterOptions as SecurityValidatedFindingAdapterOptions;

    return this.findingsURL(analysisId, id);
  }

  urlForDeleteRecord<K extends keyof ModelRegistry>(
    id: string,
    modelName: K,
    snapshot: Snapshot<K>
  ) {
    return this.urlForUpdateRecord(id, modelName, snapshot);
  }

  /**
   * The API merges each write field independently, so an edit is a PATCH of
   * the fields the editor owns rather than a whole-resource PUT.
   */
  updateRecord<K extends keyof ModelRegistry>(
    _store: Store,
    type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const url = this.urlForUpdateRecord(
      String(snapshot.id),
      type.modelName,
      snapshot
    );

    return this.ajax(url, 'PATCH', {
      data: this.serialize(snapshot, { includeId: false }),
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/validated-finding': SecurityValidatedFindingAdapter;
  }
}
