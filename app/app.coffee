`import Ember from 'ember';`
`import Resolver from 'ember/resolver';`
`import loadInitializers from 'ember/load-initializers';`
`import ENV from 'irene/config/environment';`
# `import Pretender from 'pretender';`
`import serverRoutes from 'irene/server-routes';`

if ENV.usePretender
  server = new Pretender serverRoutes

  server.unhandledRequest = (verb, path, request)->
    console.warn "unhandledRequest"
    debugger

  server.erroredRequest = (verb, path, request, error)->
    console.warn "erroredRequest"
    debugger

Ember.$.ajaxSetup
  type: "POST"
  data: {}
  dataType: 'json'
  xhrFields:
    withCredentials: true
  crossDomain: true

Ember.MODEL_FACTORY_INJECTIONS = true

App = Ember.Application.extend
  modulePrefix: ENV.modulePrefix
  podModulePrefix: ENV.podModulePrefix
  Resolver: Resolver
  Socket: EmberSockets.extend
    host: ENV.socketHost
    port: ENV.socketPort
    secure: ENV.socketSecure
    controllers: ['application']
    autoConnect: true

loadInitializers App, ENV.modulePrefix

`export default App;`
