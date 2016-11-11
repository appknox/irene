`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`

Router = Ember.Router.extend
  location: ENV.locationType
  rootURL: ENV.rootURL

Router.map ->
  @route 'freestyle'
  @route 'login'
  @route 'authenticated', path: '/', ->
    @route "index", path: '/'
    @route "settings"
    @route "pricing"
    @route "project", path: '/project/:projectId', ->
      @route 'settings'
      @route 'files'
    @route "file", path: '/file/:fileId'
    @route "choose",path: '/choose/:fileId'
    @route 'compare', path: '/compare/:files'
  @route 'recover'
  @route 'reset'

`export default Router;`
