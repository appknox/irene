/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectFilesRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `All Files${config.platform}`,
  model() {
    return this.modelFor("authenticated.project");
  }
}
);

export default AuthenticatedProjectFilesRoute;
