import Ember from 'ember';

const SEPERATOR = "-";
// This function receives the params `params, hash`
const filterPlatform = function(params) {
  const sortingKeyObject = params[0];
  return `${sortingKeyObject.key}${SEPERATOR}${sortingKeyObject.reverse}`;
};

const filterPlatformValues = function(value) {
  let [key, reverse] = value.split(SEPERATOR);
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
