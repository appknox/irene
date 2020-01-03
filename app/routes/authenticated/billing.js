import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import { inject as service } from '@ember/service';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedBillingRoute = Route.extend(ScrollTopMixin, {
  title: `Billing${config.platform}`,
  organization: service('organization'),
  store: service('store'),
  showNotification: false,

  beforeModel: function(transition){
    this.set('showNotification',!!transition.queryParams.success);
  },

  async model() {
    const {showBilling} = this.get('organization.selected');
    const plans = await this.get('store').findAll('pricing-plan');
    const showNotification = this.get('showNotification');
    return {
      showBilling,
      showNotification,
      hasPaymentHistory: false,
      plans
    }
  }
});

export default AuthenticatedBillingRoute;
