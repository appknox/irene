import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectSettingsRoute = Ember.Route.extend(ScrollTopMixin, {
  title: `Project Setting${config.platform}`,
  model: function(transition){
    return Ember.RSVP.hash({
      project: this.modelFor("authenticated.project"),
      organizations: this.get("store").query('organization', {id: null})
    });
  }
});


export default AuthenticatedProjectSettingsRoute;
