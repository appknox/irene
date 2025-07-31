import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import type ProjectModel from 'irene/models/project';

export default class SlackConfigModel extends Model {
  @attr('number')
  declare riskThreshold: number;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'slack-config': SlackConfigModel;
  }
}
