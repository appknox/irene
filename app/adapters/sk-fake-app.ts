import CommonDRFAdapter from './commondrf';

import type SkFakeAppModel from 'irene/models/sk-fake-app';

export type SkFakeAppQuery = {
  sk_app_id?: string | number;
  id?: string | number;
  [key: string]: unknown;
};

export interface IgnoreFakeAppResponse {
  id: number;
  status: number;
  status_display: string;
  ignore_reason: string;
  reviewed_by: string;
  reviewed_on: string;
}

export interface AddToInventoryResponse {
  id: number;
  status: number;
  status_display: string;
  added_to_inventory_app: number;
  reviewed_by: string;
  reviewed_on: string;
}

export default class SkFakeAppAdapter extends CommonDRFAdapter {
  _buildNestedURL(skAppId: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sk_app/${skAppId}/sk_fake_app`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery<K extends string | number>(query: SkFakeAppQuery, modelName: K) {
    if (query.sk_app_id) {
      const skAppId = query.sk_app_id;

      delete query.sk_app_id;

      return this._buildNestedURL(skAppId);
    }

    return super.urlForQuery(query, modelName);
  }

  urlForQueryRecord<K extends string | number>(
    query: SkFakeAppQuery,
    modelName: K
  ) {
    if (query.sk_app_id) {
      const skAppId = query.sk_app_id;
      const id = query.id;

      delete query.sk_app_id;
      delete query.id;

      return this._buildNestedURL(skAppId, id);
    }

    return super.urlForQueryRecord(query, modelName);
  }

  async ignore(
    skFakeApp: SkFakeAppModel,
    ignoreReason: string
  ): Promise<SkFakeAppModel> {
    const skAppId = skFakeApp.belongsTo('skApp').id();
    const url = this._buildNestedURL(skAppId, skFakeApp.id).concat('/ignore');

    const response = await this.ajax(url, 'POST', {
      data: { ignore_reason: ignoreReason },
    });

    const normalized = this.store.normalize('sk-fake-app', response);

    return this.store.push(normalized) as SkFakeAppModel;
  }

  async ignoreAndAddToInventory(
    skFakeApp: SkFakeAppModel,
    ignoreReason: string
  ): Promise<SkFakeAppModel> {
    const skAppId = skFakeApp.belongsTo('skApp').id();
    const url = this._buildNestedURL(skAppId, skFakeApp.id).concat(
      '/add_to_inventory'
    );

    const response = await this.ajax(url, 'POST', {
      data: { ignore_reason: ignoreReason },
    });

    const normalized = this.store.normalize('sk-fake-app', response);

    return this.store.push(normalized) as SkFakeAppModel;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-fake-app': SkFakeAppAdapter;
  }
}
