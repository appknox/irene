import { validateNumber } from 'ember-changeset-validations/validators';

export default {
  filesToKeep: validateNumber({
    gte: 2,
    lte: 50,
    message: 'Value must be between 2 and 50',
  }),
};
