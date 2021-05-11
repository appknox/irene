import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';

export default class ClientInviteModel extends Model {
  @attr('date') expiresOn;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') email;
  @attr('string') registrationType;
  @attr('string') company;
  @attr('boolean') isTrial;
  @attr('boolean') approved;
  @attr('date') createdOn;
  @attr('date') updatedOn;

  @computed('firstName', 'lastName', function () {
    return this.firstName.charAt(0) + this.lastName.charAt(0);
  })
  thumbnail;

  @computed('firstName', 'lastName', function () {
    return `${this.firstName} ${this.lastName}`;
  }) fullName;

  async resendInvitation(inviteId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return await adapter.resendInvitation(this, inviteId);
  }
}
