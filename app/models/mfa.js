import DS from 'ember-data';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';


export default DS.Model.extend({
  method: DS.attr('string'),
  enabled: DS.attr('boolean'),

  display: computed('method', function () {
    const mfaMethod = this.get('method');
    const MFA_METHODS = {
      [ENUMS.MFA_METHOD.TOTP]: 'Authenticator App',
      [ENUMS.MFA_METHOD.HOTP]: 'Email',
    }
    return MFA_METHODS[mfaMethod] || '';
  }),

  isEmail: computed('method', function () {
    return +this.get('method') == ENUMS.MFA_METHOD.HOTP
  }),

  isApp: computed('method', function () {
    return +this.get('method') == ENUMS.MFA_METHOD.TOTP
  }),

});
