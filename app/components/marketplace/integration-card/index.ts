import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';

import MeService from 'irene/services/me';

interface MarketplaceIntegrationCardSignature {
  Args: {
    data: {
      link: string;
      title: string;
      logo: string;
      description: string;
    };
  };
}

export default class MarketplaceIntegrationCardComponent extends Component<MarketplaceIntegrationCardSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  @action
  showIntegrationsPermissionDenied() {
    this.notify.error(this.intl.t('integrationsPermissionDenied'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Marketplace::IntegrationCard': typeof MarketplaceIntegrationCardComponent;
  }
}
