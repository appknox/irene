import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';
import type PartnerService from 'irene/services/partner';
import UserModel from 'irene/models/user';

export interface PartnerComponentSignature {
  Element: HTMLElement;
  Args: {
    user: UserModel;
  };
  Blocks: { default: [] };
}

export default class PartnerComponent extends Component<PartnerComponentSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare organization: OrganizationService;
  @service declare partner: PartnerService;

  @tracked activeTabId = 'clients';

  get tabs() {
    return [
      {
        id: 'clients',
        label: this.intl.t('clients'),
        enabled: true,
        link: 'authenticated.partner.clients',
      },
      {
        id: 'analytics',
        label: this.intl.t('analytics'),
        enabled: this.partner.access?.view_analytics,
        link: 'authenticated.partner.analytics',
      },
    ];
  }

  get activeTab() {
    return this.tabs.find((tab) => tab.id === this.activeTabId) ?? this.tabs[0];
  }

  setDefaultTab() {
    const loadedTab = this.tabs.find(
      (tab) => tab.link === this.router.currentRouteName
    );

    if (loadedTab) {
      this.switchTab(loadedTab.id);
    }
  }

  @action initialize() {
    this.setDefaultTab();
  }

  @action switchTab(tabId: string) {
    this.activeTabId = tabId;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Partner: typeof PartnerComponent;
  }
}
