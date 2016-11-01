import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';
import ENV from 'irene/config/environment';

var IreneAjaxService;

IreneAjaxService = AjaxService.extend({
  namespace: '/api',
  session: Ember.inject.service(),
  headers: Ember.computed('session.data.b64token', {
    get() {
      var token;
      token = this.get('session.data.b64token');
      return {
        'Authorization': "Basic " + token
      };
    }
  })
  namespace: ENV.namespace,
});

export default IreneAjaxService;
