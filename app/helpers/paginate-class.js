/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';

// This function receives the params `params, hash`
const paginateClass = function(params) {

  const [offset, page] = Array.from(params);
  if (offset === page) {
    return "is-primary";
  } else {
    return "is-default";
  }
};

const PaginateClassHelper = Ember.Helper.helper(paginateClass);

export { paginateClass };

export default PaginateClassHelper;
