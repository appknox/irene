import Component from '@glimmer/component';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type PartnerService from 'irene/services/partner';

export default class PartnerClientsNavComponent extends Component {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare partner: PartnerService;

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
        enabled: this.partner?.access?.admin_registration,
        link: 'authenticated.partner.clients.registration-requests',
      },
    ];
  }

  get currentRoute() {
    return this.router.currentRoute.name;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientsNav': typeof PartnerClientsNavComponent;
  }
}
