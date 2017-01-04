import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';
import ENV from 'irene/config/environment';

var IreneAjaxService;

IreneAjaxService = AjaxService.extend({
  host: ENV.host,
  namespace: ENV.namespace,
  session: Ember.inject.service(),
  headers: Ember.computed('session.data.authenticated.b64token', {
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
