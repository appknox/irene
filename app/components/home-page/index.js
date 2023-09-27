import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default class HomePageComponent extends Component {
  @service me;
  @service intl;
  @service ajax;
  @service session;
  @service organization;
  @service integration;
  @service notifications;
  @service freshdesk;

  @tracked isLoaded = false;
  @tracked isSecurityEnabled = false;
  @tracked isSecurityDashboard = false;
  @tracked isEmptyOrgName = this.checkIfOrgNameIsEmpty;
  @tracked showAddEditModal = this.isEmptyOrgName;

  tSomethingWentWrong = this.intl.t('somethingWentWrong');
  tOrganizationNameUpdated = this.intl.t('organizationNameUpdated');

  constructor(...args) {
    super(...args);
    this.securityEnabled();
  }

  get checkIfOrgNameIsEmpty() {
    const organization = this.organization;
    const isOwner = this.me.org.get('is_owner');

    if (isOwner) {
      const orgName = organization.selected.name;
      if (!orgName) {
        return true;
      }
    }

    return false;
  }

  @action securityEnabled() {
    this.ajax
      .request('projects', {
        namespace: 'api/hudson-api',
      })
      .then(
        () => {
          this.isSecurityEnabled = true;
          this.securityDashboard();
        },
        () => {
          this.isSecurityEnabled = false;
          this.securityDashboard();
        }
      );
  }

  @action securityDashboard() {
    if (window.location.pathname.startsWith('/security')) {
      const isSecurityEnabled = this.isSecurityEnabled;
      if (isSecurityEnabled) {
        this.isSecurityDashboard = true;
      } else {
        this.getOwner(this)
          .lookup('route:authenticated')
          .transitionTo('authenticated.projects');
      }
      this.isLoaded = true;
    } else {
      this.isLoaded = true;
    }
  }

  @action invalidateSession() {
    this.freshdesk.logUserOutOfSupportWidget();
    triggerAnalytics('logout');
    this.session.invalidate();
  }

  @action
  handleCancel() {
    this.showAddEditModal = false;
  }
}
