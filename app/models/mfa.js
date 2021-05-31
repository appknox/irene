import Model, { attr }  from '@ember-data/model';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';


export default Model.extend({
  method: attr('string'),
  enabled: attr('boolean'),

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
