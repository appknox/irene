import {
  validatePresence,
  validateLength,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  email: validateFormat({ type: 'email' }),
  company: [validatePresence(true), validateLength({ max: 255 })],
  first_name: validateLength({ allowBlank: true, max: 150 }),
  last_name: validateLength({ allowBlank: true, max: 150 }),
};
