import Model from '@ember-data/model';
import { findRecord } from 'ember-data-resources';
import OrganizationUserModel from './organization-user';
import { tracked } from 'tracked-built-ins';

export default class OrganizationTeamMemberModel extends Model {
  @tracked userRecord = findRecord<OrganizationUserModel>(
    this,
    'organization-user',
    () => this.id
  );

  get user() {
    return this.userRecord.record;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-team-member': OrganizationTeamMemberModel;
  }
}
