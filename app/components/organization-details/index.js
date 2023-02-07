import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

class OrganizationDetails extends Component {
  @service intl;
  @service me;
  @service organization;
  @service router;
  @service('notifications') notify;

  get isAdmin() {
    return this.me.org.get('is_admin');
  }

  get tabItems() {
    return [
      {
        id: 'namespaces',
        route: 'authenticated.organization.namespaces',
        badgeCount: this.organization.selected.namespacesCount,
        hasBadge: this.isAdmin,
        label: this.intl.t('namespaces'),
        iconName: 'assignment',
      },
      {
        id: 'users',
        route: 'authenticated.organization.users',
        hidden: !this.isAdmin,
        badgeCount: this.organization.selected.membersCount,
        hasBadge: true,
        label: this.intl.t('users'),
        iconName: 'people',
      },
      {
        id: 'teams',
        route: 'authenticated.organization.teams',
        badgeCount: this.organization.selected.teamsCount,
        hasBadge: this.isAdmin,
        label: this.intl.t('teams'),
        iconName: 'groups',
      },
    ];
  }

  @action routeToOrgSettings() {
    this.router.transitionTo('authenticated.organization-settings');
  }
}

export default OrganizationDetails;
