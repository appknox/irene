import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';

import type ScenarioModel from './scenario';

export default class ScenarioUserRoleModel extends Model {
  @attr('string')
  declare name: string;

  @belongsTo('scenario', { async: true, inverse: null })
  declare scenario: AsyncBelongsTo<ScenarioModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'scenario-user-role': ScenarioUserRoleModel;
  }
}
