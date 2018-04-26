import {
  validatePresence,
  validateLength,
  validateConfirmation,
  validateFormat
} from 'ember-changeset-validations/validators';

export default {
  username: validatePresence(true),
  email: validateFormat({ type: 'email' }),
  company: validatePresence(true),
  password: [
    validatePresence(true),
    validateLength({ min: 6 })
  ],
  passwordConfirmation: validateConfirmation({ on: 'password' })
};
