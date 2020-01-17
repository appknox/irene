import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import { inject as service } from '@ember/service';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedBillingRoute = Route.extend(ScrollTopMixin, {
  title: `Billing${config.platform}`,
  organization: service('organization'),
  store: service('store'),
  showNotification: false,

  beforeModel(transition) {
    this.set('showNotification',!!transition.queryParams.success);
    const showPayment = this.get('organization.selected.showPayment');
    if(showPayment){
      this.transitionTo('authenticated.billing.plan');
    }
  },

  async model() {
    const organization = this.get('organization.selected');
    await this.get('store').findAll('pricing-plan');
    const activePlans = await this.get('store').peekAll('pricing-plan').filter((plan)=>{
      return plan.get('active') === true;
    });
    const showNotification = this.get('showNotification');
    const isJustifiedCenter = activePlans.get('length') <= 3;
    return {
      showBilling: organization.get('showBilling'),
      showPayment: organization.get('showPayment'),
      showNotification,
      hasPaymentHistory: false,
      plans: activePlans,
      isJustifiedCenter
    }
  }
});

export default AuthenticatedBillingRoute;
