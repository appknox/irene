import {
  validatePresence,
  validateFormat,
  validateNumber
} from 'ember-changeset-validations/validators';


export default {
  host: validateFormat({ type: 'url', message: 'Host must be valid url you know' }),
  port: [
    validatePresence({presence: true, on: 'host', message: "Port can't be empty"}),
    validateNumber({gte: 1, message: "Port must be greater than 0"})
  ]
};
