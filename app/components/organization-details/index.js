import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const tabRouteNameMap = {
  namespaces: 0,
  users: 1,
  teams: 2,
  team: 2,
  settings: 3,
};

class OrganizationDetails extends Component {
  @service intl;
  @service me;
  @service organization;
  @service router;
  @service('notifications') notify;

  @tracked activeTab = 0;
  @tracked showAddPopup = false;

  constructor() {
    super(...arguments);

    const route = this.router.currentRouteName;
    const routeName = route.split('.')[2];

    this.activeTab = tabRouteNameMap[routeName] || 0;
  }

  @action routeToOrgSettings() {
    this.router.transitionTo('authenticated.organization-settings');
  }

  get orgNameDoesNotExist() {
    return this.organization.selected.name === '';
  }

  @action
  addOrganizationName() {
    this.showAddPopup = true;
  }

  @action
  closeAddPopup() {
    this.showAddPopup = false;
  }

  /* Set active tab */
  get namespaceClass() {
    return this.activeTab === 0 ? 'active' : '';
  }

  get memberClass() {
    return this.activeTab === 1 ? 'active' : '';
  }

  get teamClass() {
    return this.activeTab === 2 ? 'active' : '';
  }

  get settingsClass() {
    return this.activeTab === 3 ? 'active' : '';
  }

  /* Select tab */
  @action
  displayNamespaces() {
    this.activeTab = 0;
  }

  @action
  displayMembers() {
    this.activeTab = 1;
  }

  @action
  displayTeams() {
    this.activeTab = 2;
  }

  @action
  displaySettings() {
    this.activeTab = 3;
  }
}

export default OrganizationDetails;
