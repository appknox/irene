import Model, { attr } from '@ember-data/model';

export default class OrganizationEmailDomainModel extends Model {
  @attr('string')
  declare domainName: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-email-domain': OrganizationEmailDomainModel;
  }
}
