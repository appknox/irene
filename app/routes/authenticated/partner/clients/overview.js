import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

export default class AuthenticatedPartnerClientsOverviewRoute extends Route {
  @service me;

  beforeModel() {
    if (!this.get("me.org.can_access_partner_dashboard")) {
      this.transitionTo("authenticated.projects");
    }
  }
}
