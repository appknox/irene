import Model, { attr } from '@ember-data/model';

export default class SkDiscoveryModel extends Model {
  @attr('number')
  declare skOrganization: number;

  @attr('string')
  declare queryStr: string;

  @attr('boolean')
  declare continuousDiscovery: boolean;

  @attr()
  declare query: { q: string };
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-discovery': SkDiscoveryModel;
  }
}
