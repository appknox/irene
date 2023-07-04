import Model, { attr } from '@ember-data/model';

export default class DynamicscanModel extends Model {
  @attr('boolean')
  declare apiScan: boolean;

  @attr()
  declare apiUrls: unknown;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('date')
  declare expiresOn: Date;

  @attr('number')
  declare deviceType: number;

  @attr('number')
  declare dynamicStatus: number;

  @attr('number')
  declare platform: number;

  @attr('string')
  declare platformVersion: string;

  @attr('string')
  declare proxyHost: string;

  @attr('string')
  declare proxyPort: string;

  async extendTime(time: number) {
    const adapter = this.store.adapterFor('dynamicscan');

    return await adapter.extendTime(this, time);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    dynamicscan: DynamicscanModel;
  }
}
