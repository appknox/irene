import {
  validateNumber
} from 'ember-changeset-validations/validators';


export default {
  filesToKeep: validateNumber({
    gte: 2,
    lte: 50,
    message: "Files to keep must be between 2 and 50"
  })
};
