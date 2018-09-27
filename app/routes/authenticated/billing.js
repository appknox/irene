import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedBillingRoute = Ember.Route.extend(ScrollTopMixin, {
  title: `Billing${config.platform}`,
  organization: Ember.inject.service('organization'),
  model() {
    return this.get('organization.selected');
  }
});

export default AuthenticatedBillingRoute;
