import Ember from 'ember';
import config from 'irene/config/environment';
import RSVP from 'rsvp';

const RegisterRoute = Ember.Route.extend({
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
