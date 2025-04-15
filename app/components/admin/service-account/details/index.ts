import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';

import type ServiceAccountModel from 'irene/models/service-account';
import type ServiceAccountService from 'irene/services/service-account';

export interface ServiceAccountDetailsSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
  };
}

export default class ServiceAccountDetailsComponent extends Component<ServiceAccountDetailsSignature> {
  @service declare router: RouterService;

  @service('service-account')
  declare serviceAccountService: ServiceAccountService;

  @tracked anchorRef: HTMLElement | null = null;

  willDestroy(): void {
    super.willDestroy();

    // reset temp secret access key on page destroy
    this.serviceAccountService.tempSecretAccessKey = null;
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
    this.router.transitionTo('authenticated.admin.service-account.index');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::Details': typeof ServiceAccountDetailsComponent;
  }
}
