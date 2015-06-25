`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`
`import CancelTour from 'ember-onboarding/mixins/onboard-router';`

Router = Ember.Router.extend CancelTour,
  location: ENV.locationType

Router.map ->
  @route "login"

  @resource 'project', path: 'projects/:project_id', ->
    @route 'files'
    @route 'settings'

  @resource 'file', path: 'files/:file_id', ->

  @route 'pricing'

  @resource 'reset', path: 'reset/:uuid/:token'

  @route 'recover'
  @route 'paypal_return'
  @route 'paypal_cancel'

  @route 'choose', path: 'choose/:file_id'
  @route 'compare', path: 'compare/:file_id_1/:file_id_2'

`export default Router;`
