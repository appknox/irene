import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectsRoute = Ember.Route.extend(ScrollTopMixin,

  {title: `Projects${config.platform}`});

export default AuthenticatedProjectsRoute;
