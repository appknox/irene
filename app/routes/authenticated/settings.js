/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedSettingsRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `Settings${config.platform}`,
  model() {
    return this.modelFor("authenticated");
  }
}
);

export default AuthenticatedSettingsRoute;
