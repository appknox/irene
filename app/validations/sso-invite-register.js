/* eslint-disable prettier/prettier */
import {
  validatePresence,
} from 'ember-changeset-validations/validators';
import validateEquality from './validators/value-equality';


export default {
  username: validatePresence(true),
  termsAccepted: validateEquality({
    expected: true,
    message: 'Please accept terms & conditions to proceed'
  })
};
