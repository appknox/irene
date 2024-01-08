import { validatePresence } from 'ember-changeset-validations/validators';
import validateEquality from 'irene/validations/common/value-equality';

export default {
  username: validatePresence(true),
  termsAccepted: validateEquality({
    expected: true,
    message: 'Please accept terms & conditions to proceed',
  }),
};
