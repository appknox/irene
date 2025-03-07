import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  instanceURL: validateFormat({ type: 'url' }),
  username: validatePresence(true),
  password: validatePresence(true),
};
