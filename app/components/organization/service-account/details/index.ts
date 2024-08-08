import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type ServiceAccountService from 'irene/services/service-account';

export interface ServiceAccountDetailsSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
  };
}

export default class ServiceAccountDetailsComponent extends Component<ServiceAccountDetailsSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @service('service-account')
  declare serviceAccountService: ServiceAccountService;

  @tracked anchorRef: HTMLElement | null = null;

  willDestroy(): void {
    super.willDestroy();

    // reset temp secret access key on page destroy
    this.serviceAccountService.tempSecretAccessKey = null;
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.organization.namespaces',
        linkTitle: this.intl.t('organization'),
      },
      {
        route: 'authenticated.dashboard.organization-settings',
        linkTitle: this.intl.t('settings'),
      },
      {
        route: 'authenticated.dashboard.organization-settings.service-account',
        linkTitle: this.intl.t('serviceAccount'),
      },
      {
        route: 'authenticated.dashboard.service-account-details',
        linkTitle: this.intl.t('viewOrEdit'),
      },
    ];
  }

  @action
  handleMoreOptionsClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleMoreOptionsClose() {
    this.anchorRef = null;
  }

  @action
  handleDeleteSuccess() {
    this.router.transitionTo(
      'authenticated.dashboard.organization-settings.service-account'
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Details': typeof ServiceAccountDetailsComponent;
  }
}
