import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedOrganizationTeamsRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `Teams${config.platform}`,
  model() {
    return this.get('store').findAll('team');
  }
}
);

export default AuthenticatedOrganizationTeamsRoute;
