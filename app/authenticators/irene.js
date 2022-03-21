/* eslint-disable prettier/prettier, ember/no-get */
import Base from 'ember-simple-auth/authenticators/base';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';


const b64EncodeUnicode = str =>
  btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(`0x${p1}`))
  )
  ;

const getB64Token = (user, token) => b64EncodeUnicode(`${user}:${token}`);

const processData = (data) => {
  data.b64token = getB64Token(data.user_id, data.token);
  return data;
};

const IreneAuthenticator = Base.extend({

  ajax: service(),

  resumeTransistion() {
    const authenticatedRoute = getOwner(this).lookup("route:authenticated");
    const lastTransition = authenticatedRoute.get("lastTransition");
    if (lastTransition) {
      return lastTransition.retry();
    } else {
      const applicationRoute = getOwner(this).lookup("route:application");
      return applicationRoute.transitionTo(ENV['ember-simple-auth']["routeAfterAuthentication"]);
    }
  },

  async authenticate(identification, password, otp) {
    const ajax = this.get("ajax");
    const data = {
      username: identification,
      password,
      otp
    }
    const url = ENV['ember-simple-auth']['loginEndPoint'];
    return ajax.post(url, { data })
      .then(data => {
        data = processData(data);
        this.resumeTransistion();
        return data;
      });
  },

  async restore(data) {
    const ajax = this.get("ajax");
    const url = ENV['ember-simple-auth']['checkEndPoint'];
    await ajax.post(url, {
      data: {},
      headers: {
        'Authorization': `Basic ${data.b64token}`
      }
    })
    return data;
  },

  async invalidate() {
    const ajax = this.get("ajax");
    const url = ENV['ember-simple-auth']['logoutEndPoint'];
    await ajax.post(url);
    location.reload();
  }
});


export default IreneAuthenticator;
