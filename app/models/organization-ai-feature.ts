import Model, { attr } from '@ember-data/model';

export default class OrganizationAiFeatureModel extends Model {
  @attr()
  declare reporting: boolean;

  @attr()
  declare pii: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-ai-feature': OrganizationAiFeatureModel;
  }
}
