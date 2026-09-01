import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';

import { type NfSbomVulnUpdateContext } from './context';

export interface NotificationsPageMessagesNfSbomVulnUpdateComponentArgs {
  Args: {
    context: NfSbomVulnUpdateContext;
  };
}

export default class NotificationsPageMessagesNfSbomVulnUpdateComponent extends Component<NotificationsPageMessagesNfSbomVulnUpdateComponentArgs> {
  @service declare router: RouterService;

  @action
  viewComponent() {
    this.router.transitionTo(
      'authenticated.dashboard.sbom.component-inventory',
      { queryParams: { component_query: this.args.context.component_name } }
    );
  }

  @action
  viewDirectory() {
    this.router.transitionTo('authenticated.dashboard.sbom.apps');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sbom-vuln-update': typeof NotificationsPageMessagesNfSbomVulnUpdateComponent;
  }
}
