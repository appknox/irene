import Model, { attr } from '@ember-data/model';

export type PiiModelName = 'pii';

export interface PiiMetaData {
  value: string;
  source: string;
  url: string;
}

export default class PiiModel extends Model {
  private modelName = PiiModel.modelName as PiiModelName;

  @attr('string')
  declare sources: string;

  @attr('string')
  declare type: string;

  @attr()
  declare piiData: PiiMetaData[];

  @attr('boolean')
  declare highlight: boolean;

  async markPiiTypeSeen(id: string, type: string) {
    const adapter = this.store.adapterFor(this.modelName);

    return adapter.markPiiTypeSeen(this.modelName, id, type);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    pii: PiiModel;
  }
}
