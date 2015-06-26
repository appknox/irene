`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`
`import CancelTour from 'ember-onboarding/mixins/onboard-router';`

Router = Ember.Router.extend CancelTour,
  location: ENV.locationType

Router.map ->
  @route "login"

  @resource 'project', path: 'projects/:projectId', ->
    @route 'files'
    @route 'settings'

  @resource 'file', path: 'files/:fileId', ->

  @route 'pricing'

  @resource 'reset', path: 'reset/:uuid/:token'

  @route 'recover'
  @route 'paypal_return'
  @route 'paypal_cancel'

  @route 'choose', path: 'choose/:fileId'
  @route 'compare', path: 'compare/:fileId1/:fileId2'

`export default Router;`
