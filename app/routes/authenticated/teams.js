/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedTeamsRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `Teams${config.platform}`,
  model(params) {
    return this.get('store').findAll('team');
  }
}
);

export default AuthenticatedTeamsRoute;
