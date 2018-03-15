import Ember from 'ember';

// This function receives the params `params, hash`
const pageNumber = params => params[0] + 1;

const PageNumberHelper = Ember.Helper.helper(pageNumber);

export { pageNumber };

export default PageNumberHelper;
