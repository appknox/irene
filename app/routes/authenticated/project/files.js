import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectFilesRoute = Route.extend(ScrollTopMixin, {

  title: `All Files${config.platform}`,
  model() {
    return this.modelFor("authenticated.project");
  }
}
);

export default AuthenticatedProjectFilesRoute;
