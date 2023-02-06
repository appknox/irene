import Model, { attr } from '@ember-data/model';

export default class OrganizationJiraProjectModel extends Model {
  @attr('string')
  declare key: string;

  @attr('string')
  declare name: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-jiraproject': OrganizationJiraProjectModel;
  }
}
