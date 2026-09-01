import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';

import { type NfSbomCompUpdateContext } from './context';

export interface NotificationsPageMessagesNfSbomCompUpdateComponentArgs {
  Args: {
    context: NfSbomCompUpdateContext;
  };
}

export default class NotificationsPageMessagesNfSbomCompUpdateComponent extends Component<NotificationsPageMessagesNfSbomCompUpdateComponentArgs> {
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
    'notifications-page/messages/nf-sbom-comp-update': typeof NotificationsPageMessagesNfSbomCompUpdateComponent;
  }
}
