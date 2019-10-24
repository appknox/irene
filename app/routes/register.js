import Route from '@ember/routing/route';
import ENV from 'irene/config/environment';

const RegisterRoute = Route.extend({
  title: 'Registration',
  beforeModel(){
    if(ENV.registrationLink) {
      window.location.href = ENV.registrationLink;
    }
  }
});

export default RegisterRoute;
