import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import ENV from 'irene/config/environment';

const RegisterRoute = Route.extend({
  title: 'Registration',
  beforeModel(){
    if(ENV.registrationLink) {
      window.location.href = ENV.registrationLink;
    }
  },
  model() {
    return new RSVP.Promise(function(resolve){
      window.grecaptcha.ready(function(){
        resolve({});
      });
    });
  }
});

export default RegisterRoute;
