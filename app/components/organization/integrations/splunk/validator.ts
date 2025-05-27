import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  instance_url: validateFormat({ type: 'url' }),
  hec_token: validatePresence(true),
  api_token: validatePresence(true),
};
