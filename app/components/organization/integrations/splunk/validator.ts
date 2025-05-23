import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  instanceURL: validateFormat({ type: 'url' }),
  hec_token: validatePresence(true),
  api_token: validatePresence(true),
};
