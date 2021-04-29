import {
  helper
} from '@ember/component/helper';

export default helper(function plusOne(params /*, hash*/ ) {
  return isNaN(params[0]) ? params[0] : parseInt(params[0]) + 1;
});
