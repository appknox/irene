`import Ember from 'ember';`
`import Resolver from 'ember/resolver';`
`import loadInitializers from 'ember/load-initializers';`
`import config from './config/environment';`
`import Pretender from 'pretender';`
`import serverRoutes from './server-routes'`

if config.usePretender
  server = new Pretender serverRoutes

  server.unhandledRequest = (verb, path, request)->
    console.warn "unhandledRequest"
    debugger

  server.erroredRequest = (verb, path, request, error)->
    console.warn "erroredRequest"
    debugger

Ember.MODEL_FACTORY_INJECTIONS = true

App = Ember.Application.extend
  modulePrefix: config.modulePrefix
  podModulePrefix: config.podModulePrefix
  Resolver: Resolver

loadInitializers App, config.modulePrefix

`export default App;`
