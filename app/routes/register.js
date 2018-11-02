import config from 'irene/config/environment';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';

const RegisterRoute = Route.extend({
  title: `Register${config.platform}`,
  model() {
    return new RSVP.Promise(function(resolve){
      window.grecaptcha.ready(function(){
        resolve({});
      });
    });
  }
});

export default RegisterRoute;
