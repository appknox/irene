import {
  validatePresence,
  validateNumber
} from 'ember-changeset-validations/validators';


export default {
  host: validatePresence({ presence: true, message: "Host can't be empty." }),
  port: [
    validatePresence({presence: true, on: 'host', message: "Port can't be empty"}),
    validateNumber({gte: 1, message: "Port must be greater than 0"})
  ]
};
