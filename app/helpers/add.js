/* eslint-disable prettier/prettier */
import {
  helper
} from '@ember/component/helper';

export default helper(function add(params /*, hash*/ ) {
  let result = null;
  if (params && !isNaN(params[0]) && !isNaN(params[1])) {
    result = params[0] + params[1];
  }
  return result;
});
