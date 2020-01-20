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
    const hasSuccessParameter = !!transition.queryParams.success;
    this.set('showNotification',hasSuccessParameter);
    const showPayment = this.get('organization.selected.showPayment');

    if(hasSuccessParameter){
      this.set('organization.selected.showPayment', true);
    }

    if(showPayment || hasSuccessParameter){
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
