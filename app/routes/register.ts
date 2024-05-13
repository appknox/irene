import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RegistrationService from 'irene/services/registration';

export default class RegisterViaInviteRoute extends Route {
  @service declare registration: RegistrationService;

  beforeModel() {
    if (this.registration.isExternalLink()) {
      window.location.href = this.registration.link;
    }
  }
}
