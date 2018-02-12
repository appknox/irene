/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';

const SEPERATOR = "-";
// This function receives the params `params, hash`
const filterPlatform = function(params) {
  const sortingKeyObject = params[0];
  return `${sortingKeyObject.key}${SEPERATOR}${sortingKeyObject.reverse}`;
};

const filterPlatformValues = function(value) {
  let [key, reverse] = Array.from(value.split(SEPERATOR));
  if (reverse === "true") {
    reverse = true;
  } else {
    reverse = false;
  }
  return [key, reverse];
};

const FilterPlatformHelper = Ember.Helper.helper(filterPlatform);

export { filterPlatform, filterPlatformValues };

export default FilterPlatformHelper;
