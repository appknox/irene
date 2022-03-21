/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';

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

const FilterPlatformHelper = helper(filterPlatform);

export { filterPlatform, filterPlatformValues };

export default FilterPlatformHelper;
