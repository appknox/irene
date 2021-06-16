import IreneAuth from './irene';
import ENV from 'irene/config/environment';
import { Promise } from 'rsvp';
import { getOwner } from '@ember/application';

const b64EncodeUnicode = (str) =>
  btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(`0x${p1}`)
    )
  );

const getB64Token = (user, token) => b64EncodeUnicode(`${user}:${token}`);

const processData = (data) => {
  data.b64token = getB64Token(data.user_id, data.token);
  return data;
};

export default IreneAuth.extend({
  authenticate(data) {
    return new Promise((resolve) => {
      data = processData(data);
      resolve(data);
      const applicationRoute = getOwner(this).lookup('route:application');
      return applicationRoute.transitionTo(
        ENV['ember-simple-auth']['routeAfterAuthentication']
      );
    });
  },
});
