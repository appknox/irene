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
  @service('browser/window') declare window: Window;

  get displayName() {
    const { context } = this.args;

    if (context.name) {
      return context.name;
    }

    const parts = context.component_name.split('::');

    return parts[1] || context.component_name;
  }

  @action
  viewComponent() {
    this.router.transitionTo(
      'authenticated.dashboard.sbom.component-inventory',
      { queryParams: { component_query: this.args.context.component_name } }
    );
  }

  @action
  viewDirectory() {
    const url = this.args.context.registry_url;

    if (url) {
      this.window.open(url, '_blank');
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sbom-comp-update': typeof NotificationsPageMessagesNfSbomCompUpdateComponent;
  }
}
