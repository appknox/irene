import Ember from "ember";

export function isEqualTo([leftSide, rightSide]) {
  return leftSide === rightSide;
}

export default Ember.Helper.helper(isEqualTo);
