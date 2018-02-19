import Ember from 'ember';

// This function receives the params `params, hash`
const paginateClass = function(params) {

  const [offset, page] = params;
  if (offset === page) {
    return "is-primary";
  } else {
    return "is-default";
  }
};

const PaginateClassHelper = Ember.Helper.helper(paginateClass);

export { paginateClass };

export default PaginateClassHelper;
