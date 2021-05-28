import Route from "@ember/routing/route";

export default class AuthenticatedPartnerClientsIndexRoute extends Route {
  beforeModel() {
    return this.replaceWith("authenticated.partner.clients.overview");
  }
}
