/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Base from 'ember-simple-auth/authorizers/base';
import ENV from 'irene/config/environment';


const IreneAuthorizer = Base.extend({

  authorize(data, block){
    block('Authorization', `Basic ${data.b64token}`);
    return block('X-Product', ENV.product);
  }
});


export default IreneAuthorizer;
