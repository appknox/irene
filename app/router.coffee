`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`

Router = Ember.Router.extend
  location: ENV.locationType

Router.map ->
  @route 'freestyle'
  @route 'login'
  @route 'authenticated', path: '/', ->
    @route "index", path: '/'
    @route "settings", path:'/settings'
    @route "pricing", path: '/pricing'
    @route "project", path: '/project'
    @route "file", path: '/file'
    @route "files", path: '/files'
    @route "vulnerability", path: '/vulnerability'

`export default Router;`
