import Route from '@ember/routing/route';
import ENV from 'irene/config/environment';

export default class RegisterViaInviteRoute extends Route {
  beforeModel(){
    if(ENV.registrationLink) {
      window.location.href = ENV.registrationLink;
    }
  }
}
