import { helper } from '@ember/component/helper';

 export const TOKEN_SYMBOL = Symbol('Scroll Token');

 export function isToken(token) {
  return token && token[TOKEN_SYMBOL];
}

 export function scrollTo(params/*, hash*/) {
  let token = {};
  token[TOKEN_SYMBOL] = true;

  token.target = params[0];
  token.duration = params[1];

   return token;
}

 export default helper(scrollTo);
