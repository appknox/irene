import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectsRoute = Ember.Route.extend(ScrollTopMixin,{
  title: `Projects${config.platform}`,
  model() {
    return this.get('store').query('OrganizationProject', {limit:1, offset: 0});
  }
});

export default AuthenticatedProjectsRoute;
