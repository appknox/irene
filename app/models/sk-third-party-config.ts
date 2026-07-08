import Model, { attr } from '@ember-data/model';

export default class SkThirdPartyConfigModel extends Model {
  @attr('number')
  declare frequency: number;

  @attr()
  declare regionsOpted: string[];

  @attr('number')
  declare topAppsCount: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-third-party-config': SkThirdPartyConfigModel;
  }
}
