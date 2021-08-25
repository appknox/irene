import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../mixins/scroll-top';
import { inject as service } from '@ember/service';

export default class AuthenticatedOrganizationRoute extends ScrollTopMixin(
  Route
) {
  @service me;
  @service organization;

  async model() {
    return {
      isAdmin: this.me.org.get('is_admin'),
      isOwner: this.me.org.get('is_owner'),
      orgName: this.organization.selected.name,
      organization: await this.get('organization.selected'),
    };
  }
}
