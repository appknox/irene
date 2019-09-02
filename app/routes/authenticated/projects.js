import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectsRoute = Route.extend(ScrollTopMixin,{
  title: `Projects${config.platform}`,
  model() {
    return this.get('store').findAll('Project');
  }
});

export default AuthenticatedProjectsRoute;
