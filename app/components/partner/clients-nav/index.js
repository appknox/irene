import Component from '@glimmer/component';
import { inject } from '@ember/service';

export default class PartnerClientNavComponent extends Component {
  @inject intl;
  @inject router;
  @inject partner;

  tabs = [
    {
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
}
