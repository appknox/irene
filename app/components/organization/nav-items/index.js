import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OrganizationNavItemsComponent extends Component {
  @service intl;
  @service me;
  @service organization;
  @service router;

  get tabs() {
    return [
      {
        label: this.intl.t('namespaces'),
        isActive: this.currentRoute === 'authenticated.organization.namespaces',
        route: 'authenticated.organization.namespaces',
        showCount: this.me.org.get('is_admin'),
        count: this.organization.selected.namespacesCount,
        icon: 'check-square',
        isEnabled: true,
      },
      {
        label: this.intl.t('members'),
        isActive: this.currentRoute === 'authenticated.organization.members',
        route: 'authenticated.organization.members',
        showCount: true,
        count: this.organization.selected.membersCount,
        icon: 'user-circle-o',
        isEnabled: this.me.org.get('is_admin'),
      },
      {
        label: this.intl.t('teams'),
        isActive: this.currentRoute === 'authenticated.organization.teams',
        route: 'authenticated.organization.teams',
        showCount: this.me.org.get('is_admin'),
        count: this.organization.selected.teamsCount,
        icon: 'sitemap',
        isEnabled: true,
      },
    ];
  }

  get currentRoute() {
    return this.router.currentRoute.name;
  }
}
