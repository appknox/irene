import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedOrganizationRoute = Ember.Route.extend(ScrollTopMixin, {
  title: `Organization${config.platform}`,
  model(){
    return this.get('store').findAll('organization');
  }
});

export default AuthenticatedOrganizationRoute;
