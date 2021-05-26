import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  action
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';

export default class PartnerClientNavComponent extends Component {
  @service intl;
  @service router;
  @service partner;
  @service store;
  @service realtime;

  tabs = [{
      label: this.intl.t('overview'),
      enabled: true,
      link: 'authenticated.partner.clients.overview'
    },
    {
      label: this.intl.t('invitations'),
      enabled: this.partner.access.invite_clients,
      link: 'authenticated.partner.clients.invitations'
    },
    {
      label: this.intl.t('registrationRequests'),
      enabled: this.partner.access.invite_clients,
      link: 'authenticated.partner.clients.registration-requests'
    },
  ];

  get currentRoute() {
    return this.router.currentRoute.name;
  }

  @tracked showInviteModal = false;

  @action
  toggleInviteModal() {
    this.showInviteModal = !this.showInviteModal;
  }

  @action
  invitationSent() {
    if (this.currentRoute == 'authenticated.partner.clients.invitations') {
      this.realtime.incrementProperty('RegistrationRequestCounter');
    }
    this.toggleInviteModal();
  }
}
