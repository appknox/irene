import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';;
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
});

export default IreneAjaxService;
