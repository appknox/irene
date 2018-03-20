import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedOrganizationTeamRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `Team${config.platform}`,
  model(params) {
    return this.get('store').find('team', params.teamId);
  }
}
);

export default AuthenticatedOrganizationTeamRoute;
