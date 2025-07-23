import { validateFormat } from 'ember-changeset-validations/validators';

export default {
  email: validateFormat({ type: 'email' }),
};
