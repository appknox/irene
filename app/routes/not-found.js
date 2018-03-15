import Ember from 'ember';
import config from 'irene/config/environment';

const NotFoundRoute = Ember.Route.extend({
  title: `Not Found${config.platform}`,
  redirect() {
    const url = this.router.location.formatURL('/not-found');
    if (window.location.pathname !== url) {
      return this.transitionTo('/not-found');
    }
  }
});

export default NotFoundRoute;
