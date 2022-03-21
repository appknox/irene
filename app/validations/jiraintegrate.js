/* eslint-disable prettier/prettier */
import {
  validatePresence,
  validateFormat
} from 'ember-changeset-validations/validators';


export default {
  host: validateFormat({ type: 'url' }),
  username: validatePresence(true),
  password: validatePresence(true),
};
