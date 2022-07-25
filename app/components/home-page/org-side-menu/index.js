import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'irene/config/environment';

export default class HomePageSideMenuComponent extends Component {
  @service me;
  @service organization;
  @service integration;

  showMarketplace = ENV.enableMarketplace;
  productVersion = ENV.productVersion;

  /**
   * @property {Boolean} isShowAnalytics
   * Property to disable analytics page for member role
   */
  get isShowAnalytics() {
    return this.me.org.get('is_member') === false;
  }

  get showBilling() {
    const orgShowBilling = this.organization.selected.showBilling;
    const isOwner = this.me.org.get('is_owner');
    return orgShowBilling && isOwner;
  }

  get showPartnerDashboard() {
    return this.me.org.get('can_access_partner_dashboard');
  }

  get showProductionScanDashboard() {
    return this.organization.selected.features.app_monitoring;
  }

  get enablePendo() {
    return this.integration.isPendoEnabled();
  }
}
