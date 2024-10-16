import Model, { attr } from '@ember-data/model';

export default class SkDiscoveryModel extends Model {
  @attr('number')
  declare sk_organization: number;

  @attr('string')
  declare query_str: string;

  @attr('boolean')
  declare continuous_discovery: boolean;

  @attr()
  declare query: { q: string };

  @attr()
  declare results: any;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-discovery': SkDiscoveryModel;
  }
}
