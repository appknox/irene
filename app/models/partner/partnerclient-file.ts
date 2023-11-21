import Model, { attr } from '@ember-data/model';
export type PartnerclientFileModelName = 'partner/partnerclient-file';

export default class PartnerclientFileModel extends Model {
  private modelName =
    PartnerclientFileModel.modelName as PartnerclientFileModelName;

  @attr('string')
  declare name: string;

  @attr('date')
  declare createdOn: Date;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare versionCode: string;

  async createReport(clientId: string, id: string, data: object) {
    const adapter = this.store.adapterFor(this.modelName);

    await adapter.createReport(
      PartnerclientFileModel.modelName,
      clientId,
      id,
      data
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-file': PartnerclientFileModel;
  }
}
