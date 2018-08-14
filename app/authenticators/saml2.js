import Ember from 'ember';
import IreneAuth from './irene';
import ENV from 'irene/config/environment';

const b64EncodeUnicode = str => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(`0x${p1}`)));

const getB64Token = (user, token) => b64EncodeUnicode(`${user}:${token}`);

const processData = data => {
  data.b64token = getB64Token(data.user_id, data.token);
  return data;
};

export default IreneAuth.extend({
  authenticate(ssotoken) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const url = ENV['endpoints']['saml2Login'];
      this.get("ajax").post(
        url, { data: {token: ssotoken}}
      ).then((data) => {
        data = processData(data);
        resolve(data);
        this.resumeTransistion();
      }, (error) => {
        this.get("notify").error(error.payload.message, ENV.notifications);
        for (error of error.errors) {
          if (error.status === "0") {
            this.get("notify").error("Unable to reach server. Please try after sometime", ENV.notifications);
          }
        }
        return reject(error);
      });
    });
  }
});
