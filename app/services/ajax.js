import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';
import ENV from 'irene/config/environment';

var IreneAjaxService;

IreneAjaxService = AjaxService.extend({
  namespace: ENV.namespace,
  session: Ember.inject.service(),
  headers: Ember.computed('session.data.b64token', {
    get() {
      debugger
      var token;
      token = this.get('session.data.b64token');
      return {
        'Authorization': "Basic " + token
      };
    }
  })
});

export default IreneAjaxService;
