import Component from '@glimmer/component';
import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type { BufferedChangeset } from 'ember-changeset/types';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import PartnerInviteClientValidator from './validator';
import type RealtimeService from 'irene/services/realtime';
import type OrganizationService from 'irene/services/organization';

type PartnerInviteClientFields = {
  email: string;
  company: string;
  first_name: string;
  last_name: string;
};

type ChangesetBufferProps = BufferedChangeset &
  PartnerInviteClientFields & {
    error: {
      [key in keyof PartnerInviteClientFields]:
        | boolean
        | { validation: string };
    };
  };

export default class PartnerInviteClientComponent extends Component {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare realtime: RealtimeService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showInviteModal = false;
  @tracked changeset: ChangesetBufferProps | null = null;

  @tracked invitePOJO: PartnerInviteClientFields = {
    email: '',
    company: '',
    first_name: '',
    last_name: '',
  };

  get inviteClientEndpoint() {
    return `v2/partners/${this.organization.selected?.id}/registration_requests`;
  }

  @action
  initForm() {
    this.changeset = Changeset(
      this.invitePOJO,
      lookupValidator(PartnerInviteClientValidator),
      PartnerInviteClientValidator
    ) as ChangesetBufferProps;
  }

  @action
  toggleInviteModal() {
    this.showInviteModal = !this.showInviteModal;
  }

  @action
  sendInvitation(changeset: ChangesetBufferProps | null) {
    this.sendInvite.perform(changeset);
  }

  @action
  getHelperText(key: keyof PartnerInviteClientFields) {
    const errorValue = this.changeset?.error[key] as { validation?: string };

    return errorValue?.validation ?? '';
  }

  submitInviteToServer = task(async (data) => {
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
      await invitation.save();

      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(this.intl.t('invitationSent'));

      this.toggleInviteModal();
    } catch (err) {
      invitation.get('errors').forEach((attrObj) => {
        this.changeset?.addError(attrObj.attribute, attrObj.message);
      });
    }
  });

  sendInvite = task(async (changeset: ChangesetBufferProps | null) => {
    await changeset?.validate();

    if (changeset?.get('isValid')) {
      const email = changeset.get('email');
      const companyName = changeset.get('company');
      const firstName = changeset.get('first_name');
      const lastName = changeset.get('last_name');

      const data = {
        email: email,
        company: companyName,
        first_name: firstName,
        last_name: lastName,
      };

      await this.submitInviteToServer.perform(data);
    } else {
      this.notify.error('Please enter correct input and try again');
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::InviteClient': typeof PartnerInviteClientComponent;
  }
}
