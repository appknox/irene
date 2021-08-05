import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../mixins/scroll-top';
import { inject as service } from '@ember/service';

export default class AuthenticatedOrganizationRoute extends ScrollTopMixin(
  Route
) {
  @service me;
  @service organization;

  model() {
    return {
      isAdmin: this.me.org.get('is_admin'),
      orgName: this.organization.selected.name,
    };
  }
}
