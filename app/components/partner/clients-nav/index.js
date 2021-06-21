import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PartnerClientNavComponent extends Component {
  @service intl;
  @service router;
  @service partner;

  get tabs() {
    return [
      {
        id: 'overview',
        label: this.intl.t('overview'),
        enabled: true,
        link: 'authenticated.partner.clients.overview',
      },
      {
        id: 'invitations',
        label: this.intl.t('invitations'),
        enabled: true,
        link: 'authenticated.partner.clients.invitations',
      },
      {
        id: 'registration-requests',
        label: this.intl.t('registrationRequests'),
        enabled: this.partner.access.admin_registration,
        link: 'authenticated.partner.clients.registration-requests',
      },
    ];
  }

  get currentRoute() {
    return this.router.currentRoute.name;
  }
}
