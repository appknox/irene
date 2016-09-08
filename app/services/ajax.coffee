`import Ember from 'ember'`
`import AjaxService from 'ember-ajax/services/ajax';`

IreneAjaxService = AjaxService.extend
  namespace: '/api'
  session: Ember.inject.service()
  headers: Ember.computed 'session.data.b64token',
    get: ->
      token = @get 'session.data.b64token'
      {'Authorization': "Basic #{token}"}

`export default IreneAjaxService`
