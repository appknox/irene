/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class OrganizationMeModel extends Model {
  @attr('boolean')
  declare is_admin: boolean;

  @attr('boolean')
  declare is_owner: boolean;

  @computed('is_admin', 'is_owner')
  get is_member() {
    return !this.is_admin && !this.is_owner;
  }

  @attr('boolean')
  declare can_access_partner_dashboard: boolean;

  @attr('boolean')
  declare has_security_permission: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-me': OrganizationMeModel;
  }
}
