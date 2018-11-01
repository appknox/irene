import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedOrganizationRoute = Route.extend(ScrollTopMixin, {
  title: `Organization${config.platform}`
});

export default AuthenticatedOrganizationRoute;
