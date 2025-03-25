import { helper } from '@ember/component/helper';

export function add(params: [number, number]) {
  let result = null;

  if (params && !isNaN(params[0]) && !isNaN(params[1])) {
    result = params[0] + params[1];
  }

  return result;
}

const addHelper = helper(add);

export default addHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    add: typeof addHelper;
  }
}
