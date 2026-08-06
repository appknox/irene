import type { AsyncBelongsTo } from '@ember-data/model';
import Model, { attr, belongsTo } from '@ember-data/model';
import type OrganizationModel from './organization';
import type OrganizationTeamModel from './organization-team';

export default class OrganizationInvitationModel extends Model {
  @attr('string')
  declare email: string;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @belongsTo('organization-team', { async: true, inverse: null })
  declare team: AsyncBelongsTo<OrganizationTeamModel>;

  @belongsTo('organization', { async: true, inverse: null })
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
