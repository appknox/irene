import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedOrganizationTeamRoute = Ember.Route.extend(ScrollTopMixin, {
  title: `Team${config.platform}`,
  model: function(params, transition){
    return Ember.RSVP.hash({
      team: params,
      organization: transition.params["authenticated.organization"]
    });
  }
});

export default AuthenticatedOrganizationTeamRoute;
