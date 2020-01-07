import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import { inject as service } from '@ember/service';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedBillingRoute = Route.extend(ScrollTopMixin, {
  title: `Billing${config.platform}`,
  organization: service('organization'),
  model() {
    const {showBilling} = this.get('organization.selected');
    return {
      showBilling,
      hasPaymentHistory: false
    }
  }
});

export default AuthenticatedBillingRoute;
