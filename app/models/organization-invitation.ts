import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';
import OrganizationTeamModel from './organization-team';

export default class OrganizationInvitationModel extends Model {
  @attr('string')
  declare email: string;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @belongsTo('organization-team')
  declare team: AsyncBelongsTo<OrganizationTeamModel>;

  @belongsTo('organization')
  declare organization: AsyncBelongsTo<OrganizationModel>;

  resend() {
    const adapter = this.store.adapterFor('organization-invitation');

    return adapter.resend(this.store, 'organization-invitation', this);
  }

  delete() {
    this.deleteRecord();

    return this.save();
  }
}
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-invitation': OrganizationInvitationModel;
  }
}
