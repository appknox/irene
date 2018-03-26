import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedOrganizationInvitationsRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `Invitations${config.platform}`,
  model() {
    return this.get('store').findAll('invitation');
  }
}
);

export default AuthenticatedOrganizationInvitationsRoute;
