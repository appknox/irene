/* eslint-disable prettier/prettier */
import {
  validatePresence,
  validateNumber
} from 'ember-changeset-validations/validators';


export default {
  host: validatePresence({
    presence: true,
    message: 'Host can\'t be empty',
    on: 'port'
  }),
  port: [
    validatePresence({
      presence: true,
      on: 'host',
      message: 'Port can\'t be empty'
    }),
    validateNumber({
      gt: 0,
      lte: 65535,
      message: 'Port must be in the range 1 - 65535'
    })
  ],
  enabled:  validatePresence({
    presence: true, message: 'Enabled is a required field',
    on: ['port', 'host']
  })
};
