import { helper } from '@ember/component/helper';

export function isEqualTo([leftSide, rightSide]) {
  return leftSide === rightSide;
}

export default helper(isEqualTo);
