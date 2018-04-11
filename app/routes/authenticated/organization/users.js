import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedOrganizationUsersRoute = Ember.Route.extend(ScrollTopMixin, {
  title: `Users${config.platform}`
});

export default AuthenticatedOrganizationUsersRoute;
