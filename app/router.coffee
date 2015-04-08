`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`

Router = Ember.Router.extend
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


`export default Router;`
