import {
  validateFormat,
  validatePresence
} from 'ember-changeset-validations/validators';


export default {
  firstName: validatePresence(true),
  email: validateFormat({
    type: 'email'
  }),
  company: validatePresence(true)
};
