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
  @service('browser/window') declare window: Window;

  get displayName() {
    const { context } = this.args;

    if (context.name) {
      return context.name;
    }

    const parts = context.component_name.split('::');

    return parts[1] || context.component_name;
  }

  get advisoryLinks(): Array<{ label: string; url: string }> {
    const { advisory_urls, ghsa_ids } = this.args.context;

    if (advisory_urls.length > 0) {
      return advisory_urls.map((url, i) => ({
        label: ghsa_ids[i] ?? `Advisory ${i + 1}`,
        url,
      }));
    }

    return ghsa_ids.map((id) => ({
      label: id,
      url: `https://github.com/advisories/${id}`,
    }));
  }

  get ghsaIdsDisplay() {
    return this.args.context.ghsa_ids.join(', ');
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
    const url = this.advisoryLinks[0]?.url;

    if (url) {
      this.window.open(url, '_blank');
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sbom-vuln-update': typeof NotificationsPageMessagesNfSbomVulnUpdateComponent;
  }
}
