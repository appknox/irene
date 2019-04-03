import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectsRoute = Route.extend(ScrollTopMixin,{
  title: `Projects${config.platform}`,
  model() {
    return this.get('store').query('organization-project', {limit:1, offset: 0});
  }
});

export default AuthenticatedProjectsRoute;
