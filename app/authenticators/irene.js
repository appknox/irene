import Base from 'ember-simple-auth/authenticators/base';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { Promise } from 'rsvp';
import { translationMacro as t } from 'ember-i18n';

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

  i18n: service(),
  ajax: service(),
  tServerReachFailed: t('serverReachFailed'),
  tInvalidAccountDetails: t('invalidAccountDetails'),

  resumeTransistion() {
    const authenticatedRoute = getOwner(this).lookup("route:authenticated");
    const lastTransition = authenticatedRoute.get("lastTransition");
    if (lastTransition !== null) {
      return lastTransition.retry();
    } else {
      const applicationRoute = getOwner(this).lookup("route:application");
      return applicationRoute.transitionTo(ENV['ember-simple-auth']["routeAfterAuthentication"]);
    }
  },

  authenticate(identification, password, otp, errorCallback, loginStatus) {
    const ajax = this.get("ajax");
    return new Promise((resolve, reject) => {
      const data = {
        username: identification,
        password,
        otp
      };
      const url = ENV['ember-simple-auth']['loginEndPoint'];
      ajax.post(url, {data})
      .then((data) => {
        data = processData(data);
        resolve(data);
        this.resumeTransistion();
      }, (error) => {
        loginStatus(false);
        errorCallback(error);
        this.get("notify").error(error.payload.message, {autoClear: false});
        for (error of error.errors) {
          if (error.status === "0") {
            return this.get("notify").error(this.get('tServerReachFailed'), ENV.notifications);
          }
          this.get("notify").error(this.get('tInvalidAccountDetails'), ENV.notifications);
        }
        return reject(error);
      });
    });
  },

  async restore(data) {
    const ajax = this.get("ajax");
    const url = ENV['ember-simple-auth']['checkEndPoint'];
    await ajax.post(url, {
      data:{},
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
