import {
  validatePresence,
  validateLength,
  validateConfirmation,
  validateFormat
} from 'ember-changeset-validations/validators';
import validateEquality from './validators/value-equality';


export default {
  username: validatePresence(true),
  email: validateFormat({ type: 'email' }),
  company: validatePresence(true),
  password: [
    validatePresence(true),
    validateLength({ min: 6 })
  ],
  passwordConfirmation: validateConfirmation({ on: 'password' }),
  termsAccepted: validateEquality({
    expected: true,
    message: 'Please accept terms & conditions to proceed'
  })
};
