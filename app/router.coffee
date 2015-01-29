`import Ember from 'ember';`
`import config from './config/environment';`

Router = Ember.Router.extend
  location: config.locationType

Router.map ->
  @route "login"

  @resource 'project', path: 'projects/:project_id', ->

  @resource 'file', path: 'files/:file_id', ->

  @route 'pricing'

  @resource 'reset', path: 'reset/:uuid/:token'

`export default Router;`
