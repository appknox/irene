/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model from '@ember-data/model';
import { computed } from '@ember/object';

export default class OrganizationTeamMemberModel extends Model {
  @computed('id', 'store')
  get user() {
    return this.store.findRecord('organization-user', this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-team-member': OrganizationTeamMemberModel;
  }
}
