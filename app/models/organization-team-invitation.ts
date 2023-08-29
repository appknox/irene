import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class OrganizationTeamInvitationModel extends Model {
  @attr('string')
  declare email: string;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @belongsTo('organization')
  declare organization: AsyncBelongsTo<OrganizationModel>;

  async delete() {
    const invite = await this.store.findRecord(
      'organization-invitation',
      this.id
    );

    invite.deleteRecord();
    this.deleteRecord();

    return invite.save();
  }

  async resend() {
    const invite = await this.store.findRecord(
      'organization-invitation',
      this.id
    );

    await invite.resend();
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-team-invitation': OrganizationTeamInvitationModel;
  }
}
