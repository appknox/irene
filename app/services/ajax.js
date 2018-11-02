import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import AjaxService from 'ember-ajax/services/ajax';
import ENV from 'irene/config/environment';

var IreneAjaxService;

IreneAjaxService = AjaxService.extend({
  host: ENV.host,
  namespace: ENV.namespace,
  session: service(),
  headers: computed('session.data.authenticated.b64token', {
    get() {
      var token;
      token = this.get('session.data.authenticated.b64token');
      return {
        'Authorization': "Basic " + token,
        'X-Product': ENV.product
      };
    }
  })
});

export default IreneAjaxService;
