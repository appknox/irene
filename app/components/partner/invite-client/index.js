import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import { task } from 'ember-concurrency';
import {
  validatePresence,
  validateFormat,
  validateLength,
} from 'ember-changeset-validations/validators';

export default class PartnerInviteClient extends Component {
  @service intl;
  @service store;
  @service realtime;
  @service organization;
  @service('notifications') notify;

  @tracked showInviteModal = false;
  @tracked changeset = {};
  @tracked invitePOJO = {
    email: '',
    company: '',
    first_name: '',
    last_name: '',
  };

  inviteClientEndpoint = `v2/partners/${this.organization.selected.id}/registration_requests`;

  get inviteClientValidator() {
    return {
      email: validateFormat({ type: 'email' }),
      company: [validatePresence(true), validateLength({ max: 255 })],
      first_name: validateLength({ allowBlank: true, max: 150 }),
      last_name: validateLength({ allowBlank: true, max: 150 }),
    };
  }

  @action
  initForm() {
    this.changeset = new Changeset(
      this.invitePOJO,
      lookupValidator(this.inviteClientValidator),
      this.inviteClientValidator
    );
  }

  @action
  toggleInviteModal() {
    this.showInviteModal = !this.showInviteModal;
  }

  @task(function* (data) {
    const body = {
      email: data.email,
      data: {
        company: data.company,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    };
    const invitation = this.store.createRecord(
      'partner/registration-request',
      body
    );
    try {
      yield invitation.save();
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(this.intl.t('invitationSent'));
      this.toggleInviteModal();
    } catch (err) {
      invitation.get('errors').forEach((attrObj) => {
        this.changeset.addError(attrObj.attribute, attrObj.message);
      });
    }
  })
  submitInviteToServer;

  @task(function* (changeset) {
    yield changeset.validate();
    if (changeset.get('isValid')) {
      const email = changeset.get('email');
      const companyName = changeset.get('company');
      const firstName = changeset.get('first_name', '');
      const lastName = changeset.get('last_name', '');
      const data = {
        email: email,
        company: companyName,
        first_name: firstName,
        last_name: lastName,
      };
      yield this.submitInviteToServer.perform(data);
    } else {
      this.notify.error('Please enter correct input and try again');
    }
  })
  sendInvite;

  @action
  sendInvitation(changeset) {
    this.sendInvite.perform(changeset);
  }
}
