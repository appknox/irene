import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import ProjectModel from 'irene/models/project';

export default class JiraRepoModel extends Model {
  @attr('string')
  declare project_name: string;

  @attr('string')
  declare project_key: string;

  @attr('number')
  declare risk_threshold: number;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'jira-repo': JiraRepoModel;
  }
}
