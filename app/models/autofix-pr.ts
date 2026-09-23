import Model, { attr } from '@ember-data/model';

export interface AutofixPRCommit {
  id: number;
  file: number;
  commit_sha: string;
  patched_files: string[];
  created_on: string;
}

export default class AutofixPRModel extends Model {
  @attr('number')
  declare project: number;

  @attr('string')
  declare repo: string;

  @attr('string')
  declare baseBranch: string;

  @attr('string')
  declare branch: string;

  @attr('string')
  declare prUrl: string;

  @attr()
  declare commits: AutofixPRCommit[];

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'autofix-pr': AutofixPRModel;
  }
}
