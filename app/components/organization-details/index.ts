import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export default class OrganizationDetailsComponent extends Component {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  get isAdmin() {
    return this.me.org?.get('is_admin');
  }

  get tabItems() {
    return [
      {
        id: 'namespaces',
        route: 'authenticated.dashboard.organization.namespaces',
        badgeCount: this.organization.selected?.namespacesCount,
        hasBadge: this.isAdmin,
        label: this.intl.t('namespaces'),
        iconName: 'assignment',
      },
      {
        id: 'users',
        route: 'authenticated.dashboard.organization.users',
        hidden: !this.isAdmin,
        badgeCount: this.organization.selected?.membersCount,
        hasBadge: true,
        label: this.intl.t('users'),
        iconName: 'group',
      },
      {
        id: 'teams',
        route: 'authenticated.dashboard.organization.teams',
        badgeCount: this.organization.selected?.teamsCount,
        hasBadge: this.isAdmin,
        label: this.intl.t('teams'),
        iconName: 'groups',
      },
    ];
  }

  @action routeToOrgSettings() {
    this.router.transitionTo('authenticated.dashboard.organization-settings');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationDetails: typeof OrganizationDetailsComponent;
  }
}
