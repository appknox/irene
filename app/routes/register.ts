import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RegisterViaInviteRoute extends Route {
  @service declare registration: any; //TODO: migrate registration service to ts

  beforeModel() {
    if (this.registration.isExternalLink()) {
      window.location.href = this.registration.link;
    }
  }
}
