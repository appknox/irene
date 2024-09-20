import {
  validatePresence,
  validateLength,
  validateConfirmation,
} from 'ember-changeset-validations/validators';

import validateEquality from 'irene/validations/common/value-equality';

export default {
  username: [
    validatePresence({ presence: true, ignoreBlank: true }),
    validateLength({ min: 3 }),
  ],
  password: [
    validatePresence({ presence: true, ignoreBlank: true }),
    validateLength({ min: 10 }),
  ],
  passwordConfirmation: validateConfirmation({ on: 'password' }),
  termsAccepted: validateEquality({
    expected: true,
    message: 'Please accept terms & conditions to proceed',
  }),
};
