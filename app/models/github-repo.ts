import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import ProjectModel from 'irene/models/project';

export interface GithubRepoDetails {
  full_name: string;
  html_url: string;
  name: string;
  owner: Owner;
}

export interface Owner {
  name: null;
  login: string;
  avatar_url: string;
  html_url: string;
}

export default class GithubRepoModel extends Model {
  @attr('string')
  declare account: string;

  @attr('string')
  declare repo: string;

  @attr('number')
  declare riskThreshold: number;

  @attr('string')
  declare title: string;

  @attr()
  declare repoDetails: GithubRepoDetails;

  @belongsTo('project')
  declare project: AsyncBelongsTo<ProjectModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'github-repo': GithubRepoModel;
  }
}
