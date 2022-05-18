import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import * as chat from 'irene/utils/chat';
import { openKnowledgeBasePanel } from 'irene/utils/knowledge-base';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default class HomePageComponent extends Component {
  @service me;
  @service intl;
  @service ajax;
  @service session;
  @service organization;
  @service integration;
  @service notifications;

  @tracked isLoaded = false;
  @tracked isSecurityEnabled = false;
  @tracked isSecurityDashboard = false;
  @tracked isEmptyOrgName = this.checkIfOrgNameIsEmpty;
  @tracked isUpdatingOrg = false;

  showMarketplace = ENV.enableMarketplace;
  productVersion = ENV.productVersion;
  tSomethingWentWrong = this.intl.t('somethingWentWrong');
  tOrganizationNameUpdated = this.intl.t('organizationNameUpdated');

  constructor(...args) {
    super(...args);
    this.securityEnabled();
  }

  get showKnowledgeBase() {
    return this.integration.isDocument360Enabled();
  }

  get enablePendo() {
    return this.integration.isPendoEnabled();
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

  get showBilling() {
    const orgShowBilling = this.organization.selected.showBilling;
    const isOwner = this.me.org.get('is_owner');
    return orgShowBilling && isOwner;
  }

  get showPartnerDashboard() {
    return this.me.org.get('can_access_partner_dashboard');
  }

  /**
   * @property {Boolean} isShowAnalytics
   * Property to disable analytics page for member role
   */
  get isShowAnalytics() {
    return this.me.org.get('is_member') === false;
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
    triggerAnalytics('logout');
    this.session.invalidate();
  }

  @action openChatBox() {
    chat.openChatBox();
  }

  @action onOpenKnowledgeBase() {
    openKnowledgeBasePanel();
  }

  @task(function* () {
    this.isUpdatingOrg = true;
    const org = this.organization.selected;
    org.name = this.organizationName;
    yield org.save();

    try {
      this.notifications.success(this.tOrganizationNameUpdated);
      this.isEmptyOrgName = false;
      this.isUpdatingOrg = false;
    } catch (err) {
      let errMsg = this.tSomethingWentWrong;
      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.isEmptyOrgName = false;
      this.isUpdatingOrg = false;

      this.notifications.error(errMsg);
    }
  })
  updateOrgName;
}
